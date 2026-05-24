"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateTeacherProfile } from "@/app/actions/teacher";
import { SkillManager } from "./SkillManager";
import type { Department, TeacherWithStats } from "@/types";

interface ProfileEditFormProps {
  teacher: TeacherWithStats;
  departments: Department[];
}

export function ProfileEditForm({ teacher, departments }: ProfileEditFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [departmentId, setDepartmentId] = useState(teacher.department_id ?? "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("department_id", departmentId);

    startTransition(async () => {
      const result = await updateTeacherProfile(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Profil berhasil diperbarui");
        router.refresh();
      }
    });
  };

  return (
    <div className="max-w-3xl space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6 space-y-5">
          <h2 className="font-semibold text-white">Informasi Dasar</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap *</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={teacher.full_name}
                required
                placeholder="Nama lengkap Anda"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">Nama Panggilan</Label>
              <Input
                id="nickname"
                name="nickname"
                defaultValue={teacher.nickname ?? ""}
                placeholder="Nama panggilan"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Mata Pelajaran</Label>
              <Input
                id="subject"
                name="subject"
                defaultValue={teacher.subject ?? ""}
                placeholder="Contoh: Pemrograman Web"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Pengalaman (tahun)</Label>
              <Input
                id="experience"
                name="experience"
                type="number"
                min="0"
                max="50"
                defaultValue={teacher.experience ?? ""}
                placeholder="Jumlah tahun"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Program Keahlian</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jurusan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak ada</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.icon} {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={teacher.bio ?? ""}
              placeholder="Ceritakan tentang diri Anda, pengalaman mengajar, dan keahlian..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motto">Motto Mengajar</Label>
            <Input
              id="motto"
              name="motto"
              defaultValue={teacher.motto ?? ""}
              placeholder="Motto atau filosofi mengajar Anda"
            />
          </div>
        </div>

        {/* Social media */}
        <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6 space-y-5">
          <h2 className="font-semibold text-white">Social Media & Links</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                name="linkedin"
                type="url"
                defaultValue={teacher.linkedin ?? ""}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub URL</Label>
              <Input
                id="github"
                name="github"
                type="url"
                defaultValue={teacher.github ?? ""}
                placeholder="https://github.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={teacher.website ?? ""}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input
                id="instagram"
                name="instagram"
                type="url"
                defaultValue={teacher.instagram ?? ""}
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </form>

      {/* Photo upload section */}
      <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6 space-y-4">
        <h2 className="font-semibold text-white">Foto Profil</h2>
        <p className="text-sm text-gray-400">
          Upload foto profil profesional Anda. Gunakan foto dengan resolusi minimal 400x400px.
        </p>
        <PhotoUpload currentPhoto={teacher.photo_url} teacherSlug={teacher.slug} />
      </div>

      {/* Skills section */}
      <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6 space-y-4">
        <h2 className="font-semibold text-white">Skills & Kompetensi</h2>
        <SkillManager skills={teacher.skills ?? []} />
      </div>
    </div>
  );
}

function PhotoUpload({
  currentPhoto,
  teacherSlug,
}: {
  currentPhoto: string | null;
  teacherSlug: string;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", teacherSlug);

      const res = await fetch("/api/upload/photo", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      toast.success("Foto berhasil diupload");
      window.location.reload();
    } catch {
      toast.error("Gagal mengupload foto");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {currentPhoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentPhoto}
          alt="Current photo"
          className="w-16 h-16 rounded-xl object-cover border border-dark-600"
        />
      )}
      <label className="cursor-pointer">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
        <Button variant="outline" size="sm" asChild>
          <span>
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? "Mengupload..." : "Upload Foto"}
          </span>
        </Button>
      </label>
    </div>
  );
}
