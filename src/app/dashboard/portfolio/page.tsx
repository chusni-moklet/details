import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateTeacher } from "@/lib/getOrCreateTeacher";
import { getTeacherPortfoliosAll } from "@/services/dashboard";
import { PortfolioManager } from "@/features/dashboard/PortfolioManager";

export const metadata: Metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const teacher = await getOrCreateTeacher(user);
  if (!teacher) redirect("/dashboard");

  // Fetch ALL portfolios (including unverified) for owner's dashboard
  const portfolios = await getTeacherPortfoliosAll(teacher.id);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white font-display">Portfolio</h1>
        <p className="text-gray-400 mt-1">
          Kelola portfolio Anda. Item yang belum diverifikasi admin tidak tampil di profil publik.
        </p>
      </div>
      <PortfolioManager portfolios={portfolios} />
    </div>
  );
}
