"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Award, Eye, BookOpen, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getInitials, truncate } from "@/lib/utils";
import type { TeacherWithStats } from "@/types";

interface TeacherCardProps {
  teacher: TeacherWithStats;
  index?: number;
}

export function TeacherCard({ teacher, index = 0 }: TeacherCardProps) {
  const topSkills = teacher.skills?.slice(0, 3) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link href={`/teacher/${teacher.slug}`}>
        <div className="relative overflow-hidden rounded-2xl border border-dark-700/50 bg-dark-800/60 backdrop-blur-sm hover:border-red-500/40 hover:bg-dark-800/80 transition-all duration-300 shadow-lg hover:shadow-red-500/10 hover:shadow-xl">

          {/* Top red accent on hover */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-700 via-red-500 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Photo */}
          <div className="relative h-48 bg-gradient-to-br from-dark-700 to-dark-900 overflow-hidden">
            {teacher.photo_url ? (
              <Image
                src={teacher.photo_url}
                alt={teacher.full_name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-5xl font-bold text-red-500/30">
                  {getInitials(teacher.full_name)}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent" />

            {teacher.department && (
              <div className="absolute bottom-3 left-3">
                <Badge variant="dark" className="text-xs backdrop-blur-sm">
                  {teacher.department.icon} {teacher.department.name}
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-white text-base leading-tight group-hover:text-red-300 transition-colors">
                {teacher.full_name}
              </h3>
              {teacher.subject && (
                <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {teacher.subject}
                </p>
              )}
            </div>

            {teacher.motto && (
              <p className="text-xs text-gray-500 italic leading-relaxed">
                &ldquo;{truncate(teacher.motto, 60)}&rdquo;
              </p>
            )}

            {/* Skills */}
            {topSkills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {topSkills.map((skill) => (
                  <Badge key={skill.id} variant="default" className="text-xs py-0">
                    {skill.skill_name}
                  </Badge>
                ))}
                {(teacher.skills?.length ?? 0) > 3 && (
                  <Badge variant="secondary" className="text-xs py-0">
                    +{(teacher.skills?.length ?? 0) - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between pt-2 border-t border-dark-700/50">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-yellow-400" />
                  {teacher.certification_count}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-red-400" />
                  {teacher.view_count}
                </span>
                {teacher.experience && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-green-400" />
                    {teacher.experience}th
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-yellow-400 font-medium">
                  {teacher.completion_percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
