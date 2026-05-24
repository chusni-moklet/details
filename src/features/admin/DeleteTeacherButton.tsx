"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { adminDeleteTeacher } from "@/app/actions/teacher";

interface DeleteTeacherButtonProps {
  teacherId: string;
  teacherName: string;
}

export function DeleteTeacherButton({ teacherId, teacherName }: DeleteTeacherButtonProps) {
  const [open, setOpen]             = useState(false);
  const [isPending, startTransition] = useTransition();
  const router                       = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await adminDeleteTeacher(teacherId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`${teacherName} berhasil dihapus`);
        setOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <>
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={() => setOpen(true)}
        className="text-gray-500 hover:text-red-400 hover:bg-red-500/10"
        aria-label={`Hapus ${teacherName}`}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Hapus Guru
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-semibold text-white">{teacherName}</span>?
              <br />
              <span className="text-red-400 text-xs mt-1 block">
                Semua data termasuk sertifikasi, portfolio, dan prestasi akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
