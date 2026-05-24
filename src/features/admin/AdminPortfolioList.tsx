"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, ExternalLink, Trophy, Calendar, Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { verifyPortfolio } from "@/app/actions/teacher";
import { getInitials } from "@/lib/utils";

interface PortfolioWithTeacher {
  id: string;
  title: string;
  type: string;
  year: number | null;
  organizer: string | null;
  level: string | null;
  certificate_url: string | null;
  is_verified: boolean;
  created_at: string;
  teacher: { id: string; full_name: string; slug: string; photo_url: string | null } | null;
}

interface AdminPortfolioListProps {
  portfolios: PortfolioWithTeacher[];
}

const typeLabel: Record<string, string> = {
  project:     "Proyek",
  publication: "Publikasi",
  award:       "Penghargaan",
  other:       "Lainnya",
};

export function AdminPortfolioList({ portfolios: initial }: AdminPortfolioListProps) {
  const [portfolios, setPortfolios] = useState(initial);
  const [isPending, startTransition] = useTransition();

  const handleVerify = (id: string, verified: boolean) => {
    startTransition(async () => {
      const result = await verifyPortfolio(id, verified);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setPortfolios((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_verified: verified } : p))
        );
        toast.success(verified ? "Portfolio diverifikasi" : "Verifikasi dibatalkan");
      }
    });
  };

  const pending  = portfolios.filter((p) => !p.is_verified);
  const verified = portfolios.filter((p) =>  p.is_verified);

  return (
    <div className="max-w-4xl space-y-8">
      {/* Pending */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-yellow-400" />
          <h2 className="font-semibold text-white">Menunggu Verifikasi ({pending.length})</h2>
        </div>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">Tidak ada portfolio yang menunggu verifikasi</p>
        ) : (
          <div className="space-y-3">
            {pending.map((p) => (
              <PortfolioRow key={p.id} portfolio={p} onVerify={handleVerify} isPending={isPending} />
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
          {verified.map((p) => (
            <PortfolioRow key={p.id} portfolio={p} onVerify={handleVerify} isPending={isPending} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PortfolioRow({
  portfolio, onVerify, isPending,
}: {
  portfolio: PortfolioWithTeacher;
  onVerify: (id: string, verified: boolean) => void;
  isPending: boolean;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-dark-700/50 bg-dark-800/40">
      {/* Teacher photo */}
      {portfolio.teacher && (
        <Link href={`/teacher/${portfolio.teacher.slug}`} className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-dark-600">
            {portfolio.teacher.photo_url ? (
              <Image
                src={portfolio.teacher.photo_url}
                alt={portfolio.teacher.full_name}
                width={40} height={40}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                <span className="text-xs font-bold text-red-400">
                  {getInitials(portfolio.teacher.full_name)}
                </span>
              </div>
            )}
          </div>
        </Link>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-white text-sm">{portfolio.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {portfolio.teacher?.full_name} · {typeLabel[portfolio.type] ?? portfolio.type}
            </p>
            {/* Meta */}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
              {portfolio.year && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />{portfolio.year}
                </span>
              )}
              {portfolio.organizer && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Building2 className="w-3 h-3" />{portfolio.organizer}
                </span>
              )}
              {portfolio.level && (
                <span className="flex items-center gap-1 text-xs text-yellow-400">
                  <MapPin className="w-3 h-3" />{portfolio.level}
                </span>
              )}
            </div>
          </div>
          <Badge variant={portfolio.is_verified ? "success" : "warning"} className="flex-shrink-0">
            {portfolio.is_verified ? "Verified" : "Pending"}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mt-3">
          {portfolio.certificate_url && (
            <a
              href={portfolio.certificate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
            >
              <Trophy className="w-3 h-3" />
              Lihat Sertifikat
            </a>
          )}
          <div className="ml-auto flex gap-2">
            {!portfolio.is_verified ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVerify(portfolio.id, true)}
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
                onClick={() => onVerify(portfolio.id, false)}
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
