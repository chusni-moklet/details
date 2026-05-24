import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminCertificationList } from "@/features/admin/AdminCertificationList";
import { AdminPortfolioList } from "@/features/admin/AdminPortfolioList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "Verifikasi" };

export default async function AdminCertificationsPage() {
  const supabase = await createClient();

  const [certsRes, portfoliosRes] = await Promise.all([
    supabase
      .from("certifications")
      .select(`*, teacher:teachers(id, full_name, slug, photo_url)`)
      .order("is_verified", { ascending: true })
      .order("created_at", { ascending: false }),

    supabase
      .from("portfolios")
      .select(`*, teacher:teachers(id, full_name, slug, photo_url)`)
      .order("is_verified", { ascending: true })
      .order("created_at", { ascending: false }),
  ]);

  const certifications = (certsRes.data ?? []) as Array<{
    id: string; title: string; issuer: string; issue_date: string;
    expired_date: string | null; credential_url: string | null;
    is_verified: boolean;
    teacher: { id: string; full_name: string; slug: string; photo_url: string | null } | null;
  }>;

  const portfolios = (portfoliosRes.data ?? []) as Array<{
    id: string; title: string; type: string; year: number | null;
    organizer: string | null; level: string | null;
    certificate_url: string | null; is_verified: boolean; created_at: string;
    teacher: { id: string; full_name: string; slug: string; photo_url: string | null } | null;
  }>;

  const pendingCerts      = certifications.filter((c) => !c.is_verified).length;
  const pendingPortfolios = portfolios.filter((p) => !p.is_verified).length;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white font-display">Verifikasi</h1>
        <p className="text-gray-400 mt-1">
          Review dan verifikasi sertifikasi dan portfolio guru
        </p>
      </div>

      <Tabs defaultValue="certifications">
        <TabsList className="mb-6">
          <TabsTrigger value="certifications">
            Sertifikasi
            {pendingCerts > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {pendingCerts}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="portfolios">
            Portfolio
            {pendingPortfolios > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {pendingPortfolios}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="certifications">
          <AdminCertificationList certifications={certifications} />
        </TabsContent>

        <TabsContent value="portfolios">
          <AdminPortfolioList portfolios={portfolios} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
