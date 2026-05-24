"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Crown, ArrowRight, Award, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import type { HallOfFameEntry } from "@/types";

const rankColors = [
  "from-yellow-400 to-amber-500",
  "from-gray-300 to-gray-400",
  "from-amber-600 to-amber-700",
];
const rankBg = [
  "border-yellow-500/40 bg-yellow-500/5",
  "border-gray-400/30 bg-gray-400/5",
  "border-amber-700/40 bg-amber-700/5",
];

interface HallOfFamePreviewProps {
  entries: Array<HallOfFameEntry & { rank: number }>;
}

export function HallOfFamePreview({ entries }: HallOfFamePreviewProps) {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Hall of Fame</span>
            </div>
            <h2 className="text-3xl font-bold text-white font-display">Guru Terbaik</h2>
            <p className="text-gray-400 mt-2">Ranking berdasarkan sertifikasi, views, dan portofolio</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/hall-of-fame">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.teacher.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Link href={`/teacher/${entry.teacher.slug}`}>
                <div className={`relative p-6 rounded-2xl border ${rankBg[index]} transition-all duration-300 hover:shadow-xl`}>
                  <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-br ${rankColors[index]} flex items-center justify-center shadow-lg`}>
                    <span className="text-sm font-bold text-white">#{entry.rank}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-dark-600 flex-shrink-0">
                      {entry.teacher.photo_url ? (
                        <Image src={entry.teacher.photo_url} alt={entry.teacher.full_name} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                          <span className="text-lg font-bold text-red-400">{getInitials(entry.teacher.full_name)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm truncate">{entry.teacher.full_name}</h3>
                      <p className="text-xs text-gray-400 truncate">
                        {entry.teacher.subject ?? entry.teacher.department?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dark-700/50">
                    <div className="flex items-center gap-1.5 text-xs text-yellow-400">
                      <Award className="w-3.5 h-3.5" />
                      <span>{entry.teacher.certification_count} sertifikasi</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-red-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{entry.teacher.view_count} views</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
