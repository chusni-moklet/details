"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Loader2, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { PortfolioCard } from "@/components/teacher/PortfolioCard";
import { addPortfolio, deletePortfolio } from "@/app/actions/teacher";
import type { Portfolio } from "@/types";
import type { PortfolioType } from "@/types/supabase";

interface PortfolioManagerProps {
  portfolios: Portfolio[];
}

const levelOptions = [
  "Internasional",
  "Nasional",
  "Provinsi",
  "Kota/Kabupaten",
  "Kecamatan",
  "Sekolah",
  "Lainnya",
];

export function PortfolioManager({ portfolios: initial }: PortfolioManagerProps) {
  const [portfolios, setPortfolios] = useState(initial);
  const [open, setOpen]             = useState(false);
  const [isPending, startTransition] = useTransition();
  const [type, setType]             = useState<PortfolioType>("project");
  const [level, setLevel]           = useState("");
  const [uploading, setUploading]   = useState(false);
  const [certUrl, setCertUrl]       = useState("");

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File terlalu besar (max 10MB)");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "certificates");

      const res = await fetch("/api/upload/certificate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload gagal");
      const data = await res.json() as { url: string };
      setCertUrl(data.url);
      toast.success("Sertifikat berhasil diupload");
    } catch {
      toast.error("Gagal mengupload sertifikat");
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("type", type);
    formData.set("level", level);
    formData.set("certificate_url", certUrl);

    startTransition(async () => {
      const result = await addPortfolio(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Portfolio ditambahkan");
        setOpen(false);
        setCertUrl("");
        setLevel("");
        window.location.reload();
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deletePortfolio(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setPortfolios((prev) => prev.filter((p) => p.id !== id));
        toast.success("Portfolio dihapus");
      }
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{portfolios.length} portfolio</p>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setCertUrl(""); setLevel(""); } }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Tambah Portfolio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Portfolio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">

              {/* Judul */}
              <div className="space-y-2">
                <Label htmlFor="p-title">Judul *</Label>
                <Input id="p-title" name="title" required placeholder="Nama proyek / karya / penghargaan" />
              </div>

              {/* Tipe */}
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select value={type} onValueChange={(v) => setType(v as PortfolioType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">Proyek</SelectItem>
                    <SelectItem value="publication">Publikasi / Karya Tulis</SelectItem>
                    <SelectItem value="award">Penghargaan / Prestasi</SelectItem>
                    <SelectItem value="other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  💡 Untuk mencatat prestasi dengan timeline, gunakan menu{" "}
                  <a href="/dashboard/achievements" className="text-red-400 hover:underline">Prestasi</a>
                </p>
              </div>

              {/* Tahun & Penyelenggara */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="p-year">Tahun</Label>
                  <Input
                    id="p-year"
                    name="year"
                    type="number"
                    min="1990"
                    max={new Date().getFullYear()}
                    placeholder={String(new Date().getFullYear())}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-organizer">Penyelenggara</Label>
                  <Input
                    id="p-organizer"
                    name="organizer"
                    placeholder="Contoh: Kemendikbud"
                  />
                </div>
              </div>

              {/* Tingkat */}
              <div className="space-y-2">
                <Label>Tingkat</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tingkat" />
                  </SelectTrigger>
                  <SelectContent>
                    {levelOptions.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Deskripsi */}
              <div className="space-y-2">
                <Label htmlFor="p-desc">Deskripsi *</Label>
                <Textarea
                  id="p-desc"
                  name="description"
                  required
                  placeholder="Jelaskan karya Anda..."
                  rows={3}
                />
              </div>

              {/* URL Media */}
              <div className="space-y-2">
                <Label htmlFor="p-url">URL Media / Link</Label>
                <Input id="p-url" name="media_url" type="url" placeholder="https://..." />
              </div>

              {/* Upload Sertifikat */}
              <div className="space-y-2">
                <Label>Upload Sertifikat</Label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleCertUpload}
                      disabled={uploading}
                    />
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed transition-colors text-sm ${
                      certUrl
                        ? "border-green-500/50 bg-green-500/10 text-green-400"
                        : "border-dark-600 hover:border-red-500/50 text-gray-400 hover:text-gray-200"
                    }`}>
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {uploading
                        ? "Mengupload..."
                        : certUrl
                        ? "✓ Sertifikat terupload"
                        : "Pilih file (JPG/PNG/PDF, max 10MB)"
                      }
                    </div>
                  </label>
                  {certUrl && (
                    <button
                      type="button"
                      onClick={() => setCertUrl("")}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {certUrl && (
                  <a
                    href={certUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-red-400 hover:underline"
                  >
                    Lihat sertifikat yang diupload →
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isPending || uploading} className="flex-1">
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

      {portfolios.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-dark-700">
          <p className="text-gray-500 text-sm">Belum ada portfolio. Tambahkan karya pertama Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {portfolios.map((p) => (
            <div key={p.id} className="relative group">
              <PortfolioCard portfolio={p} />
              <button
                onClick={() => handleDelete(p.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                aria-label="Hapus portfolio"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
