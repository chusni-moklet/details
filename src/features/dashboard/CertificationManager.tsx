"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Loader2, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CertificateCard } from "@/components/teacher/CertificateCard";
import { addCertification, deleteCertification } from "@/app/actions/teacher";
import type { Certification } from "@/types";

interface CertificationManagerProps {
  certifications: Certification[];
}

export function CertificationManager({ certifications: initial }: CertificationManagerProps) {
  const [certs, setCerts]             = useState(initial);
  const [open, setOpen]               = useState(false);
  const [isPending, startTransition]  = useTransition();
  const [uploading, setUploading]     = useState(false);
  const [fileUrl, setFileUrl]         = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      const res = await fetch("/api/upload/certificate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload gagal");
      const data = await res.json() as { url: string };
      setFileUrl(data.url);
      toast.success("File sertifikat berhasil diupload");
    } catch {
      toast.error("Gagal mengupload file");
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("file_url", fileUrl);

    startTransition(async () => {
      const result = await addCertification(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Sertifikasi ditambahkan, menunggu verifikasi admin");
        setOpen(false);
        setFileUrl("");
        window.location.reload();
      }
    });
  };

  const handleDelete = (certId: string) => {
    startTransition(async () => {
      const result = await deleteCertification(certId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setCerts((prev) => prev.filter((c) => c.id !== certId));
        toast.success("Sertifikasi dihapus");
      }
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{certs.length} sertifikasi</p>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setFileUrl(""); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Tambah Sertifikasi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Sertifikasi</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">

              <div className="space-y-2">
                <Label htmlFor="title">Nama Sertifikasi *</Label>
                <Input id="title" name="title" required placeholder="Contoh: AWS Certified Developer" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuer">Penerbit *</Label>
                <Input id="issuer" name="issuer" required placeholder="Contoh: Amazon Web Services" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="issue_date">Tanggal Terbit *</Label>
                  <Input id="issue_date" name="issue_date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expired_date">Tanggal Kadaluarsa</Label>
                  <Input id="expired_date" name="expired_date" type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credential_url">URL Kredensial</Label>
                <Input id="credential_url" name="credential_url" type="url" placeholder="https://..." />
              </div>

              {/* Upload file sertifikat */}
              <div className="space-y-2">
                <Label>Upload File Sertifikat</Label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed transition-colors text-sm ${
                      fileUrl
                        ? "border-green-500/50 bg-green-500/10 text-green-400"
                        : "border-dark-600 hover:border-red-500/50 text-gray-400 hover:text-gray-200"
                    }`}>
                      {uploading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Upload className="w-4 h-4" />
                      }
                      {uploading
                        ? "Mengupload..."
                        : fileUrl
                        ? "✓ File terupload"
                        : "Pilih file (JPG/PNG/PDF, max 10MB)"
                      }
                    </div>
                  </label>
                  {fileUrl && (
                    <button
                      type="button"
                      onClick={() => setFileUrl("")}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-red-400 hover:underline"
                  >
                    Lihat file yang diupload →
                  </a>
                )}
              </div>

              <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                <p className="text-xs text-yellow-400">
                  ⚠ Sertifikasi akan menunggu verifikasi admin sebelum tampil di profil publik.
                </p>
              </div>

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

      {certs.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-dark-700">
          <p className="text-gray-500 text-sm">Belum ada sertifikasi. Tambahkan sertifikasi pertama Anda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certs.map((cert) => (
            <div key={cert.id} className="relative group">
              <CertificateCard cert={cert} showPending />
              <button
                onClick={() => handleDelete(cert.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                aria-label="Hapus sertifikasi"
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
