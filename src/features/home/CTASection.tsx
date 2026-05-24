"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn, ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900" />
      {/* Red accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/3 via-transparent to-red-500/3" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
            <GraduationCap className="w-4 h-4" />
            Untuk Guru SMK Telkom Malang
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white font-display leading-tight">
            Bangun Identitas Digital
            <br />
            <span className="gradient-text">Profesional Anda</span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Login dengan akun sekolah dan mulai kelola profil profesional Anda.
            Tampilkan kompetensi, sertifikasi, dan portofolio kepada dunia.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="xl">
              <Link href="/auth/login">
                <LogIn className="w-5 h-5" />
                Login dengan Akun Sekolah
              </Link>
            </Button>
            <Button asChild size="xl" variant="ghost">
              <Link href="/teachers">
                Lihat Profil Guru
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            Hanya untuk email @smktelkom-mlg.sch.id
          </p>
        </motion.div>
      </div>
    </section>
  );
}
