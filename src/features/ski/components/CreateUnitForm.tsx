"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createOrganizationalUnit } from "../actions";
import type { OrganizationalUnit } from "../types";
import { useState } from "react";

interface CreateUnitFormProps {
  units: OrganizationalUnit[];
}

function flattenUnits(units: OrganizationalUnit[], depth = 0): Array<{ id: string; name: string; depth: number }> {
  const result: Array<{ id: string; name: string; depth: number }> = [];
  for (const u of units) {
    result.push({ id: u.id, name: u.name, depth });
    if (u.children?.length) result.push(...flattenUnits(u.children, depth + 1));
  }
  return result;
}

export function CreateUnitForm({ units }: CreateUnitFormProps) {
  const [isPending, startTransition] = useTransition();
  const [parentId, setParentId]      = useState("none");
  const router                       = useRouter();
  const flatUnits                    = flattenUnits(units);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (parentId !== "none") formData.set("parent_id", parentId);

    startTransition(async () => {
      const result = await createOrganizationalUnit(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Unit berhasil dibuat");
        (e.target as HTMLFormElement).reset();
        setParentId("none");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="unit-name">Nama Unit *</Label>
        <Input id="unit-name" name="name" required placeholder="Contoh: Urusan Kurikulum" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit-desc">Deskripsi</Label>
        <Textarea id="unit-desc" name="description" placeholder="Deskripsi unit..." rows={2} />
      </div>

      <div className="space-y-2">
        <Label>Unit Induk</Label>
        <Select value={parentId} onValueChange={setParentId}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih induk (opsional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— Tidak ada (root) —</SelectItem>
            {flatUnits.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {"  ".repeat(u.depth)}{u.depth > 0 ? "└ " : ""}{u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        Buat Unit
      </Button>
    </form>
  );
}
