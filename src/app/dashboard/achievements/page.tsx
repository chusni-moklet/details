import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateTeacher } from "@/lib/getOrCreateTeacher";
import { AchievementManager } from "@/features/dashboard/AchievementManager";

export const metadata: Metadata = { title: "Prestasi" };

export default async function AchievementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const teacher = await getOrCreateTeacher(user);
  if (!teacher) redirect("/dashboard");

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white font-display">Prestasi</h1>
        <p className="text-gray-400 mt-1">
          Catat penghargaan dan pencapaian Anda. Prestasi tampil di tab{" "}
          <span className="text-red-400">Prestasi</span> pada profil publik.
        </p>
      </div>
      <AchievementManager achievements={teacher.achievements ?? []} />
    </div>
  );
}
