"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, Link, usePathname } from "@/i18n/routing";
import {
  ArrowLeft,
  Search,
  ChevronDown,
  Menu,
} from "lucide-react";
import { useSession } from "next-auth/react";
import NotificationDropdown from "./NotificationDropdown";

interface UserHeaderProps {
  onMenuClick?: () => void;
}

export default function UserHeader({ onMenuClick }: UserHeaderProps) {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="h-20 bg-slate-950/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-10 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <button
          onClick={() => router.back()}
          className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2.5 rounded-2xl w-80">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder={t("Search Market...")}
          className="bg-transparent border-none outline-none text-[13px] text-slate-200 w-full font-medium placeholder:text-slate-500"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/10">
            <img
              src={
                locale === "pt"
                  ? "/flags/br.svg"
                  : locale === "es"
                    ? "/flags/es.svg"
                    : "/flags/us.svg"
              }
              alt={locale.toUpperCase()}
              className="w-5 h-5 rounded-sm object-cover"
            />
            <span className="text-[13px] font-bold text-slate-300 uppercase">
              {locale}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-500 group-hover:rotate-180 transition-transform" />
          </div>

          <div className="absolute top-full right-0 mt-2 w-40 bg-slate-900 rounded-2xl shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
            <Link
              href={pathname}
              locale="pt"
              className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors"
            >
              <img
                src="/flags/br.svg"
                alt="PT"
                className="w-5 h-3.5 rounded-sm object-cover"
              />
              <span className="text-xs font-bold text-slate-300">
                Português
              </span>
            </Link>
            <Link
              href={pathname}
              locale="en"
              className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors"
            >
              <img
                src="/flags/us.svg"
                alt="EN"
                className="w-5 h-3.5 rounded-sm object-cover"
              />
              <span className="text-xs font-bold text-slate-300">English</span>
            </Link>
            <Link
              href={pathname}
              locale="es"
              className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors"
            >
              <img
                src="/flags/es.svg"
                alt="ES"
                className="w-5 h-3.5 rounded-sm object-cover"
              />
              <span className="text-xs font-bold text-slate-300">Español</span>
            </Link>
          </div>
        </div>

        <NotificationDropdown />

        <div className="flex items-center gap-3 border-l border-white/10 pl-6 ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-black text-white leading-none mb-1">
              {session?.user?.name || "User Account"}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {t("Premium User")}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-600/20 uppercase">
            {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
          </div>
        </div>
      </div>
    </header>
  );
}
