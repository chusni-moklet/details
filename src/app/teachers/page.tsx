import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TeacherCatalog } from "@/features/catalog/TeacherCatalog";
import { getDepartments, getTeachers } from "@/services/teachers";

export const metadata: Metadata = {
  title: "Profil Guru",
  description: "Temukan dan jelajahi profil guru-guru profesional SMK Telkom Malang.",
};

export default async function TeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const [{ teachers, total }, departments] = await Promise.all([
    getTeachers(
      {
        query: params.q,
        department_id: params.department,
        sort: (params.sort as "name" | "views" | "certifications" | "newest") ?? "name",
      },
      1,
      24
    ),
    getDepartments(),
  ]);

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-20">
        <TeacherCatalog
          initialTeachers={teachers}
          total={total}
          departments={departments}
          initialFilters={{
            query: params.q ?? "",
            department_id: params.department ?? "all",
            sort: (params.sort as "name" | "views" | "certifications" | "newest") ?? "name",
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
