"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, type CSSProperties } from "react";
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

function sidebarItemStyle(isActive: boolean): CSSProperties {
  return {
    background: isActive ? "var(--accent-l)" : "transparent",
    color: isActive ? "hsl(var(--accent))" : "var(--text3)",
    border: isActive ? "1px solid var(--accent-m)" : "1px solid transparent",
  };
}

function SidebarNavItem({
  href,
  icon: Icon,
  label,
  isActive,
  collapsed,
  onClick,
}: {
  href?: string;
  icon: typeof LayoutDashboard;
  label: string;
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const inner = (
    <div
      className={`flex items-center gap-3 rounded-lg py-2.5 transition-all duration-150 ${collapsed ? "justify-center px-0" : "px-3"}`}
      style={sidebarItemStyle(isActive)}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLDivElement).style.background = "var(--bg3)";
          (e.currentTarget as HTMLDivElement).style.color = "var(--text2)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          Object.assign((e.currentTarget as HTMLDivElement).style, sidebarItemStyle(false));
        }
      }}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="truncate text-[13px] font-medium"
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

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobile}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? "80px" : "256px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{
          background: "var(--sidebar)",
          borderRight: "1px solid var(--sidebar-b)",
        }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen flex flex-col overflow-hidden transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Logo */}
        <div
          className="flex shrink-0 items-center justify-between px-6 py-4 w-full"
          style={{ borderBottom: "1px solid var(--sidebar-b)" }}
        >
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                key="logo"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2.5"
              >
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{ background: "hsl(var(--accent))" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <span
                  className="font-semibold text-[15px] tracking-tight"
                  style={{ color: "var(--text)" }}
                >
                  Clario
                </span>
              </motion.div>
            )}
            {collapsed && (
              <motion.div
                key="collapsed-logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center w-full"
              >
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{ background: "hsl(var(--accent))" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav + footer — footer pinned to viewport bottom */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <nav className="min-h-0 flex-1 overflow-y-auto p-3 space-y-0.5">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname?.startsWith(item.href + "/"));
              const Icon = item.icon;

              return (
                <SidebarNavItem
                  key={item.name}
                  href={item.href}
                  icon={Icon}
                  label={item.name}
                  isActive={isActive}
                  collapsed={collapsed}
                  onClick={closeMobile}
                />
              );
            })}
          </nav>

          <div
            className="shrink-0 space-y-0.5 p-3 pb-4"
            style={{ borderTop: "1px solid var(--sidebar-b)" }}
          >
            {!isPro && !collapsed && (
              <Link
                href="/pricing"
                onClick={closeMobile}
                className="mb-1 block rounded-lg px-3 py-2.5 text-center text-[13px] font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--accent)), #f59e0b)",
                }}
              >
                Upgrade to Pro
              </Link>
            )}

            <SidebarNavItem
              href="/settings"
              icon={Settings}
              label="Settings"
              isActive={
                pathname === "/settings" ||
                (pathname?.startsWith("/settings/") ?? false)
              }
              collapsed={collapsed}
              onClick={closeMobile}
            />

            <SidebarNavItem
              icon={LogOut}
              label="Sign out"
              isActive={false}
              collapsed={collapsed}
              onClick={async () => {
                await signOut();
                router.push("/sign-in");
              }}
            />

            <SidebarNavItem
              icon={collapsed ? PanelLeft : PanelLeftClose}
              label="Collapse"
              isActive={false}
              collapsed={collapsed}
              onClick={() => setCollapsed(!collapsed)}
            />
          </div>
        </div>
      </motion.aside>
    </>
  );
}
