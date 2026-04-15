"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useEffect, useState, use, useMemo } from "react";
import api from "@/lib/api";
import {
  Clock,
  ArrowLeft,
  ChevronRight,
  LineChart,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Users,
  BarChart3,
  Lock,
  TrendingUp,
} from "lucide-react";
import TradingPanel from "@/components/TradingPanel";
import { Decimal } from "decimal.js";
import { useSocket } from "@/lib/socket";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";

// Sanitize HTML to prevent XSS attacks
const sanitizeHTML = (html: string | undefined | null): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
};

export default function MarketPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const { socket } = useSocket();
  const [market, setMarket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [marketRes] = await Promise.all([api.get(`/markets/${slug}`)]);
        setMarket(marketRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  useEffect(() => {
    if (!socket || !market) return;

    socket.emit("joinMarket", slug);

    const onUpdate = (updatedMarket: any) => {
      if (updatedMarket.slug === slug) {
        setMarket(updatedMarket);
      }
    };

    socket.on("marketUpdate", onUpdate);

    return () => {
      socket.off("marketUpdate", onUpdate);
      socket.emit("leaveMarket", slug);
    };
  }, [socket, slug, market?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#3b5bdb]/20 border-t-[#3b5bdb] rounded-full animate-spin" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 bg-rose-50 rounded-[24px] flex items-center justify-center">
          <ShieldCheck className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-2xl font-black text-[#1a1c2d]">
          {t("Mercado não encontrado")}
        </h1>
        <Link
          href="/"
          className="bg-[#3b5bdb] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
        >
          {t("Voltar ao Início")}
        </Link>
      </div>
    );
  }

  const option = market.options?.[0] || null;
  const yesShare = new Decimal(market.yesShare?.toString() || "50");
  const noShare = new Decimal(market.noShare?.toString() || "50");

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1c2d] flex flex-col font-maven">
      <Header />

      {/* Modern Breadcrumb */}
      <div className="w-full bg-white border-b border-slate-100 py-4 shadow-sm">
        <div className="container mx-auto px-6 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <button
            onClick={() => router.back()}
            className="hover:text-[#3b5bdb] transition-colors flex items-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t("Voltar")}
          </button>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <span className="truncate max-w-[150px]">
            {market.category?.name}
          </span>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <span className="text-[#3b5bdb] truncate max-w-[250px]">
            {market.question}
          </span>
        </div>
      </div>

      <main className="flex-1 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Box: Info & Chart */}
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="px-5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/50 text-[#3b5bdb] text-[10px] font-black uppercase tracking-widest">
                    {market.category?.name}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    {t("Termina em")}:{" "}
                    {new Date(market.endDate).toLocaleDateString()}
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-[#1a1c2d] tracking-tight leading-[1.1]">
                  {market.question}
                </h1>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  {
                    label: t("Volume Total"),
                    value: `R$${new Decimal(market.volume || 0).toFixed(2)}`,
                    icon: BarChart3,
                    color: "text-blue-500",
                  },
                  {
                    label: t("Investidores"),
                    value: market._count?.purchases || 0,
                    icon: Users,
                    color: "text-indigo-500",
                  },
                  {
                    label: t("SIM Custa"),
                    value: `${yesShare.toFixed(0)}%`,
                    icon: TrendingUp,
                    color: "text-emerald-500",
                  },
                  {
                    label: t("NÃO Custa"),
                    value: `${noShare.toFixed(0)}%`,
                    icon: TrendingUp,
                    color: "text-rose-500",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <stat.icon className={cn("w-4 h-4", stat.color)} />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {stat.label}
                      </span>
                    </div>
                    <p className="text-xl font-black text-[#1a1c2d]">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chart Placeholder / Visual */}
              <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#3b5bdb]/10 flex items-center justify-center text-[#3b5bdb]">
                      <LineChart className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#1a1c2d] tracking-tight">
                        {t("Análise de Preço")}
                      </h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        Histórico de Probabilidades
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {["24H", "1W", "1M", "ALL"].map((p) => (
                      <button
                        key={p}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black transition-all",
                          p === "24H"
                            ? "bg-[#3b5bdb] text-white shadow-lg shadow-indigo-100"
                            : "bg-slate-50 text-slate-400 hover:bg-slate-100",
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-64 flex items-end justify-between gap-1.5 px-2 relative z-10">
                  {[
                    40, 45, 42, 50, 48, 55, 52, 60, 58, 65, 62, 70, 68, 75, 72,
                    80, 78, 85, 82, 90, 88, 95, 92, 100, 95, 85, 75, 65, 55, 65,
                  ].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-[#3b5bdb]/80 to-[#3b5bdb]/20 rounded-t-lg transition-all hover:scale-y-110 cursor-pointer"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                  <div className="absolute inset-0 flex flex-col justify-between opacity-5 pointer-events-none">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-full h-px bg-[#1a1c2d]" />
                    ))}
                  </div>
                </div>

                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-50" />
              </div>

              {/* Details & Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-lg font-black text-[#1a1c2d] uppercase tracking-wider flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#3b5bdb]" />
                    {t("Regras do Mercado")}
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex gap-3 text-[13px] text-slate-500 font-medium leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {t("Baseado em resultados oficiais de fontes primárias.")}
                    </li>
                    <li className="flex gap-3 text-[13px] text-slate-500 font-medium leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {t(
                        "Pagamentos garantidos via nosso sistema de liquidação.",
                      )}
                    </li>
                    <li className="flex gap-3 text-[13px] text-slate-500 font-medium leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {t(
                        "Resolução automática em até 24h após o fim do evento.",
                      )}
                    </li>
                  </ul>
                </div>

                <div className="bg-[#1a1c2d] p-10 rounded-[40px] shadow-xl text-white relative overflow-hidden">
                  <h3 className="text-lg font-black uppercase tracking-wider mb-6 flex items-center gap-3 relative z-10">
                    <Globe className="w-5 h-5 text-[#3b5bdb]" />
                    {t("Integridade")}
                  </h3>
                  <p className="text-[13px] text-slate-400 leading-relaxed font-medium relative z-10">
                    {t(
                      "Este mercado é monitorado em tempo real. Utilizamos múltiplas fontes de dados para garantir que a resolução seja justa e transparente para todos os participantes.",
                    )}
                  </p>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                </div>
              </div>

              <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-8 border-b border-slate-100 mb-8">
                  {["Descrição", "Atualizações", "Comentários"].map(
                    (tab, i) => (
                      <button
                        key={i}
                        className={cn(
                          "pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative",
                          i === 0
                            ? "text-[#3b5bdb]"
                            : "text-slate-400 hover:text-slate-600",
                        )}
                      >
                        {t(tab)}
                        {i === 0 && (
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-[#3b5bdb] rounded-t-full" />
                        )}
                      </button>
                    ),
                  )}
                </div>
                <div
                  className="prose prose-slate max-w-none text-slate-500 font-medium text-[15px] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(market.description) }}
                />
              </div>
            </div>

            {/* Right: Trading Sidebar */}
            <div className="space-y-8">
              <TradingPanel market={market} option={option} />

              <div className="bg-indigo-50/50 p-8 rounded-[40px] border border-indigo-100 space-y-4">
                <div className="flex items-center gap-3 text-[#3b5bdb]">
                  <Lock className="w-5 h-5" />
                  <h4 className="text-[12px] font-black uppercase tracking-widest">
                    {t("Garantia de Payout")}
                  </h4>
                </div>
                <p className="text-[12px] text-slate-500 font-medium leading-relaxed italic">
                  {t(
                    "Todos os fundos investidos são mantidos em custódia segura e distribuídos automaticamente de acordo com as regras estabelecidas.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
