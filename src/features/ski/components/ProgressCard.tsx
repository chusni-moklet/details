"use client";

import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "./StatusBadge";
import type { SKIIndicator } from "../types";

interface ProgressCardProps {
  indicator: SKIIndicator;
  progress?: number;
  onClick?: () => void;
}

export function ProgressCard({ indicator, progress = 0, onClick }: ProgressCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="p-4 rounded-xl border border-dark-700/50 bg-dark-800/40 hover:border-red-500/25 transition-all cursor-pointer space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white text-sm truncate">{indicator.title}</p>
          {indicator.category && (
            <p className="text-xs text-gray-500 mt-0.5">{indicator.category.name}</p>
          )}
        </div>
        <StatusBadge status={indicator.status} size="sm" />
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Progress</span>
          <span className="text-red-400 font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Tahun {indicator.period_year} · Sem {indicator.period_semester}</span>
        {indicator.target_output_value && (
          <span>Target: {indicator.target_output_value} {indicator.target_output_unit}</span>
        )}
      </div>
    </motion.div>
  );
}
