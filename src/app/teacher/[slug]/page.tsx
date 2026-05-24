import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TeacherProfile } from "@/features/teacher/TeacherProfile";
import { getTeacherBySlug, recordProfileView } from "@/services/teachers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const teacher = await getTeacherBySlug(slug);

  if (!teacher) return { title: "Guru tidak ditemukan" };

  return {
    title: teacher.full_name,
    description: teacher.bio ?? `Profil guru ${teacher.full_name} - SMK Telkom Malang`,
    openGraph: {
      title: `${teacher.full_name} | DITAILS SMK Telkom Malang`,
      description: teacher.bio ?? `Profil guru ${teacher.full_name}`,
      images: teacher.photo_url ? [{ url: teacher.photo_url }] : [],
    },
  };
}

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const teacher = await getTeacherBySlug(slug);

  if (!teacher) notFound();

  // Record profile view
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0] ??
    headersList.get("x-real-ip") ??
    "unknown";

  // Fire and forget — don't block render
  recordProfileView(teacher.id, ip).catch(console.error);

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-16">
        <TeacherProfile teacher={teacher} />
      </main>
      <Footer />
    </div>
  );
}
