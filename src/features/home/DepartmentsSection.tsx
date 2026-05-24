"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Department } from "@/types";

interface DepartmentsSectionProps {
  departments: Department[];
}

export function DepartmentsSection({ departments }: DepartmentsSectionProps) {
  return (
    <section className="py-20 bg-dark-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-white font-display mb-3">Program Keahlian</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Jelajahi guru berdasarkan program keahlian di SMK Telkom Malang
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {departments.map((dept, index) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Link
                href={`/teachers?department=${dept.id}`}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-dark-700/50 bg-dark-800/40 hover:border-red-500/40 hover:bg-dark-800/70 transition-all duration-300 text-center"
              >
                <span className="text-3xl">{dept.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-red-300 transition-colors">
                    {dept.name}
                  </p>
                  {dept.teacher_count !== undefined && (
                    <p className="text-xs text-gray-500 mt-0.5">{dept.teacher_count} guru</p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-red-400 transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
