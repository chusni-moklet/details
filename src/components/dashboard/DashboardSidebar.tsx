"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, User, Award, FolderOpen, Settings, LogOut,
  GraduationCap, ChevronLeft, ChevronRight, Trophy, BarChart3,
  Users, Shield, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types";

const teacherLinks = [
  { href: "/dashboard",                label: "Overview",    icon: LayoutDashboard },
  { href: "/dashboard/profile",        label: "Profil",      icon: User            },
  { href: "/dashboard/certifications", label: "Sertifikasi", icon: Award           },
  { href: "/dashboard/portfolio",      label: "Portfolio",   icon: FolderOpen      },
  { href: "/dashboard/achievements",   label: "Prestasi",    icon: Trophy          },
  { href: "/dashboard/settings",       label: "Pengaturan",  icon: Settings        },
];

const adminLinks = [
  { href: "/admin",                    label: "Dashboard",   icon: LayoutDashboard },
  { href: "/admin/teachers",           label: "Kelola Guru", icon: Users           },
  { href: "/admin/certifications",     label: "Verifikasi",  icon: Award           },
  { href: "/admin/analytics",          label: "Analytics",   icon: BarChart3       },
  { href: "/admin/departments",        label: "Jurusan",     icon: GraduationCap   },
  { href: "/admin/users",              label: "Users",       icon: Shield          },
];

interface DashboardSidebarProps {
  role: UserRole;
  userName: string;
  userEmail: string;
  photoUrl?: string | null;
}

export function DashboardSidebar({ role, userName, userEmail, photoUrl }: DashboardSidebarProps) {
  const [collapsed,    setCollapsed]    = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const pathname  = usePathname();
  const router    = useRouter();
  const supabase  = createClient();

  const isAdmin = role === "super_admin" || role === "admin_jurusan";
  const links   = isAdmin ? adminLinks : teacherLinks;

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Close on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500" />

      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-dark-700/60 min-h-[64px] mt-0.5">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/25">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="overflow-hidden">
            <span className="font-bold text-white text-sm whitespace-nowrap tracking-wide">DETAILS</span>
            <p className="text-xs text-gray-400 whitespace-nowrap">
              {isAdmin ? "Admin Panel" : "Teacher Portal"}
            </p>
          </div>
        )}
        {/* Close button on mobile */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon     = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed && !isMobile ? link.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-red-500/15 text-red-400 border border-red-500/25"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-red-400")} />
              {(!collapsed || isMobile) && (
                <span className="whitespace-nowrap overflow-hidden">{link.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="p-3 border-t border-dark-700/60 space-y-2">
        <div className={cn("flex items-center gap-3 px-3 py-2", collapsed && !isMobile && "justify-center")}>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-dark-700 border border-dark-600 overflow-hidden flex items-center justify-center">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-red-400">
                {userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {(!collapsed || isMobile) && (
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-white whitespace-nowrap truncate max-w-[140px]">
                {userName}
              </p>
              <p className="text-xs text-gray-500 whitespace-nowrap truncate max-w-[140px]">
                {userEmail}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          title={collapsed && !isMobile ? "Logout" : undefined}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200",
            collapsed && !isMobile && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-dark-900 border-b border-dark-700/60 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-red-500 flex items-center justify-center">
            <GraduationCap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-wide">DETAILS</span>
        </div>
      </div>

      {/* ── Mobile overlay backdrop ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-dark-900 border-r border-dark-700/60 overflow-hidden"
          >
            <SidebarContent isMobile />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden md:flex relative flex-col h-screen bg-dark-900 border-r border-dark-700/60 overflow-hidden flex-shrink-0"
      >
        <SidebarContent />

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all shadow-lg"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <ChevronRight className="w-3 h-3" />
            : <ChevronLeft  className="w-3 h-3" />
          }
        </button>
      </motion.aside>
    </>
  );
}
