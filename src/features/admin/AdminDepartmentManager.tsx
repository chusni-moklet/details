"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Loader2, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface Department {
  id: string;
  name: string;
  icon: string;
  teacher_count: number;
}

interface AdminDepartmentManagerProps {
  departments: Department[];
}

export function AdminDepartmentManager({ departments: initial }: AdminDepartmentManagerProps) {
  const [departments, setDepartments] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const supabase = createClient();

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const icon = formData.get("icon") as string;

    startTransition(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("departments")
        .insert({ name, icon })
        .select()
        .single();

      if (error) {
        toast.error(error.message);
      } else {
        const newDept = data as Department;
        setDepartments((prev) => [...prev, { ...newDept, teacher_count: 0 }]);
        toast.success("kompetensi ditambahkan");
        setShowForm(false);
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  const handleDelete = (id: string, teacherCount: number) => {
    if (teacherCount > 0) {
      toast.error(`Tidak bisa mengHapus kompetensi yang masih memiliki ${teacherCount} guru`);
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.from("departments").delete().eq("id", id);
      if (error) {
        toast.error(error.message);
      } else {
        setDepartments((prev) => prev.filter((d) => d.id !== id));
        toast.success("kompetensi dihapus");
      }
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{departments.length} jurusan</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          Tambah Kompetensi
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl border border-red-500/20 bg-dark-800/60 p-5 space-y-4">
          <h3 className="font-medium text-white text-sm">Kompetensi Baru</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dept-name">Nama Kompetensi *</Label>
                <Input id="dept-name" name="name" required placeholder="Rekayasa Perangkat Lunak" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dept-icon">Emoji Icon *</Label>
                <Input id="dept-icon" name="icon" required placeholder="💻" maxLength={4} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Simpan
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                Batal
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {departments.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-dark-700">
          <GraduationCap className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Belum ada jurusan. Tambahkan jurusan pertama.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-dark-700/50 bg-dark-800/40 group"
            >
              <span className="text-2xl flex-shrink-0">{dept.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm">{dept.name}</p>
                <p className="text-xs text-gray-500">{dept.teacher_count} guru</p>
              </div>
              <Badge variant={dept.teacher_count > 0 ? "default" : "secondary"} className="flex-shrink-0">
                {dept.teacher_count} guru
              </Badge>
              <button
                onClick={() => handleDelete(dept.id, dept.teacher_count)}
                disabled={isPending || dept.teacher_count > 0}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Hapus kompetensi"
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
