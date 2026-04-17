"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { TrendingUp, Globe, LogOut, LayoutDashboard } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/api";
import { getAppName, getLogoPath } from "@/lib/app-config";

const navItems = [
  { href: "/market", label: "Markets" },
  { href: "/?filter=trending", label: "Trending", matchPath: "/" },
  { href: "/blog", label: "Blog" },
  { href: "/central-de-games", label: "Games" },
  { href: "/contact", label: "Contato" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [settings, setSettings] = useState<{ siteName: string; logoUrl?: string }>({
    siteName: getAppName(),
  });

  useEffect(() => {
    api
      .get("/settings/general")
      .then((res) => setSettings(res.data))
      .catch(() => {});
  }, []);

  // Check if a nav item is active
  const isActive = (item: { href: string; matchPath?: string }) => {
    // Remove locale prefix from pathname (e.g., /pt/market -> /market)
    const cleanPath = pathname.replace(/^\/(pt|en|es)/, "") || "/";

    // For trending, check if we're on homepage with filter
    if (item.href === "/?filter=trending") {
      return cleanPath === "/" && typeof window !== "undefined" && window.location.search.includes("filter=trending");
    }

    // For other items, check if path starts with href
    const itemPath = item.matchPath || item.href.split("?")[0];
    if (itemPath === "/") {
      return cleanPath === "/";
    }
    return cleanPath.startsWith(itemPath);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-20 h-10 group-hover:scale-110 transition-transform overflow-hidden">
            {settings.logoUrl ? (
              <img
                src={`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3302").replace(/\/api$/, "")}${settings.logoUrl}`}
                alt={settings.siteName}
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={getLogoPath()}
                alt={getAppName()}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <span className="text-xl font-maven font-bold text-white tracking-tight">
            {getAppName()}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400 font-maven tracking-tight uppercase">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive(item)
                  ? "bg-blue-600 text-white px-5 py-2 rounded-xl transition-all hover:scale-105 shadow-lg shadow-blue-600/20"
                  : "hover:text-white transition-all hover:scale-105"
              }
            >
              {t(item.label)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-900/50 border border-white/5">
            <Link href="/" locale="pt" className="hover:scale-110 transition-transform" title="Português">
              <span className="text-lg leading-none">🇧🇷</span>
            </Link>
            <Link href="/" locale="en" className="hover:scale-110 transition-transform" title="English">
              <span className="text-lg leading-none">🇺🇸</span>
            </Link>
            <Link href="/" locale="es" className="hover:scale-110 transition-transform" title="Español">
              <span className="text-lg leading-none">🇵🇾</span>
            </Link>
          </div>

          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="w-10 h-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                title={t("Dashboard")}
              >
                <LayoutDashboard className="w-5 h-5" />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-10 h-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors"
                title={t("Log Out")}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-base hover:opacity-90 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-lg shadow-base/20"
            >
              {t("LOGIN")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
