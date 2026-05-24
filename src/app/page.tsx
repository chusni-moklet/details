import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/features/home/HeroSection";
import { StatsSection } from "@/features/home/StatsSection";
import { FeaturedTeachers } from "@/features/home/FeaturedTeachers";
import { DepartmentsSection } from "@/features/home/DepartmentsSection";
import { HallOfFamePreview } from "@/features/home/HallOfFamePreview";
import { CTASection } from "@/features/home/CTASection";
import { getAnalytics, getDepartments, getHallOfFame, getTeachers } from "@/services/teachers";

export default async function HomePage() {
  const [analytics, departments, hallOfFame, { teachers: featured }] =
    await Promise.all([
      getAnalytics(),
      getDepartments(),
      getHallOfFame(3),
      getTeachers({ sort: "certifications" }, 1, 6),
    ]);

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection analytics={analytics} />
        <FeaturedTeachers teachers={featured} />
        <DepartmentsSection departments={departments} />
        <HallOfFamePreview entries={hallOfFame} />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
