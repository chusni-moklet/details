"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkillBadge } from "@/components/teacher/SkillBadge";
import { addSkill, deleteSkill } from "@/app/actions/teacher";
import type { Skill } from "@/types";

interface SkillManagerProps {
  skills: Skill[];
}

export function SkillManager({ skills: initialSkills }: SkillManagerProps) {
  const [skills, setSkills] = useState(initialSkills);
  const [isPending, startTransition] = useTransition();
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced" | "expert">("intermediate");

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("level", level);

    startTransition(async () => {
      const result = await addSkill(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Skill ditambahkan");
        (e.target as HTMLFormElement).reset();
        // Optimistic update — page will refresh on next navigation
        window.location.reload();
      }
    });
  };

  const handleDelete = (skillId: string) => {
    startTransition(async () => {
      const result = await deleteSkill(skillId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setSkills((prev) => prev.filter((s) => s.id !== skillId));
        toast.success("Skill dihapus");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Add skill form */}
      <form onSubmit={handleAdd} className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[160px]">
          <Label htmlFor="skill_name" className="sr-only">Nama Skill</Label>
          <Input
            id="skill_name"
            name="skill_name"
            placeholder="Nama skill (contoh: React.js)"
            required
          />
        </div>
        <Select value={level} onValueChange={(v) => setLevel(v as typeof level)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Pemula</SelectItem>
            <SelectItem value="intermediate">Menengah</SelectItem>
            <SelectItem value="advanced">Mahir</SelectItem>
            <SelectItem value="expert">Ahli</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={isPending} size="default">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Tambah
        </Button>
      </form>

      {/* Skills list */}
      {skills.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          Belum ada skill. Tambahkan skill pertama Anda.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <div key={skill.id} className="flex items-center gap-1 group">
              <SkillBadge skill={skill} />
              <button
                onClick={() => handleDelete(skill.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-500/20 text-gray-500 hover:text-red-400"
                aria-label={`Hapus ${skill.skill_name}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
