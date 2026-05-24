import Image from "next/image";
import { ExternalLink, FolderOpen, BookOpen, Trophy, MoreHorizontal, Calendar, Building2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { truncate, formatDate } from "@/lib/utils";
import type { Portfolio } from "@/types";

const typeConfig = {
  project:     { icon: FolderOpen,    label: "Proyek",       color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",     thumb: "from-red-900/40 to-dark-800"     },
  publication: { icon: BookOpen,      label: "Publikasi",    color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20", thumb: "from-green-900/40 to-dark-800"   },
  award:       { icon: Trophy,        label: "Penghargaan",  color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", thumb: "from-yellow-900/40 to-dark-800" },
  other:       { icon: MoreHorizontal,label: "Lainnya",      color: "text-gray-400",   bg: "bg-gray-500/10 border-gray-500/20",   thumb: "from-gray-900/40 to-dark-800"    },
};

// Check if URL is a direct image
function isImageUrl(url: string): boolean {
  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"];
  const lower = url.toLowerCase().split("?")[0];
  return imageExts.some((ext) => lower.endsWith(ext)) ||
    lower.includes("res.cloudinary.com") ||
    lower.includes("images.unsplash.com") ||
    lower.includes("imgur.com");
}

interface PortfolioCardProps {
  portfolio: Portfolio;
}

export function PortfolioCard({ portfolio }: PortfolioCardProps) {
  const config    = typeConfig[portfolio.type] ?? typeConfig.other;
  const Icon      = config.icon;
  const showImage = portfolio.media_url && isImageUrl(portfolio.media_url);

  return (
    <div className="group rounded-xl border border-dark-700/50 bg-dark-800/40 overflow-hidden hover:border-red-500/25 transition-all duration-200">

      {/* Thumbnail — image if available, else gradient placeholder */}
      <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${config.thumb}`}>
        {showImage ? (
          <Image
            src={portfolio.media_url!}
            alt={portfolio.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          /* Decorative placeholder with icon */
          <div className="flex flex-col items-center justify-center h-full gap-2 opacity-30">
            <Icon className={`w-10 h-10 ${config.color}`} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/70 via-transparent to-transparent" />

        {/* Level badge overlay */}
        {portfolio.level && (
          <div className="absolute bottom-2 left-2">
            <span className="flex items-center gap-1 text-xs text-yellow-300 bg-dark-900/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-yellow-500/30">
              <MapPin className="w-2.5 h-2.5" />
              {portfolio.level}
            </span>
          </div>
        )}

        {/* Pending badge overlay */}
        {!portfolio.is_verified && (
          <div className="absolute top-2 right-2">
            <Badge variant="warning" className="text-xs py-0 backdrop-blur-sm">Pending</Badge>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        {/* Type + date */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-md border flex items-center justify-center ${config.bg}`}>
              <Icon className={`w-3 h-3 ${config.color}`} />
            </div>
            <Badge variant="secondary" className="text-xs">{config.label}</Badge>
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0">{formatDate(portfolio.created_at)}</span>
        </div>

        {/* Title */}
        <h4 className="font-medium text-white text-sm group-hover:text-red-300 transition-colors leading-tight">
          {portfolio.title}
        </h4>

        {/* Meta: year + organizer */}
        {(portfolio.year || portfolio.organizer) && (
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {portfolio.year && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />{portfolio.year}
              </span>
            )}
            {portfolio.organizer && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Building2 className="w-3 h-3" />{portfolio.organizer}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-gray-400 leading-relaxed">
          {truncate(portfolio.description, 80)}
        </p>

        {/* Pending info */}
        {!portfolio.is_verified && (
          <p className="text-xs text-yellow-500/70">
            Menunggu verifikasi admin
          </p>
        )}

        {/* Links */}
        <div className="flex items-center gap-3 pt-0.5">
          {portfolio.media_url && (
            <a href={portfolio.media_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
              <ExternalLink className="w-3 h-3" />
              Lihat Detail
            </a>
          )}
          {portfolio.certificate_url && (
            <a href={portfolio.certificate_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
              <Trophy className="w-3 h-3" />
              Sertifikat
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
