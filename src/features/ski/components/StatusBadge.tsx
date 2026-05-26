import { cn } from "@/lib/utils";
import { SKI_STATUS_CONFIG, type SKIStatus } from "../types";

interface StatusBadgeProps {
  status: SKIStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = SKI_STATUS_CONFIG[status];
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border font-medium",
      config.color, config.bg,
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
    )}>
      {config.label}
    </span>
  );
}
