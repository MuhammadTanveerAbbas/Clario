"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#compare", label: "Compare" },
];

function ClarioLogo({ compact = false, onClick }: { compact?: boolean; onClick?: () => void }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 shrink-0 no-underline group"
      onClick={onClick}
    >
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25 transition-all duration-300 group-hover:shadow-orange-500/40 group-hover:scale-[1.03]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <span
            className="font-serif text-[1.35rem] font-light tracking-tight text-stone-900"
            style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
          >
            Clario
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone-400 mt-0.5">
            AI for creators
          </span>
        </div>
      )}
    </Link>
  );
}

export function MktNav() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/92 backdrop-blur-xl border-b border-stone-200/90 shadow-[0_4px_24px_-4px_rgba(28,25,23,0.08)]"
            : "bg-white/70 backdrop-blur-lg border-b border-transparent"
        }`}
      >
        <div className="h-0.5 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 opacity-90" />

        <nav className="relative mx-auto flex h-[64px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <ClarioLogo />

          {/* Center nav — underline tab style */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2">
            <ul className="flex items-center list-none m-0 p-0">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = href === "/pricing" && pathname === "/pricing";
                return (
                  <li key={href} className="relative">
                    <Link
                      href={href}
                      className={`inline-flex items-center px-5 py-5 text-sm font-medium no-underline transition-colors duration-200 ${
                        isActive ? "text-stone-900" : "text-stone-500 hover:text-stone-900"
                      }`}
                    >
                      {label}
                    </Link>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500 rounded-full" />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 px-3.5 py-2 rounded-lg hover:bg-stone-100 transition-colors no-underline"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-lg transition-colors cursor-pointer border-0"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-stone-600 hover:text-stone-900 px-3.5 py-2 rounded-lg hover:bg-stone-100 transition-colors no-underline"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-stone-900 hover:bg-orange-600 px-4 py-2.5 rounded-lg transition-all no-underline shadow-sm shadow-stone-900/10 hover:shadow-orange-500/20"
                >
                  Get started
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors border border-stone-200/80 bg-white cursor-pointer"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-[100] lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div
          className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-[min(340px,92vw)] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 h-[64px] border-b border-stone-100">
            <ClarioLogo compact onClick={() => setMobileOpen(false)} />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-stone-700 hover:bg-stone-100 border border-stone-200 bg-white cursor-pointer"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-5 py-4 border-b border-stone-100 bg-gradient-to-br from-orange-50 to-amber-50/50">
            <div className="flex items-start gap-2.5">
              <Sparkles size={16} className="text-orange-500 mt-0.5 shrink-0" />
              <p className="text-sm text-stone-600 leading-relaxed m-0">
                Summarize videos, remix content, and chat with AI trained for creators.
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="text-base font-serif font-light text-stone-900 py-3.5 px-3 rounded-xl hover:bg-stone-50 no-underline transition-colors border border-transparent hover:border-stone-100"
                style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="p-5 border-t border-stone-100 flex flex-col gap-2.5 bg-stone-50/50">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center text-sm font-semibold text-white bg-stone-900 py-3.5 rounded-xl hover:bg-stone-800 no-underline transition-colors"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => { handleSignOut(); setMobileOpen(false); }}
                  className="w-full text-sm font-medium text-stone-600 py-3 rounded-xl hover:bg-white border border-stone-200 cursor-pointer bg-transparent transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-orange-500 py-3.5 rounded-xl hover:bg-orange-600 no-underline transition-colors"
                >
                  Get started free
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center text-sm font-semibold text-stone-900 border border-stone-200 py-3 rounded-xl hover:bg-white no-underline transition-colors bg-white"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
