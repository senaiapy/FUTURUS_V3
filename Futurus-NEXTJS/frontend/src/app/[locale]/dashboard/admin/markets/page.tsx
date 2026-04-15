"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Lock,
  Unlock,
  TrendingUp,
} from "lucide-react";
import { Link } from "@/i18n/routing";

export default function AdminMarketsPage() {
  const t = useTranslations();
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/markets", {
        params: { filter: filter === "all" ? undefined : filter },
      });
      setMarkets(res.data);
    } catch (err) {
      console.error("Failed to fetch markets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, [filter]);

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" /> Live
          </span>
        );
      case 0:
        return (
          <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> Draft
          </span>
        );
      case 2:
        return (
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" /> Pending
          </span>
        );
      case 3:
        return (
          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" /> Resolved
          </span>
        );
      case 4:
        return (
          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 font-maven">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">
            {t("Market Management")}
          </h1>
          <p className="text-slate-400 mt-2">
            Create, manage and resolve prediction markets.
          </p>
        </div>

        <Link
          href="/dashboard/admin/markets/create"
          className="bg-base hover:opacity-90 text-white px-6 py-3 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl shadow-base/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("Create New Market")}
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 border border-white/5 p-4 rounded-3xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
          {["all", "live", "pending", "draft", "resolved", "cancelled"].map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === f
                    ? "bg-white/10 text-white border border-white/20 shadow-lg"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {f}
              </button>
            ),
          )}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={t("Search by question...")}
            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-base"
          />
        </div>
      </div>

      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden bg-white/5">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-12">
                ID
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                {t("Market")}
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                {t("Category")}
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                {t("Volume")}
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                {t("Status")}
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">
                {t("Action")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="w-8 h-8 border-4 border-base/20 border-t-base rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : markets.length > 0 ? (
              markets.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">
                    #{m.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 overflow-hidden flex-shrink-0">
                        {m.image ? (
                          <img
                            src={m.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-base/10" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-base transition-colors max-w-sm border-b border-transparent group-hover:border-base/20">
                          {m.question}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${m.isLock ? "bg-rose-500" : "bg-emerald-500"}`}
                          />
                          <p className="text-[10px] text-slate-500 font-bold uppercase">
                            {m.isLock ? t("Locked") : t("Unlocked")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                      {m.category?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-black text-white">
                      ${parseFloat(m.volume).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase font-black">
                      {m._count?.purchases} {t("trades")}
                    </p>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(m.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:border-base/30 transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:border-indigo-400/30 transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-rose-500 hover:border-rose-500/30 transition-all">
                        <Lock className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-500 text-sm"
                >
                  {t("No markets found matching your criteria.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
