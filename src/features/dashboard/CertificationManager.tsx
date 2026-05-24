"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Loader2, X } from "lucide-react";
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
  const [certs, setCerts] = useState(initial);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await addCertification(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Sertifikasi ditambahkan, menunggu verifikasi admin");
        setOpen(false);
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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Tambah Sertifikasi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
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

      {certs.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-dark-700">
          <p className="text-gray-500 text-sm">Belum ada sertifikasi. Tambahkan sertifikasi pertama Anda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certs.map((cert) => (
            <div key={cert.id} className="relative group">
              <CertificateCard cert={cert} />
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
