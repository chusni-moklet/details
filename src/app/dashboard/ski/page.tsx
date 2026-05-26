import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, Target, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SKITable } from "@/features/ski/components/SKITable";
import { StatusBadge } from "@/features/ski/components/StatusBadge";
import {
  getMySKIIndicators, getSKIIndicators, getCurrentUserPosition, getUserRoleLevel,
} from "@/features/ski/services/ski";

export const metadata: Metadata = { title: "SKI — Sasaran Kinerja Individu" };

export default async function SKIPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [position, roleLevel] = await Promise.all([
    getCurrentUserPosition(user.id).catch(() => null),
    getUserRoleLevel(user.id),
  ]);

  // Fetch indicators based on role
  const indicators = roleLevel <= 3
    ? await getSKIIndicators().catch(() => [])
    : await getMySKIIndicators(user.id).catch(() => []);

  const stats = {
    total:       indicators.length,
    assigned:    indicators.filter((i) => i.status === "assigned").length,
    on_progress: indicators.filter((i) => i.status === "on_progress").length,
    submitted:   indicators.filter((i) => i.status === "submitted").length,
    completed:   indicators.filter((i) => ["approved", "completed"].includes(i.status)).length,
  };

  const canCreate = roleLevel <= 3;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            Sasaran Kinerja Individu
          </h1>
          <p className="text-gray-400 mt-1">
            {position
              ? `${position.role?.name ?? "—"} · ${position.unit?.name ?? "—"}`
              : "Belum memiliki jabatan SKI"
            }
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/dashboard/ski/create">
              <Plus className="w-4 h-4" />
              Buat Indikator
            </Link>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",      value: stats.total,       icon: Target,       color: "text-gray-400",   bg: "bg-gray-500/10 border-gray-500/20"    },
          { label: "Berjalan",   value: stats.on_progress, icon: Clock,        color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
          { label: "Disubmit",   value: stats.submitted,   icon: AlertCircle,  color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
          { label: "Selesai",    value: stats.completed,   icon: CheckCircle,  color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20"   },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`p-4 rounded-xl border ${bg} flex items-center gap-3`}>
            <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
            <div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* No position warning */}
      {!position && (
        <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-sm">
          ⚠ Anda belum memiliki jabatan SKI. Hubungi admin untuk mendapatkan akses.
        </div>
      )}

      {/* Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">
            {roleLevel <= 3 ? "Semua Indikator SKI" : "SKI Saya"}
          </h2>
          {roleLevel <= 3 && (
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/ski/monitoring">
                Monitoring
              </Link>
            </Button>
          )}
        </div>
        <SKITable
          indicators={indicators}
          showAssignee={roleLevel <= 3}
          canDelete={roleLevel <= 3}
        />
      </div>
    </div>
  );
}
