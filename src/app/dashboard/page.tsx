import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateTeacher } from "@/lib/getOrCreateTeacher";
import { AnalyticsCard } from "@/components/shared/AnalyticsCard";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Circle, User, Award, FolderOpen, Eye } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const teacher = await getOrCreateTeacher(user);

  if (!teacher) {
    return (
      <div className="p-8 text-white">
        <h1 className="text-2xl font-bold mb-4">Selamat Datang!</h1>
        <p className="text-gray-400 mb-4">Profil Anda sedang disiapkan...</p>
        <a href="/dashboard" className="text-red-400 underline">Klik di sini untuk refresh</a>
      </div>
    );
  }

  const completionItems = [
    { label: "Foto Profil",    completed: !!teacher.photo_url,                       weight: 20 },
    { label: "Bio",            completed: !!teacher.bio,                              weight: 15 },
    { label: "Motto",          completed: !!teacher.motto,                            weight: 5  },
    { label: "Mata Pelajaran", completed: !!teacher.subject,                          weight: 10 },
    { label: "Pengalaman",     completed: !!teacher.experience,                       weight: 5  },
    { label: "LinkedIn",       completed: !!teacher.linkedin,                         weight: 5  },
    { label: "Skills",         completed: (teacher.skills?.length ?? 0) > 0,         weight: 15 },
    { label: "Sertifikasi",    completed: (teacher.certifications?.length ?? 0) > 0, weight: 15 },
    { label: "Portfolio",      completed: (teacher.portfolios?.length ?? 0) > 0,     weight: 10 },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            Selamat datang, {teacher.full_name.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-400 mt-1">Kelola profil profesional Anda di DETAILS</p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/teacher/${teacher.slug}`} target="_blank">
            <Eye className="w-3.5 h-3.5" />
            Lihat Profil
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard title="Sertifikasi"   value={teacher.certification_count}           iconName="Award"      color="yellow" index={0} />
        <AnalyticsCard title="Profile Views" value={teacher.view_count}                    iconName="Eye"        color="red"    index={1} />
        <AnalyticsCard title="Portfolio"     value={teacher.portfolio_count}               iconName="FolderOpen" color="green"  index={2} />
        <AnalyticsCard title="Kelengkapan"   value={`${teacher.completion_percentage}%`}   iconName="User"       color="blue"   index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile completion */}
        <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Kelengkapan Profil</h2>
            <span className="text-red-400 font-bold text-lg">{teacher.completion_percentage}%</span>
          </div>
          <Progress value={teacher.completion_percentage} className="h-3" />
          <div className="space-y-2 mt-4">
            {completionItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                {item.completed
                  ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  : <Circle      className="w-4 h-4 text-gray-600 flex-shrink-0" />
                }
                <span className={`text-sm ${item.completed ? "text-gray-300" : "text-gray-500"}`}>
                  {item.label}
                </span>
                <span className="ml-auto text-xs text-gray-600">+{item.weight}%</span>
              </div>
            ))}
          </div>
          <Button asChild variant="outline" size="sm" className="w-full mt-2">
            <Link href="/dashboard/profile">
              Lengkapi Profil <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6 space-y-4">
          <h2 className="font-semibold text-white">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/dashboard/profile",        label: "Edit Profil",         icon: User,       color: "text-red-400    bg-red-500/10    border-red-500/20"    },
              { href: "/dashboard/certifications", label: "Tambah Sertifikasi",  icon: Award,      color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
              { href: "/dashboard/portfolio",      label: "Tambah Portfolio",    icon: FolderOpen, color: "text-green-400  bg-green-500/10  border-green-500/20"  },
              { href: `/teacher/${teacher.slug}`,  label: "Lihat Profil Publik", icon: Eye,        color: "text-blue-400   bg-blue-500/10   border-blue-500/20"   },
            ].map(({ href, label, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dark-700/50 hover:border-dark-600 bg-dark-900/40 hover:bg-dark-900/60 transition-all duration-200 group"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-400 group-hover:text-gray-200 text-center transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
