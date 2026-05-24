"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeacherCard } from "@/components/teacher/TeacherCard";
import type { TeacherWithStats } from "@/types";

interface FeaturedTeachersProps {
  teachers: TeacherWithStats[];
}

export function FeaturedTeachers({ teachers }: FeaturedTeachersProps) {
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
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Guru Unggulan</span>
            </div>
            <h2 className="text-3xl font-bold text-white font-display">Guru Berprestasi</h2>
            <p className="text-gray-400 mt-2">Guru dengan sertifikasi dan pencapaian terbanyak</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/teachers">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher, index) => (
            <TeacherCard key={teacher.id} teacher={teacher} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
