"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  Coins,
  Users,
  ArrowUpRight,
  RefreshCw,
  Calendar,
  Activity,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface BlockchainStats {
  overview: {
    totalWallets: number;
    custodialWallets: number;
    linkedWallets: number;
    walletsGrowth: number;
    totalMarketsDeployed: number;
    activeMarkets: number;
    resolvedMarkets: number;
    marketsGrowth: number;
    totalFutVolume: number;
    volumeGrowth: number;
    totalTransactions: number;
    transactionsGrowth: number;
  };
  volumeByDay: {
    date: string;
    volume: number;
    transactions: number;
  }[];
  topMarkets: {
    marketId: number;
    question: string;
    volume: number;
    bets: number;
  }[];
  transactionsByType: {
    type: string;
    count: number;
    volume: number;
  }[];
}

export default function BlockchainStatsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.push("/");
        return;
      }

      const res = await api.get(`/admin/blockchain/stats/detailed?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => ({ data: null }));

      if (res.data) {
        setStats(res.data);
      } else {
        // Mock data for demo
        setStats({
          overview: {
            totalWallets: 0,
            custodialWallets: 0,
            linkedWallets: 0,
            walletsGrowth: 0,
            totalMarketsDeployed: 0,
            activeMarkets: 0,
            resolvedMarkets: 0,
            marketsGrowth: 0,
            totalFutVolume: 0,
            volumeGrowth: 0,
            totalTransactions: 0,
            transactionsGrowth: 0,
          },
          volumeByDay: [],
          topMarkets: [],
          transactionsByType: [],
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatGrowth = (value: number) => {
    if (value > 0) return `+${value.toFixed(1)}%`;
    if (value < 0) return `${value.toFixed(1)}%`;
    return "0%";
  };

  const GrowthIndicator = ({ value }: { value: number }) => {
    if (value > 0) {
      return (
        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
          <TrendingUp className="w-3 h-3" />
          {formatGrowth(value)}
        </span>
      );
    }
    if (value < 0) {
      return (
        <span className="flex items-center gap-1 text-xs font-bold text-rose-400">
          <TrendingDown className="w-3 h-3" />
          {formatGrowth(value)}
        </span>
      );
    }
    return <span className="text-xs font-bold text-slate-500">0%</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">{t("stats.title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("stats.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#11131f] border border-white/5 rounded-xl p-1">
            {(["7d", "30d", "90d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  period === p
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {p === "7d" ? t("stats.7days") : p === "30d" ? t("stats.30days") : t("stats.90days")}
              </button>
            ))}
          </div>
          <button
            onClick={fetchStats}
            className="p-2.5 bg-[#11131f] border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallets */}
        <div className="bg-[#11131f] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-indigo-400" />
            </div>
            <GrowthIndicator value={stats?.overview.walletsGrowth || 0} />
          </div>
          <p className="text-3xl font-black text-white">{stats?.overview.totalWallets || 0}</p>
          <p className="text-xs text-slate-500 mt-1 font-bold">{t("stats.totalWallets")}</p>
          <div className="flex gap-4 mt-3 text-[10px] font-bold text-slate-600">
            <span>{t("blockchain.custodial")}: {stats?.overview.custodialWallets || 0}</span>
            <span>{t("blockchain.linked")}: {stats?.overview.linkedWallets || 0}</span>
          </div>
        </div>

        {/* Markets */}
        <div className="bg-[#11131f] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <GrowthIndicator value={stats?.overview.marketsGrowth || 0} />
          </div>
          <p className="text-3xl font-black text-white">{stats?.overview.totalMarketsDeployed || 0}</p>
          <p className="text-xs text-slate-500 mt-1 font-bold">{t("stats.marketsDeployed")}</p>
          <div className="flex gap-4 mt-3 text-[10px] font-bold text-slate-600">
            <span>{t("blockchain.activeMarkets")}: {stats?.overview.activeMarkets || 0}</span>
            <span>{t("blockchain.resolvedMarkets")}: {stats?.overview.resolvedMarkets || 0}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="bg-[#11131f] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Coins className="w-6 h-6 text-amber-400" />
            </div>
            <GrowthIndicator value={stats?.overview.volumeGrowth || 0} />
          </div>
          <p className="text-3xl font-black text-white">
            {(stats?.overview.totalFutVolume || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-bold">{t("stats.futVolume")}</p>
        </div>

        {/* Transactions */}
        <div className="bg-[#11131f] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <GrowthIndicator value={stats?.overview.transactionsGrowth || 0} />
          </div>
          <p className="text-3xl font-black text-white">{stats?.overview.totalTransactions || 0}</p>
          <p className="text-xs text-slate-500 mt-1 font-bold">{t("stats.totalTransactions")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Chart */}
        <div className="bg-[#11131f] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">{t("stats.volumeByDay")}</h2>
            <Calendar className="w-5 h-5 text-slate-500" />
          </div>
          {stats?.volumeByDay && stats.volumeByDay.length > 0 ? (
            <div className="space-y-3">
              {stats.volumeByDay.slice(0, 10).map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 w-20">
                    {new Date(day.date).toLocaleDateString("pt-BR", { month: "short", day: "numeric" })}
                  </span>
                  <div className="flex-1 h-6 bg-black/30 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg"
                      style={{
                        width: `${Math.min(100, (day.volume / Math.max(...stats.volumeByDay.map((d) => d.volume))) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white w-24 text-right">
                    {day.volume.toLocaleString("en-US")} FUT
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Coins className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500">{t("stats.noVolumeData")}</p>
            </div>
          )}
        </div>

        {/* Top Markets */}
        <div className="bg-[#11131f] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">{t("stats.topMarkets")}</h2>
            <TrendingUp className="w-5 h-5 text-slate-500" />
          </div>
          {stats?.topMarkets && stats.topMarkets.length > 0 ? (
            <div className="space-y-4">
              {stats.topMarkets.slice(0, 5).map((market, index) => (
                <div
                  key={market.marketId}
                  className="flex items-center gap-4 p-4 bg-black/30 rounded-xl"
                >
                  <span className="w-8 h-8 flex items-center justify-center bg-indigo-500/20 rounded-lg text-sm font-bold text-indigo-400">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white line-clamp-1">{market.question}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{market.bets} {t("stats.bets")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">
                      {market.volume.toLocaleString("en-US")} FUT
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500">{t("stats.noMarketData")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Transactions by Type */}
      <div className="bg-[#11131f] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">{t("stats.transactionsByType")}</h2>
          <Activity className="w-5 h-5 text-slate-500" />
        </div>
        {stats?.transactionsByType && stats.transactionsByType.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.transactionsByType.map((tx) => (
              <div key={tx.type} className="p-4 bg-black/30 rounded-xl text-center">
                <p className="text-2xl font-black text-white">{tx.count}</p>
                <p className="text-xs text-slate-500 mt-1 font-bold uppercase">{tx.type}</p>
                <p className="text-xs text-indigo-400 mt-2">
                  {tx.volume.toLocaleString("en-US")} FUT
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500">{t("stats.noTransactionData")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
