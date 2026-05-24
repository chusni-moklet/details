import Link from "next/link";
import { GraduationCap, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 text-center space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-500 flex items-center justify-center mx-auto shadow-xl shadow-red-500/30">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>

        <div>
          <h1 className="text-6xl font-bold text-white font-display">404</h1>
          <h2 className="text-xl font-semibold text-gray-300 mt-2">Halaman tidak ditemukan</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/"><Home className="w-4 h-4" />Kembali ke Beranda</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/teachers"><Search className="w-4 h-4" />Cari Guru</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
