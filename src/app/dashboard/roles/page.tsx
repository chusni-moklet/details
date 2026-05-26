import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shield } from "lucide-react";
import { AssignRoleForm } from "@/features/ski/components/AssignRoleForm";
import {
  getUserRoleLevel, getUsersWithPositions,
  getOrganizationalUnits,
} from "@/features/ski/services/ski";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/features/ski/types";
import type { SKIRoleName } from "@/features/ski/types";

export const metadata: Metadata = { title: "Kelola Role SKI" };

export default async function RolesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const roleLevel = await getUserRoleLevel(user.id);
  if (roleLevel > 2) redirect("/dashboard/ski");

  const [usersWithPos, units, allUsers, skiRoles] = await Promise.all([
    getUsersWithPositions().catch(() => []),
    getOrganizationalUnits().catch(() => []),
    supabase.from("users").select("id, email").order("email"),
    supabase.from("ski_roles").select("*").order("level"),
  ]);

  const users    = (allUsers.data ?? []) as Array<{ id: string; email: string }>;
  const roles    = (skiRoles.data ?? []) as Array<{ id: string; name: string; level: number }>;

  const roleVariant = (name: string) => {
    if (name === "super_admin")   return "warning"   as const;
    if (name === "management")    return "default"   as const;
    if (name === "kepala_urusan") return "secondary" as const;
    return "outline" as const;
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white font-display flex items-center gap-2">
          <Shield className="w-6 h-6 text-red-400" />
          Kelola Role SKI
        </h1>
        <p className="text-gray-400 mt-1">Assign jabatan dan unit kepada pengguna</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assign form */}
        <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6">
          <h2 className="font-semibold text-white mb-4">Assign Jabatan</h2>
          <AssignRoleForm users={users} roles={roles} units={units} />
        </div>

        {/* Current assignments */}
        <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6">
          <h2 className="font-semibold text-white mb-4">
            Jabatan Aktif ({usersWithPos.length})
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {usersWithPos.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Belum ada jabatan yang di-assign</p>
            ) : (
              usersWithPos.map((pos) => (
                <div key={pos.id} className="flex items-center gap-3 p-3 rounded-lg border border-dark-700/50 bg-dark-900/40">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{pos.user?.email ?? "—"}</p>
                    <p className="text-xs text-gray-500">{pos.unit?.name ?? "Tanpa unit"}</p>
                  </div>
                  <Badge variant={roleVariant(pos.role?.name ?? "")}>
                    {ROLE_LABELS[(pos.role?.name ?? "staff") as SKIRoleName] ?? pos.role?.name}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
