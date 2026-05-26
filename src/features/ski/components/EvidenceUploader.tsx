"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Upload, Loader2, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { submitSKIProgress } from "../actions";

interface EvidenceUploaderProps {
  indicatorId: string;
  currentProgress?: number;
  onSubmit?: () => void;
}

export function EvidenceUploader({ indicatorId, currentProgress = 0, onSubmit }: EvidenceUploaderProps) {
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading]    = useState(false);
  const [fileUrl, setFileUrl]        = useState("");
  const [progress, setProgress]      = useState(currentProgress);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { toast.error("File max 20MB"); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "ski/evidence");
      const res = await fetch("/api/upload/certificate", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json() as { url: string };
      setFileUrl(data.url);
      toast.success("Bukti berhasil diupload");
    } catch { toast.error("Gagal upload"); }
    finally { setUploading(false); }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("indicator_id",        indicatorId);
    formData.set("progress_percentage", String(progress));
    formData.set("evidence_file",       fileUrl);

    startTransition(async () => {
      const result = await submitSKIProgress(formData);
      if (result?.error) toast.error(result.error);
      else { toast.success("Progress berhasil disubmit"); onSubmit?.(); }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 rounded-2xl border border-dark-700/50 bg-dark-800/40">
      <h3 className="font-semibold text-white text-sm">Update Progress</h3>

      {/* Progress slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <Label>Progress Capaian</Label>
          <span className="text-red-400 font-bold">{progress}%</span>
        </div>
        <Input
          type="range"
          min="0"
          max="100"
          step="5"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="h-2 accent-red-500 bg-dark-700 border-0 p-0"
        />
        <Progress value={progress} className="h-2" />
      </div>

      {/* Note */}
      <div className="space-y-2">
        <Label htmlFor="progress_note">Catatan Progress</Label>
        <Textarea
          id="progress_note"
          name="progress_note"
          placeholder="Jelaskan capaian yang sudah dilakukan..."
          rows={3}
        />
      </div>

      {/* Evidence upload */}
      <div className="space-y-2">
        <Label>Upload Bukti Kerja</Label>
        <label className="cursor-pointer block">
          <input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={handleUpload} disabled={uploading} />
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed text-sm transition-colors ${
            fileUrl ? "border-green-500/50 bg-green-500/10 text-green-400" : "border-dark-600 hover:border-red-500/50 text-gray-400"
          }`}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : fileUrl ? <CheckCircle className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Mengupload..." : fileUrl ? "✓ Bukti terupload" : "Upload bukti (gambar/PDF/dokumen, max 20MB)"}
          </div>
        </label>
        {fileUrl && (
          <div className="flex items-center gap-2">
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-red-400 hover:underline">
              Lihat bukti →
            </a>
            <button type="button" onClick={() => setFileUrl("")} className="text-gray-500 hover:text-red-400">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <Button type="submit" disabled={isPending || uploading} className="w-full">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {isPending ? "Menyimpan..." : "Submit Progress"}
      </Button>
    </form>
  );
}
