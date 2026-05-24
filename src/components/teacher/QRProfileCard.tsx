"use client";

import { useEffect, useRef } from "react";
import { QrCode, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRProfileCardProps {
  teacherSlug: string;
  teacherName: string;
}

export function QRProfileCard({ teacherSlug, teacherName }: QRProfileCardProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://details.moklet.com"}/teacher/${teacherSlug}`;

  useEffect(() => {
    async function generateQR() {
      if (!canvasRef.current) return;
      try {
        const QRCode = (await import("qrcode")).default;
        await QRCode.toCanvas(canvasRef.current, profileUrl, {
          width: 200,
          margin: 2,
          color: {
            dark:  "#ED1E28",   // Telkom red
            light: "#1A1A1A",   // dark background
          },
        });
      } catch (err) {
        console.error("QR generation failed:", err);
      }
    }
    generateQR();
  }, [profileUrl]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link      = document.createElement("a");
    link.download   = `qr-${teacherSlug}.png`;
    link.href       = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-dark-700/50 bg-dark-800/40">
      <div className="flex items-center gap-2 text-gray-300">
        <QrCode className="w-4 h-4 text-red-400" />
        <span className="text-sm font-medium">QR Profile</span>
      </div>

      <div className="p-3 rounded-xl bg-dark-900 border border-dark-700/50">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>

      <p className="text-xs text-gray-500 text-center max-w-[180px] leading-relaxed">
        Scan untuk melihat profil {teacherName}
      </p>

      <Button variant="outline" size="sm" onClick={handleDownload} className="w-full">
        <Download className="w-3.5 h-3.5" />
        Download QR
      </Button>
    </div>
  );
}
