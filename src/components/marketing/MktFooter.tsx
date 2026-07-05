"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Mail, ArrowUpRight, Sparkles } from "lucide-react";

const PRODUCT_LINKS = [
  { href: "/summarizer", label: "AI Summarizer" },
  { href: "/chat", label: "AI Chat" },
  { href: "/remix", label: "Content Remix" },
  { href: "/brand-voice", label: "Brand Voice" },
  { href: "/calendar", label: "Content Calendar" },
];

const COMPANY_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "https://themvpguy.vercel.app", label: "About", external: true },
  { href: "mailto:muhammadtanveerabbas@outlook.com", label: "Contact", external: true },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/refund", label: "Refund Policy" },
];

const SOCIAL_LINKS = [
  { href: "https://github.com/MuhammadTanveerAbbas/Clario-ai", label: "GitHub", icon: Github },
  { href: "https://x.com/themvpguy", label: "Twitter", icon: Twitter },
  { href: "https://linkedin.com/in/muhammadtanveerabbas", label: "LinkedIn", icon: Linkedin },
  { href: "mailto:muhammadtanveerabbas@outlook.com", label: "Email", icon: Mail },
];

function FooterLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const className =
    "inline-flex items-center gap-1 text-sm text-stone-400 hover:text-orange-400 no-underline transition-colors group";

  if (external) {
    return (
      <a
        href={href}
        target={href.startsWith("mailto:") ? undefined : "_blank"}
        rel="noopener noreferrer"
        className={className}
      >
        {label}
        {!href.startsWith("mailto:") && (
          <ArrowUpRight size={12} className="opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all" />
        )}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export function MktFooter() {
  return (
    <footer className="bg-stone-950 text-stone-300">
      {/* CTA band */}
      <div className="border-b border-stone-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 rounded-2xl border border-stone-800 bg-gradient-to-br from-stone-900 to-stone-950 px-6 sm:px-8 py-8 sm:py-10">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles size={14} />
                Start creating smarter
              </div>
              <h3
                className="font-serif text-2xl sm:text-3xl font-light text-white tracking-tight mb-2"
                style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
              >
                Turn any content into your next hit.
              </h3>
              <p className="text-sm text-stone-400 leading-relaxed m-0">
                Summarize YouTube videos, articles, and notes. Remix for every platform. Free to start — no credit card required.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold no-underline transition-colors"
              >
                Get started free
                <ArrowUpRight size={14} />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-stone-700 hover:border-stone-600 text-stone-300 hover:text-white text-sm font-medium no-underline transition-colors"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Links grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2.5 no-underline mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span
                className="font-serif text-xl font-light text-white tracking-tight"
                style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
              >
                Clario
              </span>
            </Link>
            <p className="text-sm text-stone-500 leading-relaxed max-w-sm mb-6">
              AI-powered content platform for creators. Summarize videos, remix content, and chat with an AI that adapts to your brand voice.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-stone-800 text-stone-500 hover:text-white hover:border-stone-600 hover:bg-stone-900 transition-colors"
                  aria-label={label}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-300 mb-4">
              Product
            </h4>
            <ul className="space-y-3 list-none m-0 p-0">
              {PRODUCT_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <FooterLink href={href} label={label} />
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-300 mb-4">
              Company
            </h4>
            <ul className="space-y-3 list-none m-0 p-0">
              {COMPANY_LINKS.map(({ href, label, external }) => (
                <li key={href}>
                  <FooterLink href={href} label={label} external={external} />
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-300 mb-4">
              Legal
            </h4>
            <ul className="space-y-3 list-none m-0 p-0 mb-6">
              {LEGAL_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <FooterLink href={href} label={label} />
                </li>
              ))}
            </ul>
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-800 bg-stone-900/50 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] text-stone-500">All systems operational</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-600 m-0 text-center sm:text-left">
            © {new Date().getFullYear()} Clario. Built by{" "}
            <a
              href="https://themvpguy.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 no-underline transition-colors"
            >
              The MVP Guy
            </a>
          </p>
          <p className="text-xs text-stone-600 m-0">
            Made for creators who ship every week.
          </p>
        </div>
      </div>
    </footer>
  );
}
