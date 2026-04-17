"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Users,
  BarChart3,
  Settings,
  LogOut,
  LayoutDashboard,
  Tag,
  FileText,
  Ticket,
  CreditCard,
  PiggyBank,
  ChevronDown,
  ChevronRight,
  Zap,
  BellRing,
  Layers,
  Search,
  Menu,
  X,
  Globe,
  KeyRound,
  User,
  Wrench,
  Clock,
  Trophy,
  UsersRound,
  CircleDollarSign,
  Bot,
  Shield,
  Eye,
  BookOpen,
  Wallet,
  Coins,
  Languages,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import {
  PermissionsProvider,
  usePermissions,
  getRouteKeyFromPath,
} from "@/contexts/PermissionsContext";
import { TranslationProvider, useTranslation } from "@/contexts/TranslationContext";

interface MenuItem {
  label: string;
  labelKey?: string; // Translation key for label
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  submenu?: { label: string; labelKey?: string; href: string }[];
  routeKey?: string; // Key used for permission checking
  adminOnly?: boolean; // Only visible to super admin
}

interface AdminNotification {
  id?: number;
  title?: string;
  isRead?: boolean;
  createdAt?: string;
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", labelKey: "menu.dashboard", href: "/dashboard", icon: LayoutDashboard, routeKey: "dashboard" },
  { label: "Categories", labelKey: "menu.categories", href: "/dashboard/categories", icon: Layers, routeKey: "categories" },
  { label: "Subcategories", labelKey: "menu.subcategories", href: "/dashboard/subcategories", icon: Tag, routeKey: "subcategories" },
  {
    label: "Markets", labelKey: "menu.markets",
    icon: BarChart3, routeKey: "markets",
    submenu: [
      { label: "Add New", labelKey: "menu.markets.create", href: "/dashboard/markets/create" },
      { label: "Draft Markets", labelKey: "menu.markets.draft", href: "/dashboard/markets/draft" },
      { label: "Upcoming Markets", labelKey: "menu.markets.upcoming", href: "/dashboard/markets/upcoming" },
      { label: "Live Markets", labelKey: "menu.markets.live", href: "/dashboard/markets/live" },
      { label: "Closing Soon", labelKey: "menu.markets.closing", href: "/dashboard/markets/closing-soon" },
      { label: "Pending Resolution", labelKey: "menu.markets.pending", href: "/dashboard/markets/pending" },
      { label: "Declared Markets", labelKey: "menu.markets.declared", href: "/dashboard/markets/declared" },
      { label: "Completed Markets", labelKey: "menu.markets.completed", href: "/dashboard/markets/completed" },
      { label: "Disabled Markets", labelKey: "menu.markets.disabled", href: "/dashboard/markets/disabled" },
      { label: "Cancelled Markets", labelKey: "menu.markets.cancelled", href: "/dashboard/markets/cancelled" },
      { label: "All Markets", labelKey: "menu.markets.all", href: "/dashboard/markets" },
    ],
  },
  {
    label: "Manage Users", labelKey: "menu.users",
    icon: Users, routeKey: "users",
    submenu: [
      { label: "Active Users", labelKey: "menu.users.active", href: "/dashboard/users/active" },
      { label: "Banned Users", labelKey: "menu.users.banned", href: "/dashboard/users/banned" },
      { label: "Email Unverified", labelKey: "menu.users.emailUnverified", href: "/dashboard/users/email-unverified" },
      { label: "Mobile Unverified", labelKey: "menu.users.mobileUnverified", href: "/dashboard/users/mobile-unverified" },
      { label: "KYC Unverified", labelKey: "menu.users.kycUnverified", href: "/dashboard/users/kyc-unverified" },
      { label: "KYC Pending", labelKey: "menu.users.kycPending", href: "/dashboard/users/kyc-pending" },
      { label: "With Balance", labelKey: "menu.users.withBalance", href: "/dashboard/users/with-balance" },
      { label: "All Users", labelKey: "menu.users.all", href: "/dashboard/users" },
      { label: "Send Notification", labelKey: "menu.users.sendNotification", href: "/dashboard/users/send-notification" },
    ],
  },
  {
    label: "Deposits", labelKey: "menu.deposits",
    icon: CreditCard, routeKey: "deposits",
    submenu: [
      { label: "Pending Deposits", labelKey: "menu.deposits.pending", href: "/dashboard/deposits/pending" },
      { label: "Approved Deposits", labelKey: "menu.deposits.approved", href: "/dashboard/deposits/approved" },
      { label: "Successful Deposits", labelKey: "menu.deposits.successful", href: "/dashboard/deposits/successful" },
      { label: "Rejected Deposits", labelKey: "menu.deposits.rejected", href: "/dashboard/deposits/rejected" },
      { label: "Initiated Deposits", labelKey: "menu.deposits.initiated", href: "/dashboard/deposits/initiated" },
      { label: "All Deposits", labelKey: "menu.deposits.all", href: "/dashboard/deposits" },
    ],
  },
  {
    label: "Withdrawals", labelKey: "menu.withdrawals",
    icon: PiggyBank, routeKey: "withdrawals",
    submenu: [
      { label: "Pending Withdrawals", labelKey: "menu.withdrawals.pending", href: "/dashboard/withdrawals/pending" },
      { label: "Approved Withdrawals", labelKey: "menu.withdrawals.approved", href: "/dashboard/withdrawals/approved" },
      { label: "Rejected Withdrawals", labelKey: "menu.withdrawals.rejected", href: "/dashboard/withdrawals/rejected" },
      { label: "All Withdrawals", labelKey: "menu.withdrawals.all", href: "/dashboard/withdrawals" },
    ],
  },
  {
    label: "Reports", labelKey: "menu.reports",
    icon: FileText, routeKey: "reports",
    submenu: [
      { label: "Transactions", labelKey: "menu.reports.transactions", href: "/dashboard/reports/transactions" },
      { label: "Purchases", labelKey: "menu.reports.purchases", href: "/dashboard/reports/purchases" },
      { label: "Login History", labelKey: "menu.reports.logins", href: "/dashboard/reports/logins" },
    ],
  },
  {
    label: "Support", labelKey: "menu.support",
    icon: Ticket, routeKey: "support",
    submenu: [
      { label: "All Tickets", labelKey: "menu.support.all", href: "/dashboard/support" },
      { label: "Pending", labelKey: "menu.support.pending", href: "/dashboard/support/pending" },
    ],
  },
  {
    label: "Game", labelKey: "menu.game",
    icon: Trophy, routeKey: "game",
    submenu: [
      { label: "Statistics", labelKey: "menu.game.statistics", href: "/dashboard/game/statistics" },
      { label: "Tasks", labelKey: "menu.game.tasks", href: "/dashboard/game/tasks" },
      { label: "Referrals", labelKey: "menu.game.referrals", href: "/dashboard/game/referrals" },
      { label: "Coin Transactions", labelKey: "menu.game.coins", href: "/dashboard/game/coins" },
    ],
  },
  { label: "Blog", labelKey: "menu.blog", href: "/dashboard/blog", icon: BookOpen, routeKey: "blog" },
  { label: "Gateways", labelKey: "menu.gateways", href: "/dashboard/gateways", icon: Wallet, routeKey: "gateways" },
  { label: "Settings", labelKey: "menu.settings", href: "/dashboard/settings", icon: Settings, routeKey: "settings" },
  { label: "Notifications", labelKey: "menu.notifications", href: "/dashboard/notifications", icon: BellRing, routeKey: "notifications" },
  { label: "Groups", labelKey: "menu.groups", href: "/dashboard/grupos", icon: UsersRound, routeKey: "grupos" },
  {
    label: process.env.NEXT_PUBLIC_COIN_NAME || "Blockchain",
    labelKey: "menu.blockchain",
    icon: Coins, routeKey: "blockchain",
    submenu: [
      { label: "Dashboard", labelKey: "menu.blockchain.dashboard", href: "/dashboard/blockchain" },
      { label: "Wallets", labelKey: "menu.blockchain.wallets", href: "/dashboard/blockchain/wallets" },
      { label: "Markets", labelKey: "menu.blockchain.markets", href: "/dashboard/blockchain/markets" },
      { label: "Transactions", labelKey: "menu.blockchain.transactions", href: "/dashboard/blockchain/transactions" },
      { label: "Statistics", labelKey: "menu.blockchain.statistics", href: "/dashboard/blockchain/stats" },
    ],
  },
  { label: "AI Control", labelKey: "menu.iaControl", href: "/dashboard/ia-control", icon: Bot, routeKey: "ia-control" },
  { label: "Permissions", labelKey: "menu.permissions", href: "/dashboard/permissions", icon: Shield, routeKey: "permissions", adminOnly: true },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { canAccess, canWrite, isAdmin, role, clearPermissions, isLoading: permissionsLoading } = usePermissions();
  const { t, locale, setLocale } = useTranslation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const [admin, setAdmin] = useState<{
    name?: string;
    username?: string;
    email?: string;
  } | null>(null);
  const [siteSettings, setSiteSettings] = useState<{
    siteName?: string;
    logoUrl?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Filter menu items based on permissions
  const filteredMenuItems = useMemo(() => {
    if (permissionsLoading) return [];

    return menuItems.filter((item) => {
      // Admin-only items
      if (item.adminOnly && !isAdmin) {
        return false;
      }

      // For super admin, show all
      if (isAdmin) {
        return true;
      }

      // Check permission for route
      const routeKey = item.routeKey || getRouteKeyFromPath(item.href || "");
      return canAccess(routeKey);
    });
  }, [isAdmin, canAccess, permissionsLoading]);

  // Check if current route has write access
  const currentRouteKey = getRouteKeyFromPath(pathname);
  const hasWriteAccess = isAdmin || canWrite(currentRouteKey);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const adminUser = localStorage.getItem("admin_user");
    if (!token) {
      router.push("/");
      return;
    }

    if (adminUser) {
      setAdmin(JSON.parse(adminUser));
    }
    setLoading(false);

    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/admin/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data) ? res.data : [];
        setNotifications(data.slice(0, 5));
        setUnreadCount(data.filter((n: AdminNotification) => !n.isRead).length);
      } catch {
        setNotifications([]);
        setUnreadCount(0);
      }
    };
    fetchNotifications();

    // Fetch site settings for logo
    const fetchSettings = async () => {
      try {
        const res = await api.get("/admin/settings/general", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSiteSettings(res.data);
      } catch {
        // Ignore errors
      }
    };
    fetchSettings();
  }, [router]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLanguageMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const parentMenu = filteredMenuItems.find((item) =>
      item.submenu?.some((sub) => sub.href === pathname)
    );
    if (parentMenu && !openMenus.includes(parentMenu.label)) {
      setOpenMenus((prev) => [...prev, parentMenu.label]);
    }
  }, [pathname, filteredMenuItems, openMenus]);

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMin < 60) return t("layout.timeAgo.minutes").replace("{n}", String(diffMin));
    if (diffHrs < 24) return t("layout.timeAgo.hours").replace("{n}", String(diffHrs));
    if (diffDays < 7) return t("layout.timeAgo.days").replace("{n}", String(diffDays));
    return t("layout.timeAgo.weeks").replace("{n}", String(Math.floor(diffDays / 7)));
  };

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_role");
    localStorage.removeItem("admin_permissions");
    clearPermissions();
    router.push("/");
  };

  if (loading || permissionsLoading) return null;

  return (
    <div className="min-h-screen bg-[#0a0b14] text-slate-50 flex font-inter antialiased selection:bg-indigo-500/30">
      {/* Sidebar - Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-[#11131f] border-r border-white/3 flex flex-col h-screen fixed lg:sticky top-0 shrink-0 transition-all duration-300 z-50",
          sidebarOpen
            ? "translate-x-0 w-[300px]"
            : "-translate-x-full lg:translate-x-0 lg:w-20"
        )}
      >
        {/* Logo Section */}
        <div className="h-24 flex items-center px-4 mb-4 relative">
          <div className="flex items-center gap-3">
            {(sidebarOpen ||
              (typeof window !== "undefined" && window.innerWidth < 1024)) ? (
              <div className="h-12 w-auto animate-in fade-in slide-in-from-left-2">
                {siteSettings?.logoUrl ? (
                  <img
                    src={`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3302").replace(/\/api$/, "")}${siteSettings.logoUrl}`}
                    alt={siteSettings.siteName || "Logo"}
                    className="h-full w-auto object-contain"
                  />
                ) : (
                  <img
                    src={`/${(process.env.NEXT_PUBLIC_APP_NAME || "Futurus").charAt(0).toUpperCase() + (process.env.NEXT_PUBLIC_APP_NAME || "Futurus").slice(1).toLowerCase()}.png`}
                    alt={process.env.NEXT_PUBLIC_APP_NAME || "Futurus"}
                    className="h-full w-auto object-contain"
                  />
                )}
              </div>
            ) : (
              <div className="w-12 h-12 rounded-[20px] bg-linear-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 overflow-hidden shrink-0">
                <img
                  src={`/logo${(process.env.NEXT_PUBLIC_APP_NAME || "Futurus").charAt(0).toUpperCase() + (process.env.NEXT_PUBLIC_APP_NAME || "Futurus").slice(1).toLowerCase()}.png`}
                  alt={process.env.NEXT_PUBLIC_APP_NAME || "Futurus"}
                  className="w-full h-full object-contain p-1"
                />
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute right-6 p-2 text-slate-500 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-hide">
          {filteredMenuItems.map((item) => {
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isOpen = openMenus.includes(item.label);
            const isActive =
              pathname === item.href ||
              item.submenu?.some((sub) => pathname.startsWith(sub.href));
            const routeKey = item.routeKey || getRouteKeyFromPath(item.href || "");
            const isReadOnly = !isAdmin && !canWrite(routeKey);

            return (
              <div key={item.label} className="space-y-1">
                {hasSubmenu ? (
                  <div className="relative">
                    <button
                      onClick={() =>
                        sidebarOpen
                          ? toggleMenu(item.label)
                          : setSidebarOpen(true)
                      }
                      className={cn(
                        "w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-black transition-all group",
                        isActive
                          ? "text-indigo-400 bg-white/3 border border-white/2"
                          : "text-slate-500 hover:text-slate-300 hover:bg-white/2"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <item.icon
                          className={cn(
                            "w-5 h-5 transition-transform group-hover:scale-110",
                            isActive
                              ? "text-indigo-400"
                              : "text-slate-600 group-hover:text-slate-400"
                          )}
                        />
                        {sidebarOpen && (
                          <span className="flex items-center gap-2">
                            {item.labelKey ? t(item.labelKey) : item.label}
                            {isReadOnly && (
                              <span title="Read Only">
                                <Eye className="w-3 h-3 text-amber-500" />
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                      {sidebarOpen &&
                        (isOpen ? (
                          <ChevronDown className="w-4 h-4 text-slate-700" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-700" />
                        ))}
                    </button>
                    {sidebarOpen && isOpen && (
                      <div className="mt-1 space-y-1 ml-4 pl-8 border-l border-white/3">
                        {item.submenu?.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => {
                                if (window.innerWidth < 1024)
                                  setSidebarOpen(false);
                              }}
                              className={cn(
                                "block py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                                isSubActive
                                  ? "text-indigo-400 bg-indigo-500/3"
                                  : "text-slate-600 hover:text-indigo-300"
                              )}
                            >
                              {sub.labelKey ? t(sub.labelKey) : sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href || "#"}
                    onClick={() => {
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[13px] font-black transition-all group",
                      pathname === item.href
                        ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 ring-1 ring-white/10"
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/2"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                        pathname === item.href
                          ? "text-white"
                          : "text-slate-600 group-hover:text-slate-400"
                      )}
                    />
                    {sidebarOpen && (
                      <span className="flex items-center gap-2">
                        {item.labelKey ? t(item.labelKey) : item.label}
                        {isReadOnly && (
                          <span title="Read Only">
                            <Eye className="w-3 h-3 text-amber-500" />
                          </span>
                        )}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile Hook */}
        <div className="p-6">
          <div
            className={cn(
              "bg-white/2 border border-white/3 rounded-[28px] p-4 flex items-center transition-all",
              sidebarOpen ? "gap-4" : "justify-center"
            )}
          >
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30 relative shrink-0">
              <span className="text-sm font-black text-indigo-400">
                {admin?.name?.[0] || "A"}
              </span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#11131f]" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[13px] font-black text-white truncate uppercase tracking-tighter">
                  {admin?.name || t("layout.systemMaster")}
                </p>
                <p className="text-[10px] text-slate-600 truncate font-black mt-0.5 uppercase tracking-widest">
                  {isAdmin ? t("layout.superAdmin") : t("layout.staff")}
                </p>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all active:scale-95"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            )}
          </div>
          {sidebarOpen && (
            <div className="mt-4 px-2 text-center">
              <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest whitespace-nowrap overflow-hidden">
                PY Foundation 2026 version={process.env.NEXT_PUBLIC_APP_VERSION || process.env.PUBLIC_APP_VERSION}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Global Header */}
        <header className="h-20 lg:h-24 bg-[#0a0b14]/60 backdrop-blur-3xl border-b border-white/2 flex items-center justify-between px-4 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4 lg:gap-8">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 lg:p-3 rounded-2xl bg-white/2 border border-white/2 text-slate-500 hover:text-white transition-all active:scale-95"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-1 h-6 lg:w-1.5 lg:h-8 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/50" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg lg:text-xl font-black text-white tracking-tighter uppercase leading-none">
                    {filteredMenuItems.find(
                      (i) =>
                        i.href === pathname ||
                        i.submenu?.some((s) => s.href === pathname)
                    )?.label || t("layout.workspace")}
                  </h2>
                  {!hasWriteAccess && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                      <Eye className="w-3 h-3 text-amber-500" />
                      <span className="text-[9px] font-bold text-amber-500 uppercase">{t("layout.readOnly")}</span>
                    </span>
                  )}
                </div>
                <p className="text-[8px] lg:text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mt-1 lg:mt-1.5 opacity-60">
                  {t("layout.adminControl")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            {/* Search Launcher */}
            <div className="hidden xl:flex items-center gap-4 px-6 py-3 bg-black/40 rounded-[22px] border border-white/3 group hover:border-indigo-500/30 transition-all cursor-pointer">
              <Search className="w-4 h-4 text-slate-600 group-hover:text-indigo-500" />
              <input
                type="text"
                placeholder={t("layout.search")}
                className="bg-transparent border-none text-[11px] focus:outline-none text-white w-48 placeholder:text-slate-800 font-black uppercase tracking-widest"
              />
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              {/* Language Switcher */}
              <div ref={langRef} className="relative">
                <button
                  onClick={() => {
                    setShowLanguageMenu(!showLanguageMenu);
                    setShowNotifications(false);
                    setShowProfileMenu(false);
                  }}
                  title={t("layout.language")}
                  className="relative p-2.5 lg:p-3 rounded-2xl bg-white/2 border border-white/2 text-slate-500 hover:text-indigo-400 transition-all hover:scale-110 active:scale-95"
                >
                  <Languages className="w-5 h-5" />
                </button>

                {showLanguageMenu && (
                  <div className="absolute right-0 top-full mt-3 w-[140px] bg-[#1a1d2e] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => {
                        setLocale("pt");
                        setShowLanguageMenu(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-5 py-3.5 text-[12px] font-bold transition-colors w-full text-left",
                        locale === "pt"
                          ? "text-indigo-400 bg-indigo-500/10"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <span className="text-base">🇧🇷</span>
                      Português
                    </button>
                    <button
                      onClick={() => {
                        setLocale("es");
                        setShowLanguageMenu(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-5 py-3.5 text-[12px] font-bold transition-colors w-full text-left border-t border-white/3",
                        locale === "es"
                          ? "text-indigo-400 bg-indigo-500/10"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <span className="text-base">🇪🇸</span>
                      Español
                    </button>
                    <button
                      onClick={() => {
                        setLocale("en");
                        setShowLanguageMenu(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-5 py-3.5 text-[12px] font-bold transition-colors w-full text-left border-t border-white/3",
                        locale === "en"
                          ? "text-indigo-400 bg-indigo-500/10"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <span className="text-base">🇺🇸</span>
                      English
                    </button>
                  </div>
                )}
              </div>

              {/* Globe - Frontend Link */}
              <a
                href={process.env.NEXT_PUBLIC_FRONTEND_URL || "/"}
                target="_blank"
                rel="noopener noreferrer"
                title={t("layout.goToFrontend")}
                className="relative p-2.5 lg:p-3 rounded-2xl bg-white/2 border border-white/2 text-slate-500 hover:text-indigo-400 transition-all hover:scale-110 active:scale-95"
              >
                <Globe className="w-5 h-5" />
              </a>

              {/* Notifications Bell */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  title={t("layout.notifications")}
                  className="relative p-2.5 lg:p-3 rounded-2xl bg-white/2 border border-white/2 text-slate-500 hover:text-indigo-400 transition-all hover:scale-110 active:scale-95 group"
                >
                  <BellRing className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-600 rounded-full ring-2 ring-[#0a0b14] flex items-center justify-center">
                      <span className="text-[9px] font-black text-white">
                        {unreadCount}
                      </span>
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-3 w-[360px] bg-[#1a1d2e] border border-white/10 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden z-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-6 py-4 border-b border-white/5">
                      <h3 className="text-sm font-black text-white">
                        {t("layout.notification")}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                        {t("layout.youHave")} {unreadCount} {unreadCount !== 1 ? t("layout.unreadNotifications") : t("layout.unreadNotification")}
                      </p>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n, i) => (
                          <div
                            key={n.id || i}
                            className={cn(
                              "px-6 py-4 border-b border-white/3 hover:bg-white/3 transition-colors cursor-pointer",
                              !n.isRead && "bg-indigo-500/5"
                            )}
                          >
                            <p className="text-[13px] font-bold text-white leading-snug">
                              {n.title || t("layout.newMemberRegistered")}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <Clock className="w-3 h-3 text-indigo-400" />
                              <span className="text-[10px] text-indigo-400 font-bold">
                                {n.createdAt
                                  ? getTimeAgo(n.createdAt)
                                  : t("layout.justNow")}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-6 py-8 text-center">
                          <BellRing className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                          <p className="text-[11px] text-slate-600 font-bold">
                            {t("layout.noNotifications")}
                          </p>
                        </div>
                      )}
                    </div>
                    <Link
                      href="/dashboard/reports/transactions"
                      onClick={() => setShowNotifications(false)}
                      className="block px-6 py-3.5 text-center text-[11px] font-black text-indigo-400 hover:text-indigo-300 border-t border-white/5 hover:bg-white/2 transition-colors uppercase tracking-wider"
                    >
                      {t("layout.viewAllNotifications")}
                    </Link>
                  </div>
                )}
              </div>

              {/* Settings / Wrench */}
              <Link
                href="/dashboard/settings"
                title={t("layout.systemSettings")}
                className="hidden sm:flex p-2.5 lg:p-3 rounded-2xl bg-white/2 border border-white/2 text-slate-500 hover:text-indigo-400 transition-all hover:scale-110 active:scale-95"
              >
                <Wrench className="w-5 h-5" />
              </Link>

              {/* Admin Profile */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-2xl bg-white/2 border border-white/2 hover:border-white/10 transition-all group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden">
                    <span className="text-xs font-black text-white">
                      {admin?.name?.[0]?.toUpperCase() || "A"}
                    </span>
                  </div>
                  <span className="hidden md:block text-[12px] font-black text-slate-300 group-hover:text-white uppercase tracking-tight">
                    {admin?.name || admin?.username || "admin"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600 hidden md:block" />
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-3 w-[200px] bg-[#1a1d2e] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-5 py-3.5 text-[12px] font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4 text-indigo-400" />
                      {t("layout.profile")}
                    </Link>
                    <Link
                      href="/dashboard/settings/password"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-5 py-3.5 text-[12px] font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors border-t border-white/3"
                    >
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      {t("layout.password")}
                    </Link>
                    <Link
                      href="/dashboard/settings/2fa"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-5 py-3.5 text-[12px] font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors border-t border-white/3"
                    >
                      <Shield className="w-4 h-4 text-indigo-400" />
                      {t("layout.2faSecurity")}
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/dashboard/permissions"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-5 py-3.5 text-[12px] font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors border-t border-white/3"
                      >
                        <Shield className="w-4 h-4 text-emerald-400" />
                        {t("layout.permissions")}
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 px-5 py-3.5 text-[12px] font-bold text-slate-300 hover:text-rose-400 hover:bg-rose-500/5 transition-colors border-t border-white/3 w-full text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      {t("layout.logout")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-transparent relative">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

          <div className="p-4 lg:p-10 max-w-[1600px] mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TranslationProvider>
      <PermissionsProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </PermissionsProvider>
    </TranslationProvider>
  );
}
