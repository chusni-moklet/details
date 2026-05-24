import Image from "next/image";
import { ExternalLink, FolderOpen, BookOpen, Trophy, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { truncate, formatDate } from "@/lib/utils";
import type { Portfolio } from "@/types";

const typeConfig = {
  project:     { icon: FolderOpen,    label: "Proyek",       color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20"    },
  publication: { icon: BookOpen,      label: "Publikasi",    color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
  award:       { icon: Trophy,        label: "Penghargaan",  color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  other:       { icon: MoreHorizontal,label: "Lainnya",      color: "text-gray-400",   bg: "bg-gray-500/10 border-gray-500/20"  },
};

interface PortfolioCardProps {
  portfolio: Portfolio;
}

export function PortfolioCard({ portfolio }: PortfolioCardProps) {
  const config = typeConfig[portfolio.type];
  const Icon   = config.icon;

  return (
    <div className="group rounded-xl border border-dark-700/50 bg-dark-800/40 overflow-hidden hover:border-red-500/25 transition-all duration-200">
      {portfolio.media_url && (
        <div className="relative h-40 bg-dark-700 overflow-hidden">
          <Image
            src={portfolio.media_url}
            alt={portfolio.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
        </div>
      )}

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${config.bg}`}>
              <Icon className={`w-3.5 h-3.5 ${config.color}`} />
            </div>
            <Badge variant="secondary" className="text-xs">{config.label}</Badge>
          </div>
          <span className="text-xs text-gray-500">{formatDate(portfolio.created_at)}</span>
        </div>

        <h4 className="font-medium text-white text-sm group-hover:text-red-300 transition-colors">
          {portfolio.title}
        </h4>

        <p className="text-xs text-gray-400 leading-relaxed">
          {truncate(portfolio.description, 100)}
        </p>

        {portfolio.media_url && (
          <a
            href={portfolio.media_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Lihat Detail
          </a>
        )}
      </div>
    </div>
  );
}
