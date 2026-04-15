"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  BarChart3,
  Search,
  ExternalLink,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface BlockchainMarket {
  id: number;
  marketId: number;
  onChainMarketId: string;
  tokenMintA: string;
  tokenMintB: string;
  totalFutDeposited: number;
  status: string;
  result: boolean | null;
  deployTxHash: string | null;
  resolveTxHash: string | null;
  createdAt: string;
  market: {
    id: number;
    question: string;
    slug: string;
  };
}

interface CentralizedMarket {
  id: number;
  question: string;
  slug: string;
  status: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function BlockchainMarketsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [markets, setMarkets] = useState<BlockchainMarket[]>([]);
  const [availableMarkets, setAvailableMarkets] = useState<CentralizedMarket[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [deploying, setDeploying] = useState<number | null>(null);
  const [resolving, setResolving] = useState<number | null>(null);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [showDeployModal, setShowDeployModal] = useState(false);

  useEffect(() => {
    fetchMarkets();
  }, [page, search, statusFilter]);

  const fetchMarkets = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.push("/");
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (statusFilter) {
        params.append("status", statusFilter);
      }

      const [marketsRes, availableRes] = await Promise.all([
        api.get(`/admin/blockchain/markets?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { data: [], meta: null } })),
        api.get("/admin/markets?status=OPEN&limit=100", {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { data: [] } })),
      ]);

      setMarkets(marketsRes.data?.data || []);
      setMeta(marketsRes.data?.meta || null);

      // Filter out already deployed markets
      const deployedMarketIds = new Set(
        (marketsRes.data?.data || []).map((m: BlockchainMarket) => m.marketId)
      );
      setAvailableMarkets(
        (availableRes.data?.data || []).filter(
          (m: CentralizedMarket) => !deployedMarketIds.has(m.id)
        )
      );
    } catch (error) {
      console.error("Error fetching markets:", error);
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async (marketId: number) => {
    setDeploying(marketId);
    try {
      const token = localStorage.getItem("admin_token");
      await api.post(
        `/admin/blockchain/markets/${marketId}/deploy`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowDeployModal(false);
      await fetchMarkets();
    } catch (error: any) {
      console.error("Deploy failed:", error);
      alert(error.response?.data?.message || "Failed to deploy market");
    } finally {
      setDeploying(null);
    }
  };

  const handleResolve = async (marketId: number, result: boolean) => {
    if (!confirm(`${t("markets.confirmResolve")} ${result ? "YES" : "NO"}?`)) {
      return;
    }
    setResolving(marketId);
    try {
      const token = localStorage.getItem("admin_token");
      await api.post(
        `/admin/blockchain/markets/${marketId}/resolve`,
        { result },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchMarkets();
    } catch (error: any) {
      console.error("Resolve failed:", error);
      alert(error.response?.data?.message || "Failed to resolve market");
    } finally {
      setResolving(null);
    }
  };

  const handleSync = async (marketId: number) => {
    setSyncing(marketId);
    try {
      const token = localStorage.getItem("admin_token");
      await api.post(
        `/admin/blockchain/markets/${marketId}/sync`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchMarkets();
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "PENDING":
        return <Clock className="w-4 h-4 text-amber-400" />;
      case "RESOLVED":
        return <XCircle className="w-4 h-4 text-indigo-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-emerald-400 bg-emerald-400/10";
      case "PENDING":
        return "text-amber-400 bg-amber-400/10";
      case "RESOLVED":
        return "text-indigo-400 bg-indigo-400/10";
      default:
        return "text-slate-400 bg-slate-400/10";
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "-";
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
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
          <h1 className="text-2xl font-black text-white tracking-tight">{t("markets.title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("markets.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowDeployModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all"
        >
          <Upload className="w-4 h-4" />
          {t("markets.deployMarket")}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#11131f] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder={t("markets.search")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/5 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50"
        >
          <option value="">{t("markets.allStatus")}</option>
          <option value="0">{t("blockchain.pendingStatus")}</option>
          <option value="1">{t("blockchain.active")}</option>
          <option value="2">{t("blockchain.resolvedMarkets")}</option>
        </select>
      </div>

      {/* Markets Table */}
      <div className="bg-[#11131f] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-white/5">
                <th className="text-left px-6 py-4 font-bold">{t("markets.market")}</th>
                <th className="text-left px-6 py-4 font-bold">{t("markets.onChainId")}</th>
                <th className="text-center px-6 py-4 font-bold">{t("blockchain.status")}</th>
                <th className="text-right px-6 py-4 font-bold">{t("markets.futVolume")}</th>
                <th className="text-center px-6 py-4 font-bold">{t("markets.result")}</th>
                <th className="text-center px-6 py-4 font-bold">{t("wallets.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {markets.length > 0 ? (
                markets.map((market) => (
                  <tr key={market.id} className="border-b border-white/3 hover:bg-white/2">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-white line-clamp-1">{market.market.question}</p>
                        <p className="text-xs text-slate-500">ID: {market.marketId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-indigo-400 font-mono">
                          {formatAddress(market.onChainMarketId)}
                        </code>
                        <a
                          href={`https://explorer.solana.com/address/${market.onChainMarketId}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-indigo-400 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg ${getStatusColor(market.status)}`}>
                        {getStatusIcon(market.status)}
                        {market.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-white">
                        {market.totalFutDeposited?.toLocaleString("en-US", { maximumFractionDigits: 2 }) || "0"} FUT
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {market.status === "RESOLVED" ? (
                        <span className={`text-xs font-bold ${market.result ? "text-emerald-400" : "text-rose-400"}`}>
                          {market.result ? "YES" : "NO"}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleSync(market.marketId)}
                          disabled={syncing === market.marketId}
                          title={t("markets.syncFromChain")}
                          className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-all disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${syncing === market.marketId ? "animate-spin" : ""}`} />
                        </button>
                        {market.status === "ACTIVE" && (
                          <>
                            <button
                              onClick={() => handleResolve(market.marketId, true)}
                              disabled={resolving === market.marketId}
                              title={t("markets.resolveYes")}
                              className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleResolve(market.marketId, false)}
                              disabled={resolving === market.marketId}
                              title={t("markets.resolveNo")}
                              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <BarChart3 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">{t("markets.noMarkets")}</p>
                    <button
                      onClick={() => setShowDeployModal(true)}
                      className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 font-bold"
                    >
                      {t("markets.deployFirst")}
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {t("wallets.showing")} {((meta.page - 1) * meta.limit) + 1} {t("wallets.to")} {Math.min(meta.page * meta.limit, meta.total)} {t("wallets.of")} {meta.total} {t("menu.blockchain.markets").toLowerCase()}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-400 px-4">
                {t("wallets.page")} {meta.page} {t("wallets.of")} {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#11131f] border border-white/10 rounded-3xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{t("markets.deployToBlockchain")}</h2>
              <button
                onClick={() => setShowDeployModal(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {availableMarkets.length > 0 ? (
                <div className="space-y-3">
                  {availableMarkets.map((market) => (
                    <div
                      key={market.id}
                      className="flex items-center justify-between p-4 bg-black/30 border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm font-bold text-white line-clamp-1">{market.question}</p>
                        <p className="text-xs text-slate-500 mt-1">ID: {market.id}</p>
                      </div>
                      <button
                        onClick={() => handleDeploy(market.id)}
                        disabled={deploying === market.id}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs transition-all disabled:opacity-50 whitespace-nowrap"
                      >
                        {deploying === market.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            {t("markets.deploying")}
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-4 h-4" />
                            {t("markets.deploy")}
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">{t("markets.noAvailable")}</p>
                  <p className="text-xs text-slate-600 mt-1">{t("markets.allDeployed")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
