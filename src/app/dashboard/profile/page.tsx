import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateTeacher } from "@/lib/getOrCreateTeacher";
import { getDepartments } from "@/services/teachers";
import { ProfileEditForm } from "@/features/dashboard/ProfileEditForm";

export const metadata: Metadata = { title: "Edit Profil" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [teacher, departments] = await Promise.all([
    getOrCreateTeacher(user),
    getDepartments(),
  ]);

  if (!teacher) redirect("/dashboard");

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white font-display">Edit Profil</h1>
        <p className="text-gray-400 mt-1">Kelola informasi profil profesional Anda</p>
      </div>
      <ProfileEditForm teacher={teacher} departments={departments} />
    </div>
  );
}
