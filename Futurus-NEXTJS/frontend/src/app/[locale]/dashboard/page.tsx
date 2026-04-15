"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useSession } from "next-auth/react";
import {
  TrendingUp,
  History,
  AlertCircle,
  Briefcase,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronRight,
  ShieldAlert,
  Clock,
  UsersRound,
  Plus,
} from "lucide-react";
import { Decimal } from "decimal.js";
import { cn } from "@/lib/utils";

function getImageUrl(image?: string | null): string {
  if (!image) return "/placeholder-market.png";
  if (image.startsWith("/uploads")) {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3301";
    const base = backendUrl.replace(/\/api\/?$/, "");
    return `${base}${image}`;
  }
  if (image.startsWith("http")) return image;
  return image;
}

export default function DashboardPage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!session) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/users/dashboard", {
          headers: {
            Authorization: `Bearer ${(session as any).accessToken}`,
          },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [session]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-10">
        <div className="h-20 bg-white/5 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="h-40 bg-white/5 rounded-3xl" />
          <div className="h-40 bg-white/5 rounded-3xl" />
          <div className="h-40 bg-white/5 rounded-3xl" />
        </div>
        <div className="h-96 bg-white/5 rounded-3xl" />
      </div>
    );
  }

  const { user, summaries, recentPurchases, recentMarkets } = stats || {};

  return (
    <div className="space-y-8 pb-10">
      {/* Alerts Section */}
      <div className="space-y-4">
        {(!user?.balance || user.balance === 0) && (
          <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[15px] font-black text-white mb-1">
                {t("Saldo Vazio")}
              </h4>
              <p className="text-[13px] text-slate-400 font-medium">
                {t("Seu saldo está vazio. Por favor, faça um")}{" "}
                <Link
                  href="/dashboard/deposit"
                  className="text-blue-500 font-bold hover:underline"
                >
                  {t("depósito")}
                </Link>{" "}
                {t("para seu próximo investimento.")}
              </p>
            </div>
          </div>
        )}

        {user?.ts === 0 && (
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[15px] font-black text-white mb-1">
                {t("Autenticação 2FA")}
              </h4>
              <p className="text-[13px] text-slate-400 font-medium">
                {t(
                  "Para manter sua conta segura, por favor, ative a 2FA segurança. Isso tornará sua conta e saldo seguros.",
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 shadow-sm hover:border-white/10 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-bl-[100px] -mr-10 -mt-10" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                <ArrowDownCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">
                {t("Depósitos com Sucesso")}
              </h3>
            </div>
            <div className="flex items-end gap-1 mb-4">
              <span className="text-3xl font-black text-white">
                R${new Decimal(summaries?.totalDeposit || 0).toFixed(2)}
              </span>
              <span className="text-xs text-slate-500 font-bold mb-1.5 uppercase tracking-widest leading-none ml-1">
                Real
              </span>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  {t("Enviado")}
                </p>
                <p className="text-sm font-bold text-white">R$0.00</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  {t("Pendente")}
                </p>
                <p className="text-sm font-bold text-amber-500">R$0.00</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  {t("Rejeitado")}
                </p>
                <p className="text-sm font-bold text-rose-500">R$0.00</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 shadow-sm hover:border-white/10 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 rounded-bl-[100px] -mr-10 -mt-10" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-500/10 flex items-center justify-center text-slate-400">
                <ArrowUpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">
                {t("Retiradas com Sucesso")}
              </h3>
            </div>
            <div className="flex items-end gap-1 mb-4">
              <span className="text-3xl font-black text-white">
                R${new Decimal(summaries?.totalWithdraw || 0).toFixed(2)}
              </span>
              <span className="text-xs text-slate-500 font-bold mb-1.5 uppercase tracking-widest leading-none ml-1">
                Real
              </span>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  {t("Enviado")}
                </p>
                <p className="text-sm font-bold text-white">R$0.00</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  {t("Pendente")}
                </p>
                <p className="text-sm font-bold text-amber-500">R$0.00</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  {t("Rejeitado")}
                </p>
                <p className="text-sm font-bold text-rose-500">R$0.00</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 shadow-sm hover:border-white/10 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] -mr-10 -mt-10" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">
                {t("Valor de Cotas Compradas")}
              </h3>
            </div>
            <div className="flex items-end gap-1 mb-4">
              <span className="text-3xl font-black text-white">
                R${new Decimal(summaries?.totalShares || 0).toFixed(2)}
              </span>
              <span className="text-xs text-slate-500 font-bold mb-1.5 uppercase tracking-widest leading-none ml-1">
                Real
              </span>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  {t("Lucro")}
                </p>
                <p className="text-sm font-bold text-emerald-500">
                  R${Number(user?.totalProfit || 0).toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  {t("Negociações")}
                </p>
                <p className="text-sm font-bold text-white">
                  {Number(summaries?.totalShares || 0).toFixed(0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  {t("Aguardando")}
                </p>
                <p className="text-sm font-bold text-slate-400">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Quick Access */}
      <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 p-8 rounded-[40px] border border-indigo-500/20 shadow-sm hover:border-indigo-500/30 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
              <UsersRound className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white mb-1">
                {t("Grupos de Apostas")}
              </h3>
              <p className="text-[13px] text-slate-400 font-medium">
                {t("Participe de grupos e aposte junto com outros usuários")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/groups/create"
              className="bg-indigo-600 text-white px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("Criar Grupo")}
            </Link>
            <Link
              href="/dashboard/groups"
              className="bg-white/5 text-slate-300 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 flex items-center gap-2"
            >
              {t("Meus Grupos")}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Markets */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">
              {t("Mercado Recente")}
            </h2>
            <Link
              href="/market"
              className="text-[11px] font-black text-blue-500 uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              {t("Ver Todos")}
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-white/5 rounded-[32px] border border-white/5 overflow-x-auto shadow-sm hover:border-white/10 transition-all">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">
                    {t("Mercado")}
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-right">
                    {t("Valor")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentMarkets?.map((market: any) => (
                  <tr
                    key={market.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden shrink-0 border border-white/5">
                          <img
                            src={getImageUrl(market.image)}
                            alt=""
                            className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                          />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-slate-200 line-clamp-1 group-hover:text-blue-400 transition-colors">
                            {market.question}
                          </p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">
                            {market.category?.name || "Geral"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/market/${market.slug}`}
                        className="bg-white/5 text-slate-300 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-white/5"
                      >
                        {t("Detalhes")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recently Purchased */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">
              {t("Comprado Recentemente")}
            </h2>
            <Link
              href="/dashboard/purchases"
              className="text-[11px] font-black text-blue-500 uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              {t("Ver Histórico")}
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-white/5 rounded-[32px] border border-white/5 overflow-x-auto shadow-sm hover:border-white/10 transition-all">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">
                    {t("Mercado")}
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-right">
                    {t("Valor")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentPurchases?.length > 0 ? (
                  recentPurchases.map((purchase: any) => (
                    <tr
                      key={purchase.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-[13px] font-bold text-slate-200 line-clamp-1">
                          {purchase.market.question}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                              purchase.type === "yes"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-rose-500/10 text-rose-500",
                            )}
                          >
                            {purchase.type === "yes" ? t("SIM") : t("NÃO")}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                            {new Decimal(purchase.totalShare).toFixed(4)}{" "}
                            {t("Shares")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-white">
                          R${new Decimal(purchase.amount).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-6 py-20 text-center">
                      <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        {t("Data not found")}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
