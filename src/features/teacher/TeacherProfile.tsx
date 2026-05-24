"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin,
  Briefcase,
  Globe,
  Award,
  Eye,
  FolderOpen,
  Download,
  Link2,
  GitBranch,
  Share2,
  AtSign,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SkillBadge } from "@/components/teacher/SkillBadge";
import { CertificateCard } from "@/components/teacher/CertificateCard";
import { PortfolioCard } from "@/components/teacher/PortfolioCard";
import { TimelineComponent } from "@/components/teacher/TimelineComponent";
import { QRProfileCard } from "@/components/teacher/QRProfileCard";
import { getInitials } from "@/lib/utils";
import type { TeacherWithStats } from "@/types";

interface TeacherProfileProps {
  teacher: TeacherWithStats;
}

export function TeacherProfile({ teacher }: TeacherProfileProps) {
  const socialLinks = [
    { icon: Link2,     href: teacher.linkedin,  label: "LinkedIn",  color: "hover:text-blue-400" },
    { icon: GitBranch, href: teacher.github,    label: "GitHub",    color: "hover:text-gray-200" },
    { icon: Globe,     href: teacher.website,   label: "Website",   color: "hover:text-green-400" },
    { icon: AtSign,    href: teacher.instagram, label: "Instagram", color: "hover:text-pink-400" },
  ].filter((s) => s.href);

  // Split portfolios: awards go to Prestasi tab, rest go to Portfolio tab
  const awardPortfolios    = teacher.portfolios?.filter((p) => p.type === "award") ?? [];
  const nonAwardPortfolios = teacher.portfolios?.filter((p) => p.type !== "award") ?? [];
  const totalAchievements  = (teacher.achievements?.length ?? 0) + awardPortfolios.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left sidebar ── */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-dark-700/50 bg-dark-800/60 overflow-hidden"
          >
            <div className="h-24 bg-gradient-to-br from-red-600/30 via-dark-700 to-dark-800" />

            <div className="px-6 pb-6">
              <div className="relative -mt-12 mb-4">
                <div className="w-24 h-24 rounded-2xl border-4 border-dark-800 overflow-hidden bg-dark-700">
                  {teacher.photo_url ? (
                    <Image
                      src={teacher.photo_url}
                      alt={teacher.full_name}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-red-400">
                        {getInitials(teacher.full_name)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <h1 className="text-xl font-bold text-white">{teacher.full_name}</h1>
              {teacher.nickname && (
                <p className="text-sm text-gray-400">&ldquo;{teacher.nickname}&rdquo;</p>
              )}

              {teacher.department && (
                <Badge variant="default" className="mt-2">
                  {teacher.department.icon} {teacher.department.name}
                </Badge>
              )}

              {teacher.subject && (
                <p className="text-sm text-gray-300 mt-2 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-gray-500" />
                  {teacher.subject}
                </p>
              )}

              {teacher.experience && (
                <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  {teacher.experience} tahun pengalaman
                </p>
              )}

              {teacher.motto && (
                <blockquote className="mt-4 text-sm text-gray-400 italic border-l-2 border-red-500/50 pl-3">
                  &ldquo;{teacher.motto}&rdquo;
                </blockquote>
              )}

              {socialLinks.length > 0 && (
                <div className="flex items-center gap-3 mt-4">
                  {socialLinks.map(({ icon: Icon, href, label, color }) => (
                    <a
                      key={label}
                      href={href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-gray-500 transition-colors ${color}`}
                      aria-label={label}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-5 space-y-4"
          >
            <h3 className="text-sm font-semibold text-gray-300">Statistik Profil</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Award,      value: teacher.certification_count, label: "Sertifikasi", color: "text-amber-400" },
                { icon: Eye,        value: teacher.view_count,          label: "Views",       color: "text-red-400"  },
                { icon: FolderOpen, value: teacher.portfolio_count,     label: "Portfolio",   color: "text-green-400" },
              ].map(({ icon: Icon, value, label, color }) => (
                <div key={label} className="text-center">
                  <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                  <div className={`text-lg font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Kelengkapan Profil</span>
                <span className="text-red-400 font-medium">{teacher.completion_percentage}%</span>
              </div>
              <Progress value={teacher.completion_percentage} />
            </div>
          </motion.div>

          {/* Share */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-dark-700/50 bg-dark-800/60 p-4"
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: teacher.full_name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
            >
              <Share2 className="w-4 h-4" />
              Bagikan Profil
            </Button>
          </motion.div>

          {/* QR Code */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <QRProfileCard
              teacherSlug={teacher.slug}
              teacherName={teacher.full_name}
            />
          </motion.div>

          {/* Download CV */}
          <Button variant="outline" className="w-full" asChild>
            <a href={`/api/cv/${teacher.slug}`} target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4" />
              Download CV
            </a>
          </Button>
        </div>

        {/* ── Main content ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2"
        >
          {teacher.bio && (
            <div className="mb-6 p-5 rounded-2xl border border-dark-700/50 bg-dark-800/40">
              <h2 className="text-sm font-semibold text-gray-300 mb-2">Tentang</h2>
              <p className="text-gray-300 text-sm leading-relaxed">{teacher.bio}</p>
            </div>
          )}

          <Tabs defaultValue="skills">
            <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1">
              <TabsTrigger value="skills">
                Skills ({teacher.skills?.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="certifications">
                Sertifikasi ({teacher.certification_count})
              </TabsTrigger>
              <TabsTrigger value="portfolio">
                Portfolio ({nonAwardPortfolios.length})
              </TabsTrigger>
              <TabsTrigger value="achievements">
                Prestasi ({totalAchievements})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="skills">
              {(teacher.skills?.length ?? 0) === 0 ? (
                <EmptyState message="Belum ada skill yang ditambahkan" />
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {teacher.skills?.map((skill) => (
                    <SkillBadge key={skill.id} skill={skill} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="certifications">
              {(teacher.certifications?.length ?? 0) === 0 ? (
                <EmptyState message="Belum ada sertifikasi" />
              ) : (
                <div className="space-y-3">
                  {teacher.certifications?.map((cert) => (
                    <CertificateCard key={cert.id} cert={cert} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="portfolio">
              {nonAwardPortfolios.length === 0 ? (
                <EmptyState message="Belum ada portfolio" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {nonAwardPortfolios.map((portfolio) => (
                    <PortfolioCard key={portfolio.id} portfolio={portfolio} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="achievements">
              {totalAchievements === 0 ? (
                <EmptyState message="Belum ada prestasi" />
              ) : (
                <div className="space-y-6">
                  {/* Portfolio tipe award */}
                  {awardPortfolios.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {awardPortfolios.map((portfolio) => (
                        <PortfolioCard key={portfolio.id} portfolio={portfolio} />
                      ))}
                    </div>
                  )}
                  {/* Achievements timeline */}
                  {(teacher.achievements?.length ?? 0) > 0 && (
                    <TimelineComponent achievements={teacher.achievements ?? []} />
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-gray-500">
      <p className="text-sm">{message}</p>
    </div>
  );
}
