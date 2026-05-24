"use client";

import { motion } from "framer-motion";
import { Users, Award, Eye, BookOpen } from "lucide-react";

interface StatsSectionProps {
  analytics: {
    total_teachers: number;
    total_certifications: number;
    total_views: number;
    departments: Array<{ name: string; count: number }>;
  };
}

export function StatsSection({ analytics }: StatsSectionProps) {
  const stats = [
    { icon: Users,    value: analytics.total_teachers,      label: "Guru Profesional",  color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20"    },
    { icon: Award,    value: analytics.total_certifications, label: "Total Sertifikasi", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    { icon: Eye,      value: analytics.total_views,          label: "Profile Views",     color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20"  },
    { icon: BookOpen, value: analytics.departments.length,   label: "Kompetensi",  color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20"    },
  ];

  return (
    <section className="py-20 bg-dark-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl border border-dark-700/50 bg-dark-800/50 backdrop-blur-sm"
              >
                <div className={`w-12 h-12 rounded-xl border mx-auto mb-4 flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                  {stat.value.toLocaleString("id-ID")}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
