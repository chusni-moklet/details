"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronRight, ChevronDown, Building2, Users,
  Pencil, Trash2, Check, X, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateOrganizationalUnit, deleteOrganizationalUnit } from "../actions";
import type { OrganizationalUnit } from "../types";

interface HierarchyTreeProps {
  units: OrganizationalUnit[];
  level?: number;
  onSelect?: (unit: OrganizationalUnit) => void;
  selectedId?: string;
  canManage?: boolean;
}

export function HierarchyTree({
  units, level = 0, onSelect, selectedId, canManage = false,
}: HierarchyTreeProps) {
  return (
    <div className={cn("space-y-1", level > 0 && "ml-4 border-l border-dark-700/50 pl-3")}>
      {units.map((unit) => (
        <TreeNode
          key={unit.id}
          unit={unit}
          level={level}
          onSelect={onSelect}
          selectedId={selectedId}
          canManage={canManage}
        />
      ))}
    </div>
  );
}

function TreeNode({
  unit, level, onSelect, selectedId, canManage,
}: {
  unit: OrganizationalUnit;
  level: number;
  onSelect?: (unit: OrganizationalUnit) => void;
  selectedId?: string;
  canManage: boolean;
}) {
  const [expanded, setExpanded]   = useState(level < 2);
  const [editing, setEditing]     = useState(false);
  const [editName, setEditName]   = useState(unit.name);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const hasChildren = (unit.children?.length ?? 0) > 0;

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    const formData = new FormData();
    formData.set("name", editName.trim());
    if (unit.description) formData.set("description", unit.description);
    if (unit.parent_id)   formData.set("parent_id", unit.parent_id);

    startTransition(async () => {
      const result = await updateOrganizationalUnit(unit.id, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Unit diperbarui");
        setEditing(false);
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    if (hasChildren) {
      toast.error("Hapus sub-unit terlebih dahulu sebelum menghapus unit ini");
      return;
    }
    if (!confirm(`Hapus unit "${unit.name}"?`)) return;

    startTransition(async () => {
      const result = await deleteOrganizationalUnit(unit.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Unit dihapus");
        router.refresh();
      }
    });
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors group",
          selectedId === unit.id
            ? "bg-red-500/15 border border-red-500/25 text-red-300"
            : "hover:bg-dark-700/50 text-gray-300",
          editing && "bg-dark-700/70"
        )}
      >
        {/* Expand toggle */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
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

        {/* Name — editable inline */}
        {editing ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-7 text-sm py-0 flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") { setEditing(false); setEditName(unit.name); }
              }}
              autoFocus
            />
            <button
              onClick={handleSaveEdit}
              disabled={isPending}
              className="text-green-400 hover:text-green-300 flex-shrink-0"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => { setEditing(false); setEditName(unit.name); }}
              className="text-gray-500 hover:text-red-400 flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <span
              className="text-sm font-medium flex-1 truncate cursor-pointer"
              onClick={() => { onSelect?.(unit); }}
            >
              {unit.name}
            </span>

            {unit.member_count !== undefined && (
              <span className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                <Users className="w-3 h-3" />
                {unit.member_count}
              </span>
            )}

            {/* Action buttons — visible on hover */}
            {canManage && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditing(true); }}
                  className="p-1 rounded text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                  title="Edit unit"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                  disabled={isPending}
                  className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  title={hasChildren ? "Hapus sub-unit dulu" : "Hapus unit"}
                >
                  {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <HierarchyTree
          units={unit.children!}
          level={level + 1}
          onSelect={onSelect}
          selectedId={selectedId}
          canManage={canManage}
        />
      )}
    </div>
  );
}
