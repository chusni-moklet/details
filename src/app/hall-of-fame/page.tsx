import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Crown, Award, Eye, FolderOpen } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { getHallOfFame } from "@/services/teachers";
import { getInitials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Hall of Fame",
  description: "Guru-guru terbaik SMK Telkom Malang berdasarkan sertifikasi, views, dan portofolio.",
};

const rankColors = [
  "from-yellow-400 to-amber-500",
  "from-gray-300 to-gray-400",
  "from-amber-600 to-amber-700",
];

export default async function HallOfFamePage() {
  const entries = await getHallOfFame(20);

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-sm mb-4">
              <Crown className="w-4 h-4" />
              Hall of Fame
            </div>
            <h1 className="text-4xl font-bold text-white font-display">
              Guru Terbaik SMK Telkom Malang
            </h1>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              Ranking berdasarkan jumlah sertifikasi, profile views, dan portofolio
            </p>
          </div>

          {/* Top 3 podium */}
          {entries.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-12 items-end">
              {[entries[1], entries[0], entries[2]].map((entry, podiumIndex) => {
                const heights   = ["h-32", "h-40", "h-28"];
                const rankIndex = podiumIndex === 0 ? 1 : podiumIndex === 1 ? 0 : 2;
                return (
                  <Link key={entry.teacher.id} href={`/teacher/${entry.teacher.slug}`} className="flex flex-col items-center gap-3 group">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-dark-600">
                        {entry.teacher.photo_url ? (
                          <Image src={entry.teacher.photo_url} alt={entry.teacher.full_name} width={64} height={64} className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                            <span className="text-sm font-bold text-red-400">{getInitials(entry.teacher.full_name)}</span>
                          </div>
                        )}
                      </div>
                      <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br ${rankColors[rankIndex]} flex items-center justify-center shadow-lg`}>
                        <span className="text-xs font-bold text-white">#{entry.rank}</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-white text-center group-hover:text-red-300 transition-colors">
                      {entry.teacher.full_name}
                    </p>
                    <div className={`w-full ${heights[podiumIndex]} rounded-t-xl bg-gradient-to-t from-dark-800 to-dark-700 border border-dark-600/50 flex items-center justify-center`}>
                      <span className="text-2xl font-bold text-dark-500">#{entry.rank}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Full ranking */}
          <div className="space-y-3">
            {entries.map((entry) => (
              <Link
                key={entry.teacher.id}
                href={`/teacher/${entry.teacher.slug}`}
                className="flex items-center gap-4 p-4 rounded-2xl border border-dark-700/50 bg-dark-800/40 hover:border-red-500/30 hover:bg-dark-800/70 transition-all duration-200 group"
              >
                {/* Rank */}
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${
                  entry.rank <= 3
                    ? `bg-gradient-to-br ${rankColors[entry.rank - 1]} text-white shadow-lg`
                    : "bg-dark-700 text-gray-400"
                }`}>
                  #{entry.rank}
                </div>

                {/* Photo */}
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-dark-600 flex-shrink-0">
                  {entry.teacher.photo_url ? (
                    <Image src={entry.teacher.photo_url} alt={entry.teacher.full_name} width={48} height={48} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                      <span className="text-sm font-bold text-red-400">{getInitials(entry.teacher.full_name)}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm group-hover:text-red-300 transition-colors truncate">
                    {entry.teacher.full_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {entry.teacher.department && (
                      <Badge variant="secondary" className="text-xs py-0">{entry.teacher.department.name}</Badge>
                    )}
                    {entry.teacher.subject && (
                      <span className="text-xs text-gray-500 truncate">{entry.teacher.subject}</span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Award className="w-3.5 h-3.5" />{entry.teacher.certification_count}
                  </span>
                  <span className="flex items-center gap-1 text-red-400">
                    <Eye className="w-3.5 h-3.5" />{entry.teacher.view_count}
                  </span>
                  <span className="flex items-center gap-1 text-green-400">
                    <FolderOpen className="w-3.5 h-3.5" />{entry.teacher.portfolio_count}
                  </span>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-white">{Math.round(entry.score)}</div>
                  <div className="text-xs text-gray-500">poin</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
