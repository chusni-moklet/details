import { createClient } from "@/lib/supabase/server";
import { calculateProfileCompletion } from "@/lib/utils";
import type { TeacherFilters, TeacherWithStats } from "@/types";

// Raw shape returned by Supabase join queries
interface TeacherRow {
  id: string;
  user_id: string;
  slug: string;
  full_name: string;
  nickname: string | null;
  photo_url: string | null;
  bio: string | null;
  motto: string | null;
  department_id: string | null;
  subject: string | null;
  experience: number | null;
  linkedin: string | null;
  github: string | null;
  website: string | null;
  instagram: string | null;
  created_at: string;
  department: { id: string; name: string; icon: string } | null;
  skills: Array<{ id: string; teacher_id: string; skill_name: string; level: "beginner" | "intermediate" | "advanced" | "expert" }>;
  certifications: Array<{ id: string; teacher_id: string; title: string; issuer: string; issue_date: string; expired_date: string | null; credential_url: string | null; file_url: string | null; is_verified: boolean }>;
  portfolios: Array<{ id: string; teacher_id: string; title: string; description: string; media_url: string | null; type: "project" | "publication" | "award" | "other"; created_at: string }>;
  achievements: Array<{ id: string; teacher_id: string; title: string; year: number; description: string }>;
  profile_views: Array<{ id: string }>;
}

function toTeacherWithStats(t: TeacherRow): TeacherWithStats {
  return {
    ...t,
    // department can be null from DB but TeacherWithStats expects undefined
    department: t.department ?? undefined,
    certification_count: t.certifications?.length ?? 0,
    view_count: t.profile_views?.length ?? 0,
    portfolio_count: t.portfolios?.length ?? 0,
    completion_percentage: calculateProfileCompletion({
      photo_url: t.photo_url,
      bio: t.bio,
      motto: t.motto,
      subject: t.subject,
      experience: t.experience,
      linkedin: t.linkedin,
      skills: t.skills,
      certifications: t.certifications,
      portfolios: t.portfolios,
    }),
  };
}

export async function getTeachers(
  filters: TeacherFilters = {},
  page = 1,
  limit = 12
): Promise<{ teachers: TeacherWithStats[]; total: number }> {
  const supabase = await createClient();
  const offset = (page - 1) * limit;

  let query = supabase
    .from("teachers")
    .select(
      `id, user_id, slug, full_name, nickname, photo_url, bio, motto,
       department_id, subject, experience, linkedin, github, website,
       instagram, created_at,
       department:departments(id, name, icon),
       skills(id, teacher_id, skill_name, level),
       certifications(id, is_verified),
       portfolios(id),
       profile_views(id)`,
      { count: "exact" }
    )
    .range(offset, offset + limit - 1);

  if (filters.query) {
    query = query.or(
      `full_name.ilike.%${filters.query}%,subject.ilike.%${filters.query}%,bio.ilike.%${filters.query}%`
    );
  }

  if (filters.department_id && filters.department_id !== "all") {
    query = query.eq("department_id", filters.department_id);
  }

  switch (filters.sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("full_name", { ascending: true });
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching teachers:", error.message, error.code, error.details);
    return { teachers: [], total: 0 };
  }

  const teachers = ((data ?? []) as unknown as TeacherRow[]).map(toTeacherWithStats);

  if (filters.sort === "certifications") {
    teachers.sort((a, b) => b.certification_count - a.certification_count);
  } else if (filters.sort === "views") {
    teachers.sort((a, b) => b.view_count - a.view_count);
  }

  return { teachers, total: count ?? 0 };
}

export async function getTeacherBySlug(slug: string): Promise<TeacherWithStats | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teachers")
    .select(
      `id, user_id, slug, full_name, nickname, photo_url, bio, motto,
       department_id, subject, experience, linkedin, github, website,
       instagram, created_at,
       department:departments(id, name, icon),
       skills(id, teacher_id, skill_name, level),
       certifications(id, teacher_id, title, issuer, issue_date, expired_date, credential_url, file_url, is_verified),
       portfolios(id, teacher_id, title, description, media_url, type, created_at),
       achievements(id, teacher_id, title, year, description),
       profile_views(id)`
    )
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  return toTeacherWithStats(data as unknown as TeacherRow);
}

export async function getTeacherByUserId(userId: string): Promise<TeacherWithStats | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teachers")
    .select(
      `id, user_id, slug, full_name, nickname, photo_url, bio, motto,
       department_id, subject, experience, linkedin, github, website,
       instagram, created_at,
       department:departments(id, name, icon),
       skills(id, teacher_id, skill_name, level),
       certifications(id, teacher_id, title, issuer, issue_date, expired_date, credential_url, file_url, is_verified),
       portfolios(id, teacher_id, title, description, media_url, type, created_at),
       achievements(id, teacher_id, title, year, description),
       profile_views(id)`
    )
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;

  return toTeacherWithStats(data as unknown as TeacherRow);
}

export async function getHallOfFame(limit = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teachers")
    .select(
      `id, user_id, slug, full_name, nickname, photo_url, bio, motto,
       department_id, subject, experience, linkedin, github, website,
       instagram, created_at,
       department:departments(id, name, icon),
       skills(id, teacher_id, skill_name, level),
       certifications(id, is_verified),
       portfolios(id),
       profile_views(id)`
    )
    .limit(50);

  if (error || !data) return [];

  const withStats = ((data) as unknown as TeacherRow[]).map(toTeacherWithStats);

  return withStats
    .map((t) => ({
      teacher: t,
      score:
        t.certification_count * 3 +
        t.view_count * 0.1 +
        t.portfolio_count * 2 +
        t.completion_percentage * 0.5,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function getDepartments() {
  const supabase = await createClient();
  const { data } = await supabase.from("departments").select("*").order("name");
  return (data ?? []) as Array<{ id: string; name: string; icon: string }>;
}

export async function recordProfileView(teacherId: string, visitorIp: string) {
  const supabase = await createClient();

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: existing } = await supabase
    .from("profile_views")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("visitor_ip", visitorIp)
    .gte("viewed_at", yesterday)
    .single();

  if (!existing) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("profile_views") as any).insert({
      teacher_id: teacherId,
      visitor_ip: visitorIp,
    });
  }
}

export async function getAnalytics() {
  const supabase = await createClient();

  const [teachersRes, certsRes, viewsRes, deptRes] = await Promise.all([
    supabase.from("teachers").select("id", { count: "exact", head: true }),
    supabase.from("certifications").select("id", { count: "exact", head: true }),
    supabase.from("profile_views").select("id", { count: "exact", head: true }),
    supabase.from("departments").select("id, name, teachers(id)"),
  ]);

  const depts = (deptRes.data ?? []) as Array<{
    id: string;
    name: string;
    teachers: Array<{ id: string }>;
  }>;

  return {
    total_teachers: teachersRes.count ?? 0,
    total_certifications: certsRes.count ?? 0,
    total_views: viewsRes.count ?? 0,
    departments: depts.map((d) => ({
      name: d.name,
      count: Array.isArray(d.teachers) ? d.teachers.length : 0,
    })),
  };
}
