import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Building2, Plus, AlertCircle } from "lucide-react";
import { HierarchyTree } from "@/features/ski/components/HierarchyTree";
import { CreateUnitForm } from "@/features/ski/components/CreateUnitForm";
import { getOrganizationTree, getUserRoleLevel } from "@/features/ski/services/ski";

export const metadata: Metadata = { title: "Struktur Organisasi" };

export default async function OrganizationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [tree, roleLevel] = await Promise.all([
    getOrganizationTree().catch(() => []),
    getUserRoleLevel(user.id),
  ]);

  const canManage = roleLevel <= 2;

  // Check if SKI tables exist
  const { error: tableCheck } = await supabase
    .from("organizational_units")
    .select("id")
    .limit(1);

  const tablesExist = !tableCheck;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display flex items-center gap-2">
            <Building2 className="w-6 h-6 text-red-400" />
            Struktur Organisasi
          </h1>
          <p className="text-gray-400 mt-1">Kelola hierarki unit organisasi SKI</p>
        </div>
      </div>

      {/* Warning if tables don't exist */}
      {!tablesExist && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-300">Database SKI belum disetup</p>
            <p className="text-xs text-yellow-400/70 mt-1">
              Jalankan file <code className="bg-dark-900 px-1 rounded">supabase/ski-schema.sql</code> dan{" "}
              <code className="bg-dark-900 px-1 rounded">supabase/ski-fix.sql</code> di Supabase SQL Editor terlebih dahulu.
            </p>
          </div>
        </div>
      )}

      {tablesExist && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tree */}
          <div className="lg:col-span-2 rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6">
            <h2 className="font-semibold text-white mb-4">Hierarki Unit</h2>
            {tree.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Belum ada unit organisasi.
                  {canManage ? " Buat unit pertama di sebelah kanan." : ""}
                </p>
              </div>
            ) : (
              <HierarchyTree units={tree} />
            )}
          </div>

          {/* Create form */}
          {canManage ? (
            <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-400" />
                Tambah Unit
              </h2>
              <CreateUnitForm units={tree} />
            </div>
          ) : (
            <div className="rounded-2xl border border-dark-700/50 bg-dark-800/40 p-6 flex items-center justify-center">
              <p className="text-gray-500 text-sm text-center">
                Hanya Super Admin dan Manajemen yang dapat mengelola struktur organisasi.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
