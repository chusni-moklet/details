"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Loader2, X } from "lucide-react";
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

export function PortfolioManager({ portfolios: initial }: PortfolioManagerProps) {
  const [portfolios, setPortfolios] = useState(initial);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<PortfolioType>("project");

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("type", type);

    startTransition(async () => {
      const result = await addPortfolio(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Portfolio ditambahkan");
        setOpen(false);
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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Tambah Portfolio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Tambah Portfolio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="p-title">Judul *</Label>
                <Input id="p-title" name="title" required placeholder="Nama proyek / karya" />
              </div>
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select value={type} onValueChange={(v) => setType(v as PortfolioType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">Proyek</SelectItem>
                    <SelectItem value="publication">Publikasi</SelectItem>
                    <SelectItem value="award">Penghargaan</SelectItem>
                    <SelectItem value="other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-desc">Deskripsi *</Label>
                <Textarea id="p-desc" name="description" required placeholder="Jelaskan karya Anda..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-url">URL Media / Link</Label>
                <Input id="p-url" name="media_url" type="url" placeholder="https://..." />
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
