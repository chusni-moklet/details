import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TargetForm } from "@/features/ski/components/TargetForm";
import { getSKICategories, getUserRoleLevel, getAllUsers } from "@/features/ski/services/ski";

export const metadata: Metadata = { title: "Buat Indikator SKI" };

export default async function CreateSKIPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const roleLevel = await getUserRoleLevel(user.id);
  if (roleLevel > 3) redirect("/dashboard/ski");

  const [categories, allUsers] = await Promise.all([
    getSKICategories(),
    getAllUsers(),
  ]);

  const usersForForm = allUsers.map((u) => ({
    id:        u.id,
    email:     u.email,
    full_name: undefined,
  }));

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white font-display">Buat Indikator SKI</h1>
        <p className="text-gray-400 mt-1">Buat indikator Sasaran Kinerja Individu baru</p>
      </div>
      <TargetForm
        categories={categories}
        users={usersForForm}
        defaultYear={new Date().getFullYear()}
      />
    </div>
  );
}
