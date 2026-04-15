"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import {
  TrendingUp,
  Settings,
  LayoutDashboard,
  Users,
  Grid,
  CreditCard,
  HelpCircle,
  LogOut,
  Bell,
  Search,
  ShieldCheck,
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const pathname = usePathname();

  const menuItems = [
    { label: t("Dashboard"), icon: LayoutDashboard, href: "/dashboard/admin" },
    { label: t("Users"), icon: Users, href: "/dashboard/admin/users" },
    { label: t("Categories"), icon: Grid, href: "/dashboard/admin/categories" },
    { label: t("Markets"), icon: TrendingUp, href: "/dashboard/admin/markets" },
    {
      label: t("Finances"),
      icon: CreditCard,
      href: "/dashboard/admin/finances",
    },
    { label: t("Support"), icon: HelpCircle, href: "/dashboard/admin/tickets" },
    { label: t("Security"), icon: ShieldCheck, href: "/dashboard/admin/2fa" },
    { label: t("Settings"), icon: Settings, href: "/dashboard/admin/settings" },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden font-maven">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col bg-slate-950">
        <div className="p-6">
          <Link href="/dashboard/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-base flex items-center justify-center shadow-lg shadow-base/20">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Admin Console
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm group ${
                  isActive
                    ? "bg-base text-white shadow-lg shadow-base/20"
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500 group-hover:text-white"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            {t("Log Out")}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-white/5 bg-slate-950/50 backdrop-blur-md px-8 flex items-center justify-between z-40">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder={t("Global search...")}
                className="w-full bg-white/5 border border-white/5 rounded-full py-2 pl-10 pr-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-base transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-white transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-base rounded-full border-2 border-slate-950" />
            </button>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">
                  Admin User
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Master Panel
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-base/20 border border-base/30 flex items-center justify-center">
                <Users className="w-4 h-4 text-base" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
