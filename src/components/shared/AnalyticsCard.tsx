"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Award, Eye, FolderOpen, User, Users, BarChart3,
  TrendingUp,
} from "lucide-react";

// Map icon names to components to avoid passing class instances across server/client boundary
const iconMap = {
  Award, Eye, FolderOpen, User, Users, BarChart3, TrendingUp,
} as const;

export type IconName = keyof typeof iconMap;

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  iconName: IconName;
  trend?: { value: number; label: string };
  color?: "red" | "yellow" | "green" | "blue";
  index?: number;
}

const colorMap = {
  red:    { icon: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",       glow: "shadow-red-500/10"    },
  yellow: { icon: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", glow: "shadow-yellow-500/10" },
  green:  { icon: "text-green-400",  bg: "bg-green-500/10 border-green-500/20",   glow: "shadow-green-500/10"  },
  blue:   { icon: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20",     glow: "shadow-blue-500/10"   },
};

export function AnalyticsCard({
  title, value, subtitle, iconName, trend, color = "red", index = 0,
}: AnalyticsCardProps) {
  const colors = colorMap[color];
  const Icon   = iconMap[iconName];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "rounded-2xl border border-dark-700/50 bg-dark-800/60 p-6 shadow-lg",
        colors.glow
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center", colors.bg)}>
          <Icon className={cn("w-6 h-6", colors.icon)} />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1.5">
          <span className={cn("text-xs font-medium", trend.value >= 0 ? "text-green-400" : "text-red-400")}>
            {trend.value >= 0 ? "+" : ""}{trend.value}%
          </span>
          <span className="text-xs text-gray-500">{trend.label}</span>
        </div>
      )}
    </motion.div>
  );
}
