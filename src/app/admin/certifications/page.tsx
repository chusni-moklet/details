import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminCertificationList } from "@/features/admin/AdminCertificationList";

export const metadata: Metadata = { title: "Verifikasi Sertifikasi" };

export default async function AdminCertificationsPage() {
  const supabase = await createClient();

  const { data: certifications } = await supabase
    .from("certifications")
    .select(`
      *,
      teacher:teachers(id, full_name, slug, photo_url)
    `)
    .order("is_verified", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white font-display">Verifikasi Sertifikasi</h1>
        <p className="text-gray-400 mt-1">Review dan verifikasi sertifikasi guru</p>
      </div>
      <AdminCertificationList certifications={certifications ?? []} />
    </div>
  );
}
