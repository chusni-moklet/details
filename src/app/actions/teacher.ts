"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { SkillLevel, PortfolioType } from "@/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

// ─── helpers ────────────────────────────────────────────────────────────────

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

async function getTeacherId(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("teachers")
    .select("id")
    .eq("user_id", userId)
    .single();
  return (data as { id: string } | null)?.id ?? null;
}

// Bypass Supabase generic inference for insert/update on typed tables
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: SupabaseClient, table: string): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(table);
}

// ─── teacher profile ────────────────────────────────────────────────────────

export async function updateTeacherProfile(formData: FormData) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const deptId = formData.get("department_id") as string | null;

  const updates = {
    full_name:     formData.get("full_name") as string,
    nickname:      (formData.get("nickname") as string)  || null,
    bio:           (formData.get("bio") as string)       || null,
    motto:         (formData.get("motto") as string)     || null,
    subject:       (formData.get("subject") as string)   || null,
    experience:    formData.get("experience") ? Number(formData.get("experience")) : null,
    department_id: deptId && deptId !== "none" ? deptId : null,
    linkedin:      (formData.get("linkedin") as string)  || null,
    github:        (formData.get("github") as string)    || null,
    website:       (formData.get("website") as string)   || null,
    instagram:     (formData.get("instagram") as string) || null,
  };

  const { error } = await db(supabase, "teachers")
    .update(updates)
    .eq("user_id", user.id);

  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function updateTeacherPhoto(photoUrl: string) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const { error } = await db(supabase, "teachers")
    .update({ photo_url: photoUrl })
    .eq("user_id", user.id);

  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/dashboard");
  return { success: true };
}

// ─── skills ─────────────────────────────────────────────────────────────────

export async function addSkill(formData: FormData) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const teacherId = await getTeacherId(supabase, user.id);
  if (!teacherId) return { error: "Teacher not found" };

  const { error } = await db(supabase, "skills").insert({
    teacher_id: teacherId,
    skill_name: formData.get("skill_name") as string,
    level:      formData.get("level") as SkillLevel,
  });

  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function deleteSkill(skillId: string) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const teacherId = await getTeacherId(supabase, user.id);
  if (!teacherId) return { error: "Teacher not found" };

  const { error } = await supabase
    .from("skills")
    .delete()
    .eq("id", skillId)
    .eq("teacher_id", teacherId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/profile");
  return { success: true };
}

// ─── certifications ──────────────────────────────────────────────────────────

export async function addCertification(formData: FormData) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const teacherId = await getTeacherId(supabase, user.id);
  if (!teacherId) return { error: "Teacher not found" };

  const { error } = await db(supabase, "certifications").insert({
    teacher_id:     teacherId,
    title:          formData.get("title") as string,
    issuer:         formData.get("issuer") as string,
    issue_date:     formData.get("issue_date") as string,
    expired_date:   (formData.get("expired_date") as string) || null,
    credential_url: (formData.get("credential_url") as string) || null,
    file_url:       (formData.get("file_url") as string) || null,
    is_verified:    false,
  });

  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/dashboard/certifications");
  return { success: true };
}

export async function deleteCertification(certId: string) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const teacherId = await getTeacherId(supabase, user.id);
  if (!teacherId) return { error: "Teacher not found" };

  const { error } = await supabase
    .from("certifications")
    .delete()
    .eq("id", certId)
    .eq("teacher_id", teacherId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/certifications");
  return { success: true };
}

// ─── portfolio ───────────────────────────────────────────────────────────────

export async function addPortfolio(formData: FormData) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const teacherId = await getTeacherId(supabase, user.id);
  if (!teacherId) return { error: "Teacher not found" };

  const { error } = await db(supabase, "portfolios").insert({
    teacher_id:  teacherId,
    title:       formData.get("title") as string,
    description: formData.get("description") as string,
    media_url:   (formData.get("media_url") as string) || null,
    type:        formData.get("type") as PortfolioType,
  });

  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/dashboard/portfolio");
  return { success: true };
}

export async function deletePortfolio(portfolioId: string) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const teacherId = await getTeacherId(supabase, user.id);
  if (!teacherId) return { error: "Teacher not found" };

  const { error } = await supabase
    .from("portfolios")
    .delete()
    .eq("id", portfolioId)
    .eq("teacher_id", teacherId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/portfolio");
  return { success: true };
}

// ─── achievements ────────────────────────────────────────────────────────────

export async function addAchievement(formData: FormData) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const teacherId = await getTeacherId(supabase, user.id);
  if (!teacherId) return { error: "Teacher not found" };

  const { error } = await db(supabase, "achievements").insert({
    teacher_id:  teacherId,
    title:       formData.get("title") as string,
    year:        Number(formData.get("year")),
    description: (formData.get("description") as string) || "",
  });

  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/dashboard/achievements");
  return { success: true };
}

export async function deleteAchievement(achievementId: string) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const teacherId = await getTeacherId(supabase, user.id);
  if (!teacherId) return { error: "Teacher not found" };

  const { error } = await supabase
    .from("achievements")
    .delete()
    .eq("id", achievementId)
    .eq("teacher_id", teacherId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/achievements");
  return { success: true };
}

// ─── teacher creation ────────────────────────────────────────────────────────

export async function createTeacherProfile(userId: string, fullName: string) {
  const { supabase } = await getAuthUser();

  const baseSlug = slugify(fullName);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data } = await supabase
      .from("teachers")
      .select("id")
      .eq("slug", slug)
      .single();
    if (!data) break;
    slug = `${baseSlug}-${counter++}`;
  }

  const { error } = await db(supabase, "teachers").insert({
    user_id:   userId,
    slug,
    full_name: fullName,
  });

  if (error) return { error: (error as { message: string }).message };
  return { success: true, slug };
}

// ─── admin actions ───────────────────────────────────────────────────────────

export async function verifyCertification(certId: string, verified: boolean) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (userData as { role: string } | null)?.role;
  if (!role || !["super_admin", "admin_jurusan"].includes(role)) {
    return { error: "Unauthorized" };
  }

  const { error } = await db(supabase, "certifications")
    .update({ is_verified: verified })
    .eq("id", certId);

  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/admin/certifications");
  return { success: true };
}

export async function adminDeleteTeacher(teacherId: string) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/auth/login");

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (userData as { role: string } | null)?.role;
  if (role !== "super_admin") return { error: "Unauthorized" };

  const { error } = await supabase.from("teachers").delete().eq("id", teacherId);
  if (error) return { error: error.message };

  revalidatePath("/admin/teachers");
  return { success: true };
}
