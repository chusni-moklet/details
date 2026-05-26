"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { assignUserPosition } from "../actions";
import type { OrganizationalUnit } from "../types";

interface AssignRoleFormProps {
  users:  Array<{ id: string; email: string }>;
  roles:  Array<{ id: string; name: string; level: number }>;
  units:  OrganizationalUnit[];
}

const ROLE_LABELS: Record<string, string> = {
  super_admin:   "Super Admin",
  management:    "Manajemen",
  kepala_urusan: "Kepala Urusan",
  pic:           "PIC",
  staff:         "Staff/Guru",
};

export function AssignRoleForm({ users, roles, units }: AssignRoleFormProps) {
  const [isPending, startTransition] = useTransition();
  const [userId,       setUserId]       = useState("");
  const [roleId,       setRoleId]       = useState("");
  const [unitId,       setUnitId]       = useState("none");
  const [supervisorId, setSupervisorId] = useState("none");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !roleId) { toast.error("Pilih pengguna dan role"); return; }

    const formData = new FormData();
    formData.set("user_id",       userId);
    formData.set("role_id",       roleId);
    if (unitId !== "none")       formData.set("unit_id",       unitId);
    if (supervisorId !== "none") formData.set("supervisor_id", supervisorId);

    startTransition(async () => {
      const result = await assignUserPosition(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Jabatan berhasil di-assign");
        setUserId(""); setRoleId(""); setUnitId("none"); setSupervisorId("none");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Pengguna *</Label>
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger><SelectValue placeholder="Pilih pengguna" /></SelectTrigger>
          <SelectContent>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Role / Jabatan *</Label>
        <Select value={roleId} onValueChange={setRoleId}>
          <SelectTrigger><SelectValue placeholder="Pilih role" /></SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {ROLE_LABELS[r.name] ?? r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Unit Organisasi</Label>
        <Select value={unitId} onValueChange={setUnitId}>
          <SelectTrigger><SelectValue placeholder="Pilih unit (opsional)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— Tanpa unit —</SelectItem>
            {units.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Atasan Langsung</Label>
        <Select value={supervisorId} onValueChange={setSupervisorId}>
          <SelectTrigger><SelectValue placeholder="Pilih atasan (opsional)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— Tanpa atasan —</SelectItem>
            {users.filter((u) => u.id !== userId).map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
        Assign Jabatan
      </Button>
    </form>
  );
}
