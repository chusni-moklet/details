"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import type { Achievement } from "@/types";

interface TimelineComponentProps {
  achievements: Achievement[];
}

export function TimelineComponent({ achievements }: TimelineComponentProps) {
  const sorted = [...achievements].sort((a, b) => b.year - a.year);

  return (
    <div className="relative space-y-0">
      {/* Vertical line — Telkom red */}
      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-red-500/60 via-dark-600 to-transparent" />

      {sorted.map((achievement, index) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative flex gap-4 pb-6 last:pb-0"
        >
          {/* Dot */}
          <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-dark-800 border-2 border-red-500/50 flex items-center justify-center">
            <Trophy className="w-3.5 h-3.5 text-red-400" />
          </div>

          {/* Content */}
          <div className="flex-1 pt-0.5 pb-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-white text-sm leading-tight">
                {achievement.title}
              </h4>
              <span className="flex-shrink-0 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5">
                {achievement.year}
              </span>
            </div>
            {achievement.description && (
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                {achievement.description}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
