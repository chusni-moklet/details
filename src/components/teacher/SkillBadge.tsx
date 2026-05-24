import { cn, getSkillLevelColor, getSkillLevelLabel } from "@/lib/utils";
import type { Skill } from "@/types";

interface SkillBadgeProps {
  skill: Skill;
  showLevel?: boolean;
  size?: "sm" | "md";
}

export function SkillBadge({ skill, showLevel = true, size = "md" }: SkillBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors",
        getSkillLevelColor(skill.level),
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      {skill.skill_name}
      {showLevel && (
        <span className="opacity-60 text-xs">· {getSkillLevelLabel(skill.level)}</span>
      )}
    </span>
  );
}
