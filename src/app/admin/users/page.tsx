import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { RoleSelector } from "@/features/admin/RoleSelector";
import type { UserRole } from "@/types";

export const metadata: Metadata = { title: "User Management" };

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data: users } = await supabase
    .from("users")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: false });

  const rows = (users ?? []) as Array<{
    id: string;
    email: string;
    role: UserRole;
    created_at: string;
  }>;

  // Check if current user is super_admin
  const currentUserRole = rows.find((u) => u.id === currentUser?.id)?.role;
  const isSuperAdmin = currentUserRole === "super_admin";

  const roleVariant = (role: UserRole) => {
    if (role === "super_admin")   return "warning"   as const;
    if (role === "admin_jurusan") return "default"   as const;
    return "secondary" as const;
  };

  const roleLabel = (role: UserRole) => {
    if (role === "super_admin")   return "Super Admin";
    if (role === "admin_jurusan") return "Admin Jurusan";
    return "Guru";
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white font-display">User Management</h1>
        <p className="text-gray-400 mt-1">{rows.length} pengguna terdaftar</p>
        {isSuperAdmin && (
          <p className="text-xs text-red-400 mt-1">
            Sebagai Super Admin, Anda dapat mengubah role pengguna lain.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-dark-700/50 bg-dark-800/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700/50 bg-dark-900/50">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Role</th>
                {isSuperAdmin && (
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Ubah Role</th>
                )}
                <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Bergabung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/30">
              {rows.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="hover:bg-dark-800/60 transition-colors">
                    {/* Email */}
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-gray-200">{u.email}</span>
                        {isSelf && (
                          <span className="ml-2 text-xs text-red-400 font-medium">(Anda)</span>
                        )}
                      </div>
                    </td>

                    {/* Current role badge */}
                    <td className="px-4 py-3">
                      <Badge variant={roleVariant(u.role)}>
                        {roleLabel(u.role)}
                      </Badge>
                    </td>

                    {/* Role selector — only for super_admin */}
                    {isSuperAdmin && (
                      <td className="px-4 py-3">
                        <RoleSelector
                          userId={u.id}
                          currentRole={u.role}
                          isSelf={isSelf}
                        />
                      </td>
                    )}

                    {/* Join date */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-gray-400 text-xs">{formatDate(u.created_at)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
