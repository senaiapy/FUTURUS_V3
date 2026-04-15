"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import {
  LayoutDashboard,
  BarChart3,
  History as HistoryIcon,
  Wallet,
  ArrowUpRight,
  RefreshCw,
  Users,
  UsersRound,
  MessageSquare,
  User as UserIcon,
  Lock,
  ShieldCheck,
  LogOut,
  PlusCircle,
  MinusCircle,
  X,
  Bell,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";

interface UserSidebarProps {
  balance?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function UserSidebar({
  balance = 0,
  isOpen,
  onClose,
}: UserSidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const { data: session } = useSession();

  const menuItems = [
    { label: t("Painel"), icon: LayoutDashboard, href: "/dashboard" },
    { label: t("Mercados"), icon: BarChart3, href: "/market" },
    {
      label: t("Histórico de Compra"),
      icon: HistoryIcon,
      href: "/dashboard/purchases",
    },
    { label: t("Depósito"), icon: PlusCircle, href: "/dashboard/deposit" },
    { label: t("Retirada"), icon: MinusCircle, href: "/dashboard/withdraw" },
    {
      label: t("Transações"),
      icon: RefreshCw,
      href: "/dashboard/transactions",
    },
    { label: t("Indicações"), icon: Users, href: "/dashboard/referral" },
    { label: t("Grupos"), icon: UsersRound, href: "/dashboard/groups" },
    { label: process.env.NEXT_PUBLIC_COIN_NAME || "Blockchain", icon: Coins, href: "/dashboard/blockchain" },
    { label: t("Notificações"), icon: Bell, href: "/dashboard/notifications" },
    {
      label: t("Ticket de Suporte"),
      icon: MessageSquare,
      href: "/dashboard/support",
    },
    {
      label: t("Configuração de Perfil"),
      icon: UserIcon,
      href: "/dashboard/profile",
    },
    {
      label: t("Alterar Senha"),
      icon: Lock,
      href: "/dashboard/change-password",
    },
    { label: t("Verificação KYC"), icon: ShieldCheck, href: "/dashboard/kyc" },
    { label: t("Segurança 2FA"), icon: ShieldCheck, href: "/dashboard/2fa" },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-white/5 flex flex-col h-screen transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-auto",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="p-8 flex items-center justify-between lg:justify-center">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="text-white font-black italic text-xl">F</span>
            </div>
            <span className="text-2xl font-black text-white tracking-tight uppercase">
              Futurus
            </span>
          </Link>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Balance Section */}
      <div className="px-6 mb-8">
        <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">
            {t("Saldo da Conta")}
          </p>
          <div className="flex items-end gap-1 mb-6">
            <h3 className="text-3xl font-black text-white">
              {Number(balance).toFixed(2)}
            </h3>
            <span className="text-xs text-slate-400 font-bold mb-1.5 uppercase tracking-wider">
              Real (Carteira)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard/deposit"
              className="bg-blue-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-3 h-3" />
              {t("Depósito")}
            </Link>
            <Link
              href="/dashboard/withdraw"
              className="bg-slate-800 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <MinusCircle className="w-3 h-3" />
              {t("Retirada")}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group",
                isActive
                  ? "bg-blue-600/10 text-blue-400 font-bold"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive
                    ? "text-blue-400"
                    : "text-slate-500 group-hover:text-white",
                )}
              />
              <span className="text-[13px] font-semibold tracking-tight">
                {item.label}
              </span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-6">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-500 font-bold hover:bg-rose-500/10 transition-all group"
        >
          <LogOut className="w-5 h-5 text-rose-400 group-hover:text-rose-500" />
          <span className="text-[13px] tracking-tight">{t("Sair")}</span>
        </button>
      </div>

      {/* Branding */}
      <div className="px-10 pb-6 text-center lg:text-left opacity-30">
        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.15em] whitespace-nowrap">
          PY Foundation 2026 version={process.env.NEXT_PUBLIC_APP_VERSION || process.env.PUBLIC_APP_VERSION}
        </p>
      </div>
    </aside>
  );
}
