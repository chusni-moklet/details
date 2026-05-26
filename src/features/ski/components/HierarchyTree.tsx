"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrganizationalUnit } from "../types";

interface HierarchyTreeProps {
  units: OrganizationalUnit[];
  level?: number;
  onSelect?: (unit: OrganizationalUnit) => void;
  selectedId?: string;
}

export function HierarchyTree({ units, level = 0, onSelect, selectedId }: HierarchyTreeProps) {
  return (
    <div className={cn("space-y-1", level > 0 && "ml-4 border-l border-dark-700/50 pl-3")}>
      {units.map((unit) => (
        <TreeNode
          key={unit.id}
          unit={unit}
          level={level}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
}

function TreeNode({
  unit, level, onSelect, selectedId,
}: {
  unit: OrganizationalUnit;
  level: number;
  onSelect?: (unit: OrganizationalUnit) => void;
  selectedId?: string;
}) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = (unit.children?.length ?? 0) > 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors group",
          selectedId === unit.id
            ? "bg-red-500/15 border border-red-500/25 text-red-300"
            : "hover:bg-dark-700/50 text-gray-300"
        )}
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          onSelect?.(unit);
        }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="text-gray-500 hover:text-gray-300 flex-shrink-0"
          >
            {expanded
              ? <ChevronDown className="w-3.5 h-3.5" />
              : <ChevronRight className="w-3.5 h-3.5" />
            }
          </button>
        ) : (
          <span className="w-3.5 flex-shrink-0" />
        )}

        <Building2 className="w-4 h-4 text-red-400/70 flex-shrink-0" />

        <span className="text-sm font-medium flex-1 truncate">{unit.name}</span>

        {unit.member_count !== undefined && (
          <span className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
            <Users className="w-3 h-3" />
            {unit.member_count}
          </span>
        )}
      </div>

      {hasChildren && expanded && (
        <HierarchyTree
          units={unit.children!}
          level={level + 1}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      )}
    </div>
  );
}
