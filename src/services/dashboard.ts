/**
 * Dashboard-specific data fetching — returns ALL items including unverified.
 * Used only in teacher's own dashboard, not public profile.
 */
import { createClient } from "@/lib/supabase/server";
import type { Certification, Portfolio } from "@/types";

export async function getTeacherCertificationsAll(teacherId: string): Promise<Certification[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("certifications")
    .select("id, teacher_id, title, issuer, issue_date, expired_date, credential_url, file_url, is_verified")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  return (data ?? []) as Certification[];
}

export async function getTeacherPortfoliosAll(teacherId: string): Promise<Portfolio[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("portfolios")
    .select("id, teacher_id, title, description, media_url, type, year, organizer, level, certificate_url, is_verified, created_at")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  return (data ?? []) as Portfolio[];
}
