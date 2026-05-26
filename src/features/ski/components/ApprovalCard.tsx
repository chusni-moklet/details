"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { approveProgress, rejectProgress } from "../actions";
import type { SKIProgress } from "../types";

interface ApprovalCardProps {
  progress: SKIProgress;
  indicatorTitle: string;
  onUpdate?: () => void;
}

export function ApprovalCard({ progress, indicatorTitle, onUpdate }: ApprovalCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveProgress(progress.id, "Disetujui");
      if (result?.error) toast.error(result.error);
      else { toast.success("Progress disetujui"); onUpdate?.(); }
    });
  };

  const handleReject = () => {
    const note = window.prompt("Masukkan catatan penolakan:");
    if (!note) return;
    startTransition(async () => {
      const result = await rejectProgress(progress.id, note);
      if (result?.error) toast.error(result.error);
      else { toast.success("Progress ditolak"); onUpdate?.(); }
    });
  };

  return (
    <div className="p-4 rounded-xl border border-dark-700/50 bg-dark-800/40 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-white text-sm">{indicatorTitle}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {progress.user?.email ?? "—"} · {new Date(progress.submitted_at).toLocaleDateString("id-ID")}
          </p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
          progress.status === "approved" ? "text-green-400 bg-green-500/10 border-green-500/20" :
          progress.status === "rejected" ? "text-red-400 bg-red-500/10 border-red-500/20" :
          "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
        }`}>
          {progress.status === "approved" ? "Disetujui" : progress.status === "rejected" ? "Ditolak" : "Menunggu"}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Progress</span>
          <span className="text-red-400 font-medium">{progress.progress_percentage}%</span>
        </div>
        <Progress value={progress.progress_percentage} className="h-2" />
      </div>

      {progress.progress_note && (
        <p className="text-xs text-gray-400 bg-dark-900/50 rounded-lg p-2">
          {progress.progress_note}
        </p>
      )}

      {progress.evidence_file && (
        <a
          href={progress.evidence_file}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"
        >
          <FileText className="w-3.5 h-3.5" />
          Lihat Bukti
        </a>
      )}

      {progress.status === "pending" && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={isPending}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            Setujui
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReject}
            disabled={isPending}
            className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 h-8 text-xs"
          >
            <XCircle className="w-3.5 h-3.5" />
            Tolak
          </Button>
        </div>
      )}

      {progress.verification_note && (
        <p className="text-xs text-gray-500 italic">
          Catatan: {progress.verification_note}
        </p>
      )}
    </div>
  );
}
