import Link from "next/link";
import { GraduationCap, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-dark-700/60 bg-dark-900/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/25">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-sm tracking-wide">DETAILS</span>
                <p className="text-xs text-gray-400 leading-none mt-0.5">
                  Digital Educator Talent, Achievement &amp; Identity Library System
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Platform identitas digital guru SMK Telkom Malang. Menampilkan kompetensi,
              prestasi, dan portofolio profesional.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Navigasi</h4>
            <ul className="space-y-2">
              {[
                { href: "/",             label: "Beranda"       },
                { href: "/teachers",     label: "Profil Guru"  },
                { href: "/hall-of-fame", label: "Hall of Fame"  },
                { href: "/auth/login",   label: "Login Guru"    },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* School info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">SMK Telkom Malang</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Jl. Danau Ranau, Sawojajar</p>
              <p>Malang, Jawa Timur 65139</p>
              <a
                href="https://smktelkom-mlg.sch.id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 transition-colors block"
              >
                smktelkom-mlg.sch.id
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-dark-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} DETAILS — SMK Telkom Malang. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500" /> for educators
          </p>
        </div>
      </div>
    </footer>
  );
}
