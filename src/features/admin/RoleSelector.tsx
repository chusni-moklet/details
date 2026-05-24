"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { updateUserRole } from "@/app/actions/admin";
import type { UserRole } from "@/types";

interface RoleSelectorProps {
  userId: string;
  currentRole: UserRole;
  isSelf: boolean;
}

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "teacher",       label: "Guru"          },
  { value: "admin_jurusan", label: "Admin Jurusan"  },
  { value: "super_admin",   label: "Super Admin"    },
];

export function RoleSelector({ userId, currentRole, isSelf }: RoleSelectorProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (newRole: string) => {
    if (newRole === currentRole) return;

    startTransition(async () => {
      const result = await updateUserRole(userId, newRole as UserRole);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Role berhasil diubah");
      }
    });
  };

  if (isSelf) {
    // Can't change own role — show static badge
    return (
      <span className="text-xs text-gray-500 italic">
        (akun Anda)
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={currentRole} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger className="h-8 w-[150px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {roleOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
    </div>
  );
}
