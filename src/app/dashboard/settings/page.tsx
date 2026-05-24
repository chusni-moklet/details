import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateTeacher } from "@/lib/getOrCreateTeacher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, QrCode, FileText, Shield } from "lucide-react";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const teacher = await getOrCreateTeacher(user);
  if (!teacher) redirect("/dashboard");

  const { data: userData } = await supabase
    .from("users")
    .select("role, created_at")
    .eq("id", user.id)
    .single();

  const role      = (userData as { role: string; created_at: string } | null)?.role ?? "teacher";
  const joinedAt  = (userData as { role: string; created_at: string } | null)?.created_at;

  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Pengaturan</h1>
        <p className="text-gray-400 mt-1">Kelola akun dan preferensi Anda</p>
      </div>

      {/* Account info */}
      <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6 space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-400" />
          Informasi Akun
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-dark-700/50">
            <span className="text-sm text-gray-400">Email</span>
            <span className="text-sm text-white">{user.email}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-dark-700/50">
            <span className="text-sm text-gray-400">Role</span>
            <Badge variant={role === "super_admin" ? "warning" : role === "admin_jurusan" ? "default" : "secondary"}>
              {role === "super_admin" ? "Super Admin" : role === "admin_jurusan" ? "Admin Jurusan" : "Guru"}
            </Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-dark-700/50">
            <span className="text-sm text-gray-400">Slug Profil</span>
            <code className="text-xs text-red-400 bg-dark-900 px-2 py-1 rounded">
              /teacher/{teacher.slug}
            </code>
          </div>
          {joinedAt && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-400">Bergabung</span>
              <span className="text-sm text-gray-300">
                {new Date(joinedAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6 space-y-4">
        <h2 className="font-semibold text-white">Tautan Cepat</h2>
        <div className="space-y-3">
          {[
            { icon: ExternalLink, label: "Profil Publik",  desc: "Lihat tampilan profil Anda",          href: `/teacher/${teacher.slug}`, external: true  },
            { icon: FileText,     label: "Download CV",    desc: "Generate CV otomatis dari profil",     href: `/api/cv/${teacher.slug}`,  external: true  },
            { icon: QrCode,       label: "QR Code Profil", desc: "Tersedia di halaman profil publik",    href: `/teacher/${teacher.slug}`, external: false },
          ].map(({ icon: Icon, label, desc, href, external }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-red-400" />
                <div>
                  <p className="text-sm text-white">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline">
                {external
                  ? <a href={href} target="_blank" rel="noopener noreferrer">Buka</a>
                  : <Link href={href}>Lihat</Link>
                }
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
        <h2 className="font-semibold text-red-400">Zona Berbahaya</h2>
        <p className="text-sm text-gray-400">
          Untuk menghapus akun atau mengubah email, hubungi administrator sekolah.
        </p>
        <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" disabled>
          Hapus Akun (Hubungi Admin)
        </Button>
      </div>
    </div>
  );
}
