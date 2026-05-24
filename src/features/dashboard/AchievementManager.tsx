"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Loader2, X, Trophy, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addAchievement, deleteAchievement } from "@/app/actions/teacher";
import type { Achievement } from "@/types";

interface AchievementManagerProps {
  achievements: Achievement[];
}

export function AchievementManager({ achievements: initial }: AchievementManagerProps) {
  const [achievements, setAchievements] = useState(initial);
  const [open, setOpen]                 = useState(false);
  const [isPending, startTransition]    = useTransition();
  const [uploading, setUploading]       = useState(false);
  const [fileUrl, setFileUrl]           = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("File terlalu besar (max 10MB)"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/certificate", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json() as { url: string };
      setFileUrl(data.url);
      toast.success("File berhasil diupload");
    } catch { toast.error("Gagal mengupload file"); }
    finally { setUploading(false); }
  };

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (fileUrl) formData.set("file_url", fileUrl);
    startTransition(async () => {
      const result = await addAchievement(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Prestasi ditambahkan");
        setOpen(false);
        setFileUrl("");
        window.location.reload();
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteAchievement(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setAchievements((prev) => prev.filter((a) => a.id !== id));
        toast.success("Prestasi dihapus");
      }
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{achievements.length} prestasi</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4" />Tambah Prestasi</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Tambah Prestasi</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="a-title">Nama Prestasi *</Label>
                <Input id="a-title" name="title" required placeholder="Contoh: Juara 1 LKS Nasional" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="a-year">Tahun *</Label>
                <Input id="a-year" name="year" type="number" required min="1990" max={new Date().getFullYear()} placeholder={String(new Date().getFullYear())} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="a-desc">Deskripsi</Label>
                <Textarea id="a-desc" name="description" placeholder="Detail prestasi..." rows={3} />
              </div>

              {/* Upload bukti */}
              <div className="space-y-2">
                <Label>Upload Bukti / Sertifikat (opsional)</Label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed text-sm transition-colors ${
                      fileUrl ? "border-green-500/50 bg-green-500/10 text-green-400" : "border-dark-600 hover:border-red-500/50 text-gray-400"
                    }`}>
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploading ? "Mengupload..." : fileUrl ? "✓ File terupload" : "Pilih file (JPG/PNG/PDF, max 10MB)"}
                    </div>
                  </label>
                  {fileUrl && (
                    <button type="button" onClick={() => setFileUrl("")} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {fileUrl && (
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-red-400 hover:underline">
                    Lihat file →
                  </a>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Tambah
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-dark-700">
          <Trophy className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Belum ada prestasi. Tambahkan pencapaian Anda.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-dark-700/50 bg-dark-800/40 p-6">
          <div className="relative space-y-0">
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-red-500/50 via-dark-600 to-transparent" />
            {[...achievements].sort((a, b) => b.year - a.year).map((achievement) => (
              <div key={achievement.id} className="relative flex gap-4 pb-6 last:pb-0 group">
                <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-dark-800 border-2 border-red-500/50 flex items-center justify-center">
                  <Trophy className="w-3.5 h-3.5 text-red-400" />
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-white text-sm">{achievement.title}</h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5">
                        {achievement.year}
                      </span>
                      <button
                        onClick={() => handleDelete(achievement.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        aria-label="Hapus prestasi"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {achievement.description && (
                    <p className="text-xs text-gray-400 mt-1">{achievement.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
