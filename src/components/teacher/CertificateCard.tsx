import { Award, ExternalLink, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";
import type { Certification } from "@/types";

interface CertificateCardProps {
  cert: Certification;
}

export function CertificateCard({ cert }: CertificateCardProps) {
  const isExpired = cert.expired_date
    ? new Date(cert.expired_date) < new Date()
    : false;

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-dark-700/50 bg-dark-800/40 hover:border-red-500/25 transition-all duration-200 group">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
        <Award className="w-5 h-5 text-yellow-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium text-white text-sm leading-tight group-hover:text-red-300 transition-colors">
              {cert.title}
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">{cert.issuer}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {cert.is_verified ? (
              <Badge variant="success" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="warning" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Pending
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-gray-500">
            {formatDateShort(cert.issue_date)}
            {cert.expired_date && (
              <span className={isExpired ? "text-red-400" : ""}>
                {" "}→ {formatDateShort(cert.expired_date)}
                {isExpired && " (Expired)"}
              </span>
            )}
          </span>
          {cert.credential_url && (
            <a
              href={cert.credential_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Lihat
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
