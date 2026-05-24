"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(237,30,40,1) 1px, transparent 1px), linear-gradient(90deg, rgba(237,30,40,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Red glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-700/6 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center space-y-8">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-300 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            Digital Teacher Identity Platform
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight font-display">
              Temukan Profil{" "}
              <span className="gradient-text">Guru</span>
              <br />
              SMK Telkom Malang
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Platform identitas digital guru profesional. Eksplorasi kompetensi,
              sertifikasi, dan portofolio guru-guru berpengalaman kami.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="xl">
              <Link href="/teachers">
                <Users className="w-5 h-5" />
                Jelajahi Profil Guru
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/auth/login">
                <GraduationCap className="w-5 h-5" />
                Login sebagai Guru
              </Link>
            </Button>
          </motion.div>

          {/* Stats preview card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative mt-16 max-w-4xl mx-auto"
          >
            <div className="relative rounded-2xl border border-dark-700/60 bg-dark-800/50 backdrop-blur-sm p-6 shadow-2xl">
              {/* Top red accent */}
              <div className="absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full" />

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Guru Aktif",    value: "120+", color: "text-red-400"    },
                  { label: "Sertifikasi",   value: "500+", color: "text-yellow-400" },
                  { label: "Jurusan",       value: "8",    color: "text-green-400"  },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-red-500/8 blur-xl rounded-full" />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-gray-500">Scroll untuk menjelajahi</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-5 h-8 rounded-full border border-gray-600 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 bg-red-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
