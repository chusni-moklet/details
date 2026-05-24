"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { verifyCertification } from "@/app/actions/teacher";
import { formatDateShort, getInitials } from "@/lib/utils";

interface CertWithTeacher {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  expired_date: string | null;
  credential_url: string | null;
  is_verified: boolean;
  teacher: { id: string; full_name: string; slug: string; photo_url: string | null } | null;
}

interface AdminCertificationListProps {
  certifications: CertWithTeacher[];
}

export function AdminCertificationList({ certifications: initial }: AdminCertificationListProps) {
  const [certs, setCerts]   = useState(initial);
  const [isPending, startTransition] = useTransition();

  const handleVerify = (certId: string, verified: boolean) => {
    startTransition(async () => {
      const result = await verifyCertification(certId, verified);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setCerts((prev) => prev.map((c) => (c.id === certId ? { ...c, is_verified: verified } : c)));
        toast.success(verified ? "Sertifikasi diverifikasi" : "Verifikasi dibatalkan");
      }
    });
  };

  const pending  = certs.filter((c) => !c.is_verified);
  const verified = certs.filter((c) =>  c.is_verified);

  return (
    <div className="max-w-4xl space-y-8">
      {/* Pending */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-yellow-400" />
          <h2 className="font-semibold text-white">Menunggu Verifikasi ({pending.length})</h2>
        </div>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">Tidak ada sertifikasi yang menunggu verifikasi</p>
        ) : (
          <div className="space-y-3">
            {pending.map((cert) => (
              <CertRow key={cert.id} cert={cert} onVerify={handleVerify} isPending={isPending} />
            ))}
          </div>
        )}
      </div>

      {/* Verified */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <h2 className="font-semibold text-white">Sudah Diverifikasi ({verified.length})</h2>
        </div>
        <div className="space-y-3">
          {verified.map((cert) => (
            <CertRow key={cert.id} cert={cert} onVerify={handleVerify} isPending={isPending} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CertRow({
  cert, onVerify, isPending,
}: {
  cert: CertWithTeacher;
  onVerify: (id: string, verified: boolean) => void;
  isPending: boolean;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-dark-700/50 bg-dark-800/40">
      {cert.teacher && (
        <Link href={`/teacher/${cert.teacher.slug}`} className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-dark-600">
            {cert.teacher.photo_url ? (
              <Image src={cert.teacher.photo_url} alt={cert.teacher.full_name} width={40} height={40} className="object-cover" />
            ) : (
              <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                <span className="text-xs font-bold text-red-400">{getInitials(cert.teacher.full_name)}</span>
              </div>
            )}
          </div>
        </Link>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-white text-sm">{cert.title}</p>
            <p className="text-xs text-gray-400">
              {cert.teacher?.full_name} · {cert.issuer} · {formatDateShort(cert.issue_date)}
            </p>
          </div>
          <Badge variant={cert.is_verified ? "success" : "warning"} className="flex-shrink-0">
            {cert.is_verified ? "Verified" : "Pending"}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mt-3">
          {cert.credential_url && (
            <a
              href={cert.credential_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Lihat Kredensial
            </a>
          )}
          <div className="ml-auto flex gap-2">
            {!cert.is_verified ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVerify(cert.id, true)}
                disabled={isPending}
                className="text-green-400 border-green-500/30 hover:bg-green-500/10 h-7 text-xs"
              >
                <CheckCircle className="w-3 h-3" />
                Verifikasi
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onVerify(cert.id, false)}
                disabled={isPending}
                className="text-gray-500 hover:text-red-400 h-7 text-xs"
              >
                <XCircle className="w-3 h-3" />
                Batalkan
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
