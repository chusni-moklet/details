import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Users, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { SKITable } from "@/features/ski/components/SKITable";
import { getSKIIndicators, getUserRoleLevel, getSKIAnalytics } from "@/features/ski/services/ski";
import { Progress } from "@/components/ui/progress";

export const metadata: Metadata = { title: "Monitoring SKI" };

export default async function SKIMonitoringPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const roleLevel = await getUserRoleLevel(user.id);
  if (roleLevel > 3) redirect("/dashboard/ski");

  const [indicators, analytics] = await Promise.all([
    getSKIIndicators().catch(() => []),
    getSKIAnalytics(user.id).catch(() => ({
      total_indicators: 0, by_status: {} as Record<string, number>,
      avg_progress: 0, total_users: 0, completion_rate: 0, unit_performance: [],
    })),
  ]);

  const pendingApproval = indicators.filter((i) => i.status === "submitted").length;
  const avgProgress     = indicators.length > 0
    ? Math.round(indicators.reduce((acc, i) => acc + (i.progress_percentage ?? 0), 0) / indicators.length)
    : 0;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Monitoring SKI</h1>
        <p className="text-gray-400 mt-1">Overview seluruh indikator SKI</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users,       label: "Total Indikator",  value: analytics.total_indicators, color: "text-gray-400",   bg: "bg-gray-500/10 border-gray-500/20"    },
          { icon: Clock,       label: "Pending Approval", value: pendingApproval,            color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
          { icon: TrendingUp,  label: "Rata-rata Progress",value: `${avgProgress}%`,         color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20"    },
          { icon: CheckCircle, label: "Completion Rate",  value: `${Math.round(analytics.completion_rate)}%`, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`p-4 rounded-xl border ${bg} flex items-center gap-3`}>
            <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
            <div>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6 space-y-4">
        <h2 className="font-semibold text-white">Distribusi Status</h2>
        <div className="space-y-3">
          {Object.entries(analytics.by_status).map(([status, count]) => {
            const pct = analytics.total_indicators > 0 ? (count / analytics.total_indicators) * 100 : 0;
            return (
              <div key={status} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 capitalize">{status.replace("_", " ")}</span>
                  <span className="text-gray-300">{count} ({Math.round(pct)}%)</span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending approval */}
      {pendingApproval > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            Menunggu Approval ({pendingApproval})
          </h2>
          <SKITable
            indicators={indicators.filter((i) => i.status === "submitted")}
            showAssignee
          />
        </div>
      )}

      {/* All indicators */}
      <div className="space-y-4">
        <h2 className="font-semibold text-white">Semua Indikator</h2>
        <SKITable indicators={indicators} showAssignee canDelete={roleLevel <= 2} />
      </div>
    </div>
  );
}
