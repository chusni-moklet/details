import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateTeacher } from "@/lib/getOrCreateTeacher";
import { getTeacherCertificationsAll } from "@/services/dashboard";
import { CertificationManager } from "@/features/dashboard/CertificationManager";

export const metadata: Metadata = { title: "Sertifikasi" };

export default async function CertificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const teacher = await getOrCreateTeacher(user);
  if (!teacher) redirect("/dashboard");

  // Fetch ALL certifications (including unverified) for owner's dashboard
  const certifications = await getTeacherCertificationsAll(teacher.id);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white font-display">Sertifikasi</h1>
        <p className="text-gray-400 mt-1">
          Kelola sertifikasi Anda. Item yang belum diverifikasi admin tidak tampil di profil publik.
        </p>
      </div>
      <CertificationManager certifications={certifications} />
    </div>
  );
}
