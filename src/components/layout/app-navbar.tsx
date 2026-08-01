"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  Zap,
  Mic,
  Menu,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSidebar } from "@/contexts/SidebarContext";

const PAGE_META: Record<string, { label: string; icon: typeof LayoutDashboard }> = {
  "/dashboard":   { label: "Dashboard",    icon: LayoutDashboard },
  "/summarizer":  { label: "Summarizer",   icon: FileText },
  "/remix":       { label: "Remix Studio", icon: Zap },
  "/chat":        { label: "AI Chat",      icon: MessageSquare },
  "/brand-voice": { label: "Brand Voice",  icon: Mic },
  "/calendar":    { label: "Calendar",     icon: Calendar },
  "/settings":    { label: "Settings",     icon: Settings },
};

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { setMobileOpen, mobileOpen } = useSidebar();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const userInitials =
    user?.user_metadata?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  // Find current page meta
  const currentPage = Object.entries(PAGE_META).find(([href]) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href)
  );
  const PageIcon = currentPage?.[1].icon;
  const pageLabel = currentPage?.[1].label ?? "";

  return (
    <div
      className="sticky top-0 z-40 flex h-[52px] items-center gap-3 px-4 sm:px-5"
      style={{
        background: "var(--glass)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid hsl(var(--border))",
      }}
    >
      {/* Mobile hamburger */}
      <button
        className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-[var(--bg3)]"
        style={{ color: "var(--text3)" }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu size={16} />
      </button>

      {/* Page title */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {PageIcon && <PageIcon size={15} style={{ color: "hsl(var(--accent))", flexShrink: 0 }} />}
        <span className="text-[14px] font-semibold truncate" style={{ color: "var(--text)" }}>
          {pageLabel}
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        <Link href="/settings">
          <button
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
              pathname === "/settings"
                ? "bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]"
                : "hover:bg-[var(--bg3)] text-[var(--text3)] hover:text-[var(--text2)]"
            )}
          >
            <Settings size={14} />
          </button>
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-1.5 h-8 px-1.5 rounded-lg hover:bg-[var(--bg3)] transition-colors"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={userAvatar} alt="User" />
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-400 text-white text-[10px] font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <motion.div animate={{ rotate: userMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={12} style={{ color: "var(--text3)" }} />
            </motion.div>
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg z-50 overflow-hidden"
                  style={{
                    background: "var(--sidebar)",
                    border: "1px solid var(--sidebar-b)",
                    boxShadow: "var(--shadow-medium)",
                  }}
                >
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--sidebar-b)" }}>
                    <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text)" }}>
                      {user?.user_metadata?.name || "User"}
                    </p>
                    <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text3)" }}>
                      {user?.email}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
