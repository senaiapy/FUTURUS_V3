"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useSession } from "next-auth/react";
import { Search, History, ChevronRight } from "lucide-react";
import { Decimal } from "decimal.js";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";

export default function PurchasesPage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!session) return;
      try {
        const res = await api.get("/purchases/history", {
          headers: {
            Authorization: `Bearer ${(session as any).accessToken}`,
          },
        });
        // Backend returns { success, data: { data: [...], meta: {...} } }
        const purchaseData = res.data?.data?.data || res.data?.data || res.data || [];
        setPurchases(Array.isArray(purchaseData) ? purchaseData : []);
      } catch (err) {
        console.error("Failed to fetch purchases", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [session]);

  const filteredPurchases = purchases.filter((p) => {
    // Backend sends market.title, not market.question
    const title = p.market?.title?.toLowerCase() || "";
    const trx = p.trx?.toLowerCase() || "";
    const searchLower = search.toLowerCase();
    return title.includes(searchLower) || trx.includes(searchLower);
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#1a1c2d] tracking-tight">
            {t("Share Purchase History")}
          </h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            {t(
              "View and manage all your event predictions and share holdings.",
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white border border-slate-100 px-5 py-3 rounded-2xl w-full md:w-80 shadow-sm focus-within:border-[#3b5bdb] transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("Buscar por mercado ou TRX...")}
            className="bg-transparent border-none outline-none text-[13px] text-slate-600 w-full font-semibold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  {t("Mercado")}
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  {t("Tipo")}
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  {t("Cotas")}
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  {t("Investimento")}
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  {t("Data")}
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">
                  {t("Status")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-8">
                      <div className="h-6 bg-slate-50 rounded-xl w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredPurchases.length > 0 ? (
                filteredPurchases.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/50">
                          <img
                            src={p.market?.image || "/placeholder-market.png"}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/market/${p.market?.slug || p.marketId}`}
                            className="text-[14px] font-bold text-[#1a1c2d] group-hover:text-[#3b5bdb] transition-colors line-clamp-1"
                          >
                            {p.market?.title || p.market?.question || t("Mercado não encontrado")}
                          </Link>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            TRX: {p.trx || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                          p.type?.toUpperCase() === "YES"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-rose-50 text-rose-600 border-rose-100",
                        )}
                      >
                        {p.type?.toUpperCase() === "YES" ? t("SIM") : t("NÃO")}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-bold text-[#1a1c2d]">
                      {new Decimal(p.shares || p.totalShare || 0).toFixed(4)}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[15px] font-black text-[#1a1c2d]">
                        R${new Decimal(p.amount || 0).toFixed(2)}
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        P/S: R${new Decimal(p.price || p.pricePerShare || 0).toFixed(2)}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-slate-500 text-[13px] font-medium">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                          p.status === "PENDING" || p.status === 0
                            ? "bg-amber-50 text-amber-600 border-amber-100"
                            : p.status === "WON" || p.status === 1
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-slate-50 text-slate-400 border-slate-100",
                        )}
                      >
                        {p.status === "PENDING" || p.status === 0
                          ? t("Pendente")
                          : p.status === "WON" || p.status === 1
                            ? t("Venceu")
                            : t("Perdeu")}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <History className="w-16 h-16 text-slate-300" />
                      <p className="text-xl font-black text-slate-400 uppercase tracking-widest">
                        {t("Data not found")}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
