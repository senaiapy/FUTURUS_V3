"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Coins,
  Wallet,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Users,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface BlockchainStats {
  totalWallets: number;
  custodialWallets: number;
  linkedWallets: number;
  totalMarketsDeployed: number;
  activeMarkets: number;
  resolvedMarkets: number;
  totalFutVolume: number;
  totalTransactions: number;
  pendingTransactions: number;
}

interface RecentTransaction {
  id: number;
  txHash: string;
  txType: string;
  amount: number;
  token: string;
  status: number;
  createdAt: string;
  user?: { name: string; email: string };
}

export default function BlockchainDashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [recentTxs, setRecentTxs] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.push("/");
        return;
      }

      const [statsRes, txsRes] = await Promise.all([
        api.get("/admin/blockchain/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: null })),
        api.get("/admin/blockchain/transactions?limit=10", {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { data: [] } })),
      ]);

      if (statsRes.data) {
        setStats(statsRes.data);
      } else {
        // Mock data for demo
        setStats({
          totalWallets: 0,
          custodialWallets: 0,
          linkedWallets: 0,
          totalMarketsDeployed: 0,
          activeMarkets: 0,
          resolvedMarkets: 0,
          totalFutVolume: 0,
          totalTransactions: 0,
          pendingTransactions: 0,
        });
      }

      setRecentTxs(txsRes.data?.data || []);
    } catch (error) {
      console.error("Error fetching blockchain data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem("admin_token");
      await api.post("/admin/blockchain/sync", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  };

  const formatTxHash = (hash: string) => {
    if (!hash) return "-";
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return "text-emerald-400 bg-emerald-400/10";
      case 0: return "text-amber-400 bg-amber-400/10";
      case -1: return "text-rose-400 bg-rose-400/10";
      default: return "text-slate-400 bg-slate-400/10";
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return t("blockchain.confirmed");
      case 0: return t("blockchain.pendingStatus");
      case -1: return t("blockchain.failed");
      default: return t("blockchain.unknown");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">{t("blockchain.dashboard.title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("blockchain.dashboard.subtitle")}</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? t("blockchain.syncing") : t("blockchain.sync")}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Wallets */}
        <div className="bg-[#11131f] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              {t("blockchain.active")}
            </span>
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalWallets || 0}</p>
          <p className="text-xs text-slate-500 mt-1 font-bold">{t("blockchain.totalWallets")}</p>
          <div className="flex gap-4 mt-3 text-[10px] font-bold text-slate-600">
            <span>{t("blockchain.custodial")}: {stats?.custodialWallets || 0}</span>
            <span>{t("blockchain.linked")}: {stats?.linkedWallets || 0}</span>
          </div>
        </div>

        {/* Blockchain Markets */}
        <div className="bg-[#11131f] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {t("blockchain.onChain")}
            </span>
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalMarketsDeployed || 0}</p>
          <p className="text-xs text-slate-500 mt-1 font-bold">{t("blockchain.marketsDeployed")}</p>
          <div className="flex gap-4 mt-3 text-[10px] font-bold text-slate-600">
            <span>{t("blockchain.activeMarkets")}: {stats?.activeMarkets || 0}</span>
            <span>{t("blockchain.resolvedMarkets")}: {stats?.resolvedMarkets || 0}</span>
          </div>
        </div>

        {/* FUT Volume */}
        <div className="bg-[#11131f] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Coins className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {t("blockchain.volume")}
            </span>
          </div>
          <p className="text-3xl font-black text-white">
            {(stats?.totalFutVolume || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-bold">{t("blockchain.totalFutVolume")}</p>
        </div>

        {/* Transactions */}
        <div className="bg-[#11131f] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            {(stats?.pendingTransactions || 0) > 0 && (
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3" />
                {stats?.pendingTransactions} {t("blockchain.pending")}
              </span>
            )}
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalTransactions || 0}</p>
          <p className="text-xs text-slate-500 mt-1 font-bold">{t("blockchain.totalTransactions")}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push("/dashboard/blockchain/wallets")}
          className="bg-[#11131f] border border-white/5 hover:border-indigo-500/30 rounded-2xl p-6 text-left transition-all group"
        >
          <Wallet className="w-8 h-8 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold text-white">{t("blockchain.manageWallets")}</h3>
          <p className="text-xs text-slate-500 mt-1">{t("blockchain.manageWalletsDesc")}</p>
        </button>

        <button
          onClick={() => router.push("/dashboard/blockchain/markets")}
          className="bg-[#11131f] border border-white/5 hover:border-purple-500/30 rounded-2xl p-6 text-left transition-all group"
        >
          <BarChart3 className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold text-white">{t("blockchain.deployMarkets")}</h3>
          <p className="text-xs text-slate-500 mt-1">{t("blockchain.deployMarketsDesc")}</p>
        </button>

        <button
          onClick={() => router.push("/dashboard/blockchain/transactions")}
          className="bg-[#11131f] border border-white/5 hover:border-amber-500/30 rounded-2xl p-6 text-left transition-all group"
        >
          <Coins className="w-8 h-8 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold text-white">{t("blockchain.viewTransactions")}</h3>
          <p className="text-xs text-slate-500 mt-1">{t("blockchain.viewTransactionsDesc")}</p>
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[#11131f] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{t("blockchain.recentTransactions")}</h2>
          <button
            onClick={() => router.push("/dashboard/blockchain/transactions")}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
          >
            {t("blockchain.viewAll")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-white/5">
                <th className="text-left px-6 py-3 font-bold">{t("blockchain.txHash")}</th>
                <th className="text-left px-6 py-3 font-bold">{t("blockchain.type")}</th>
                <th className="text-left px-6 py-3 font-bold">{t("blockchain.user")}</th>
                <th className="text-right px-6 py-3 font-bold">{t("blockchain.amount")}</th>
                <th className="text-center px-6 py-3 font-bold">{t("blockchain.status")}</th>
                <th className="text-right px-6 py-3 font-bold">{t("blockchain.date")}</th>
              </tr>
            </thead>
            <tbody>
              {recentTxs.length > 0 ? (
                recentTxs.map((tx) => (
                  <tr key={tx.id} className="border-b border-white/3 hover:bg-white/2">
                    <td className="px-6 py-4">
                      <a
                        href={`https://explorer.solana.com/tx/${tx.txHash}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1"
                      >
                        {formatTxHash(tx.txHash)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-white uppercase">{tx.txType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-400">{tx.user?.name || tx.user?.email || "-"}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-white">
                        {tx.amount.toLocaleString("en-US", { maximumFractionDigits: 4 })} {tx.token}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${getStatusColor(tx.status)}`}>
                        {getStatusText(tx.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs text-slate-500">
                        {new Date(tx.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Coins className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">{t("blockchain.noTransactions")}</p>
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
