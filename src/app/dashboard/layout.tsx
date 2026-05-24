import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateTeacher } from "@/lib/getOrCreateTeacher";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import type { UserRole } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role    = (userData as { role: UserRole } | null)?.role ?? "teacher";
  const teacher = await getOrCreateTeacher(user);

  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden">
      <DashboardSidebar
        role={role}
        userName={teacher?.full_name ?? user.email ?? "User"}
        userEmail={user.email ?? ""}
        photoUrl={teacher?.photo_url}
      />
      {/* pt-14 on mobile to account for the fixed top bar */}
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  );
}
