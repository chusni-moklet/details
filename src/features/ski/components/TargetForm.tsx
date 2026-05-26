"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createSKIIndicator } from "../actions";
import type { SKICategory } from "../types";

interface TargetFormProps {
  categories: SKICategory[];
  users: Array<{ id: string; email: string; full_name?: string }>;
  defaultYear?: number;
}

const TIME_UNITS  = ["Hari", "Minggu", "Bulan", "Semester", "Tahun"];
const OUTPUT_UNITS = ["Dokumen", "Kegiatan", "Orang", "Jam", "Pertemuan", "Laporan", "Produk", "Lainnya"];

export function TargetForm({ categories, users, defaultYear }: TargetFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [categoryId, setCategoryId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [timeUnit, setTimeUnit]     = useState("");
  const [outputUnit, setOutputUnit] = useState("");
  const [semester, setSemester]     = useState("1");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("category_id",      categoryId);
    formData.set("assigned_to",      assignedTo);
    formData.set("target_time_unit", timeUnit);
    formData.set("target_output_unit", outputUnit);
    formData.set("period_semester",  semester);

    startTransition(async () => {
      const result = await createSKIIndicator(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Indikator SKI berhasil dibuat");
        router.push("/dashboard/ski");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Basic Info */}
      <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6 space-y-4">
        <h2 className="font-semibold text-white">Informasi Dasar</h2>

        <div className="space-y-2">
          <Label htmlFor="title">Judul Indikator *</Label>
          <Input id="title" name="title" required placeholder="Contoh: Menyusun RPP Semester Ganjil" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea id="description" name="description" placeholder="Deskripsi detail indikator..." rows={3} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Ditugaskan ke</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger><SelectValue placeholder="Pilih pengguna" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak ditugaskan (Draft)</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name ?? u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="period_year">Tahun *</Label>
            <Input
              id="period_year"
              name="period_year"
              type="number"
              required
              defaultValue={defaultYear ?? new Date().getFullYear()}
              min="2020"
              max="2030"
            />
          </div>
          <div className="space-y-2">
            <Label>Semester</Label>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* SKU & Program */}
      <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6 space-y-4">
        <h2 className="font-semibold text-white">SKU & Program</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" name="sku" placeholder="Kode SKU" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight_sku">Bobot SKU (%)</Label>
            <Input id="weight_sku" name="weight_sku" type="number" min="0" max="100" step="0.01" placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="program">Program</Label>
            <Input id="program" name="program" placeholder="Nama program" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight_program">Bobot Program (%)</Label>
            <Input id="weight_program" name="weight_program" type="number" min="0" max="100" step="0.01" placeholder="0" />
          </div>
        </div>
      </div>

      {/* Target */}
      <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6 space-y-4">
        <h2 className="font-semibold text-white">Target</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="target_time_value">Target Waktu</Label>
            <Input id="target_time_value" name="target_time_value" type="number" min="1" placeholder="Jumlah" />
          </div>
          <div className="space-y-2">
            <Label>Satuan Waktu</Label>
            <Select value={timeUnit} onValueChange={setTimeUnit}>
              <SelectTrigger><SelectValue placeholder="Satuan" /></SelectTrigger>
              <SelectContent>
                {TIME_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_output_value">Target Output</Label>
            <Input id="target_output_value" name="target_output_value" type="number" min="1" placeholder="Jumlah" />
          </div>
          <div className="space-y-2">
            <Label>Satuan Output</Label>
            <Select value={outputUnit} onValueChange={setOutputUnit}>
              <SelectTrigger><SelectValue placeholder="Satuan" /></SelectTrigger>
              <SelectContent>
                {OUTPUT_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Relations & Notes */}
      <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6 space-y-4">
        <h2 className="font-semibold text-white">Hubungan & Keterangan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="internal_relation">Hubungan Internal</Label>
            <Textarea id="internal_relation" name="internal_relation" placeholder="Hubungan dengan unit internal..." rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="external_relation">Hubungan Eksternal</Label>
            <Textarea id="external_relation" name="external_relation" placeholder="Hubungan dengan pihak eksternal..." rows={2} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Keterangan</Label>
          <Textarea id="notes" name="notes" placeholder="Keterangan tambahan..." rows={2} />
        </div>
      </div>

      <Button type="submit" disabled={isPending} size="lg">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {isPending ? "Menyimpan..." : "Buat Indikator SKI"}
      </Button>
    </form>
  );
}
