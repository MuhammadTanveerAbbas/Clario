"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Mic,
  Zap,
  Calendar,
  LogOut,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Summarizer", href: "/summarizer", icon: FileText },
  { name: "Remix Studio", href: "/remix", icon: Zap },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Brand Voice", href: "/brand-voice", icon: Mic },
  { name: "Calendar", href: "/calendar", icon: Calendar },
];

function SidebarNavItem({
  href,
  icon: Icon,
  label,
  isActive,
  collapsed,
  onClick,
  danger = false,
}: {
  href?: string;
  icon: typeof LayoutDashboard;
  label: string;
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
  danger?: boolean;
}) {
  const inner = (
    <div
      className={cn(
        "relative flex items-center rounded-xl py-2.5 text-[13px] font-medium transition-all duration-150 cursor-pointer select-none",
        collapsed ? "justify-center w-full px-0" : "gap-3 px-3",
        isActive
          ? "text-white"
          : danger
          ? "text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
          : "text-[var(--text3)] hover:text-[var(--text2)] hover:bg-white/[0.04]"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-xl bg-[hsl(var(--accent))]"
          style={{ zIndex: 0 }}
          transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
        />
      )}
      <Icon className={cn("h-4 w-4 flex-shrink-0 relative z-10", isActive && "text-white")} />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="truncate relative z-10 ml-3"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block" onClick={onClick}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" className="block w-full text-left" onClick={onClick}>
      {inner}
    </button>
  );
}

export function AppSidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const supabase = createClient();
  const [tier, setTier] = useState<"free" | "pro" | "enterprise">("free");

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        const t = data?.subscription_tier;
        if (t === "pro" || t === "enterprise" || t === "free") setTier(t);
      });
  }, [user?.id, supabase]);

  const isPro = tier === "pro" || tier === "enterprise";
  const closeMobile = () => setMobileOpen(false);

  const userInitials =
    user?.user_metadata?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? "72px" : "240px" }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen flex flex-col overflow-hidden transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        style={{
          background: "var(--sidebar)",
          borderRight: "1px solid var(--sidebar-b)",
        }}
      >
        {/* Logo */}
        <div className="flex h-[60px] shrink-0 items-center px-4">
          <AnimatePresence mode="wait">
            {collapsed ? (
              <motion.div
                key="icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: "hsl(var(--accent))" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
              </motion.div>
            ) : (
              <motion.div
                key="full"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: "hsl(var(--accent))" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[15px] font-semibold tracking-tight" style={{ color: "var(--text)" }}>
                    Clario
                  </span>
                  {isPro && (
                    <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-500">
                      Pro
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 pt-4 pb-2 space-y-0.5">
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text3)] opacity-50">
              Menu
            </p>
          )}
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href + "/"));

            return (
              <SidebarNavItem
                key={item.name}
                href={item.href}
                icon={item.icon}
                label={item.name}
                isActive={isActive}
                collapsed={collapsed}
                onClick={closeMobile}
              />
            );
          })}
        </nav>

        {/* Footer */}
        <div className="shrink-0 px-3 pb-4 pt-2 space-y-0.5">
          {/* Upgrade banner */}
          {!isPro && !collapsed && (
            <Link
              href="/pricing"
              onClick={closeMobile}
              className="mb-2 flex items-center gap-2.5 rounded-xl px-3 py-2.5 no-underline transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, hsl(var(--accent)) 0%, #f59e0b 100%)" }}
            >
              <Crown className="h-3.5 w-3.5 shrink-0 text-white" />
              <div className="flex flex-col leading-none">
                <span className="text-[12px] font-semibold text-white">Upgrade to Pro</span>
                <span className="mt-0.5 text-[10px] text-white/70">1000 req/month</span>
              </div>
            </Link>
          )}
          {!isPro && collapsed && (
            <Link
              href="/pricing"
              onClick={closeMobile}
              className="flex justify-center items-center w-full h-10 rounded-xl mb-1 no-underline transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, hsl(var(--accent)) 0%, #f59e0b 100%)" }}
              title="Upgrade to Pro"
            >
              <Crown className="h-4 w-4 text-white" />
            </Link>
          )}

          <SidebarNavItem
            href="/settings"
            icon={Settings}
            label="Settings"
            isActive={pathname === "/settings" || (pathname?.startsWith("/settings/") ?? false)}
            collapsed={collapsed}
            onClick={closeMobile}
          />

          <SidebarNavItem
            icon={LogOut}
            label="Sign out"
            isActive={false}
            collapsed={collapsed}
            danger
            onClick={async () => {
              await signOut();
              router.push("/sign-in");
            }}
          />

          {/* User row */}
          {!collapsed && (
            <div
              className="mt-3 flex items-center gap-2.5 rounded-xl px-3 py-2.5"
              style={{ background: "color-mix(in srgb, var(--sidebar-b) 60%, transparent)" }}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-400 text-[11px] font-bold text-white">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium" style={{ color: "var(--text2)" }}>
                  {user?.user_metadata?.name || user?.email?.split("@")[0] || "User"}
                </p>
                <p className="truncate text-[10px]" style={{ color: "var(--text3)" }}>
                  {isPro ? "Pro plan" : "Free plan"}
                </p>
              </div>
            </div>
          )}

          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "mt-1 flex items-center rounded-xl py-2 text-[13px] font-medium transition-all duration-150 text-[var(--text3)] hover:text-[var(--text2)] hover:bg-white/[0.04]",
              collapsed ? "justify-center w-full px-0" : "gap-3 px-3 w-full"
            )}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
