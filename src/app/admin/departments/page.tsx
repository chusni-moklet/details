import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminDepartmentManager } from "@/features/admin/AdminDepartmentManager";

export const metadata: Metadata = { title: "Kelola Jurusan" };

export default async function AdminDepartmentsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("departments")
    .select("id, name, icon, teachers(id)")
    .order("name");

  const departments = ((data ?? []) as Array<{
    id: string;
    name: string;
    icon: string;
    teachers: Array<{ id: string }>;
  }>).map((d) => ({
    id: d.id,
    name: d.name,
    icon: d.icon,
    teacher_count: d.teachers?.length ?? 0,
  }));

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white font-display">Kelola Jurusan</h1>
        <p className="text-gray-400 mt-1">Tambah dan kelola program keahlian</p>
      </div>
      <AdminDepartmentManager departments={departments} />
    </div>
  );
}
