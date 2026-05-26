import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Calendar, Target, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/features/ski/components/StatusBadge";
import { ApprovalCard } from "@/features/ski/components/ApprovalCard";
import { EvidenceUploader } from "@/features/ski/components/EvidenceUploader";
import {
  getSKIIndicatorById, getSKIProgress, getUserRoleLevel,
} from "@/features/ski/services/ski";

export const metadata: Metadata = { title: "Detail SKI" };

export default async function SKIDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [indicator, progressList, roleLevel] = await Promise.all([
    getSKIIndicatorById(id),
    getSKIProgress(id),
    getUserRoleLevel(user.id),
  ]);

  if (!indicator) notFound();

  const latestProgress = progressList[0];
  const currentPct     = latestProgress?.progress_percentage ?? 0;
  const canUpdate      = indicator.assigned_to === user.id || roleLevel <= 4;
  const canApprove     = roleLevel <= 3 && indicator.assigned_by === user.id;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      {/* Back */}
      <Button asChild variant="ghost" size="sm" className="text-gray-400">
        <Link href="/dashboard/ski">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </Button>

      {/* Header */}
      <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">{indicator.title}</h1>
            {indicator.category && (
              <p className="text-sm text-gray-400 mt-1">{indicator.category.name}</p>
            )}
          </div>
          <StatusBadge status={indicator.status} />
        </div>

        {indicator.description && (
          <p className="text-sm text-gray-300 leading-relaxed">{indicator.description}</p>
        )}

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-dark-700/50">
          {[
            { icon: Calendar, label: "Periode",  value: `${indicator.period_year} · Sem ${indicator.period_semester}` },
            { icon: Target,   label: "Target",   value: indicator.target_output_value ? `${indicator.target_output_value} ${indicator.target_output_unit}` : "—" },
            { icon: Calendar, label: "Waktu",    value: indicator.target_time_value ? `${indicator.target_time_value} ${indicator.target_time_unit}` : "—" },
            { icon: User,     label: "Ditugaskan ke", value: indicator.assignee?.email ?? "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                <Icon className="w-3 h-3" />{label}
              </p>
              <p className="text-sm text-gray-200 truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* SKU & Program */}
        {(indicator.sku || indicator.program) && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dark-700/50">
            {indicator.sku && (
              <div>
                <p className="text-xs text-gray-500 mb-1">SKU · Bobot {indicator.weight_sku}%</p>
                <p className="text-sm text-gray-200">{indicator.sku}</p>
              </div>
            )}
            {indicator.program && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Program · Bobot {indicator.weight_program}%</p>
                <p className="text-sm text-gray-200">{indicator.program}</p>
              </div>
            )}
          </div>
        )}

        {/* Progress */}
        <div className="space-y-2 pt-2 border-t border-dark-700/50">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progress Keseluruhan</span>
            <span className="text-red-400 font-bold">{currentPct}%</span>
          </div>
          <Progress value={currentPct} className="h-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Update progress */}
        {canUpdate && !["completed", "approved"].includes(indicator.status) && (
          <EvidenceUploader
            indicatorId={id}
            currentProgress={currentPct}
          />
        )}

        {/* Approval */}
        {canApprove && progressList.filter((p) => p.status === "pending").length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-white text-sm">Approval Progress</h3>
            {progressList
              .filter((p) => p.status === "pending")
              .map((p) => (
                <ApprovalCard
                  key={p.id}
                  progress={p}
                  indicatorTitle={indicator.title}
                />
              ))}
          </div>
        )}
      </div>

      {/* Progress history */}
      {progressList.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-white text-sm">Riwayat Progress</h3>
          <div className="space-y-2">
            {progressList.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-dark-700/50 bg-dark-800/30 text-sm">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{p.progress_percentage}%</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      p.status === "approved" ? "text-green-400 bg-green-500/10" :
                      p.status === "rejected" ? "text-red-400 bg-red-500/10" :
                      "text-yellow-400 bg-yellow-500/10"
                    }`}>
                      {p.status === "approved" ? "Disetujui" : p.status === "rejected" ? "Ditolak" : "Pending"}
                    </span>
                  </div>
                  {p.progress_note && <p className="text-xs text-gray-400 mt-0.5">{p.progress_note}</p>}
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {new Date(p.submitted_at).toLocaleDateString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
