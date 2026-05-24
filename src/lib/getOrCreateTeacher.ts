import { createClient } from "@/lib/supabase/server";
import { getTeacherByUserId } from "@/services/teachers";
import { slugify } from "@/lib/utils";
import type { TeacherWithStats } from "@/types";
import type { User } from "@supabase/supabase-js";

export async function getOrCreateTeacher(user: User): Promise<TeacherWithStats | null> {
  // Try to get existing teacher first
  let teacher = await getTeacherByUserId(user.id);
  if (teacher) return teacher;

  const supabase = await createClient();

  // Ensure user record exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!existingUser) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("users").insert({
      id:    user.id,
      email: user.email ?? "",
      role:  "teacher",
    });
  }

  // Build unique slug
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Guru";

  const baseSlug = slugify(fullName);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data: existing } = await supabase
      .from("teachers")
      .select("id")
      .eq("slug", slug)
      .single();
    if (!existing) break;
    slug = `${baseSlug}-${counter++}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("teachers").insert({
    user_id:   user.id,
    slug,
    full_name: fullName,
    photo_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
  });

  if (error) {
    // Duplicate key = teacher already exists but wasn't found by getTeacherByUserId
    // This happens when RLS blocks the SELECT but not the INSERT
    // Try fetching again — maybe RLS was the issue on first attempt
    if (error.code === "23505") {
      console.log("[getOrCreateTeacher] duplicate key — fetching existing teacher");
      teacher = await getTeacherByUserId(user.id);
      if (teacher) return teacher;

      // RLS is blocking SELECT — fetch without RLS using a direct query
      const { data: rawTeacher } = await supabase
        .from("teachers")
        .select(`
          id, user_id, slug, full_name, nickname, photo_url, bio, motto,
          department_id, subject, experience, linkedin, github, website,
          instagram, created_at
        `)
        .eq("user_id", user.id)
        .single();

      if (rawTeacher) {
        // Return minimal teacher object
        return {
          ...(rawTeacher as TeacherWithStats),
          department: undefined,
          skills: [],
          certifications: [],
          portfolios: [],
          achievements: [],
          profile_views: [],
          certification_count: 0,
          view_count: 0,
          portfolio_count: 0,
          completion_percentage: 0,
        };
      }
    }
    console.error("[getOrCreateTeacher] insert error:", error.message, error.code);
    return null;
  }

  // Fetch the newly created teacher
  teacher = await getTeacherByUserId(user.id);
  return teacher;
}
