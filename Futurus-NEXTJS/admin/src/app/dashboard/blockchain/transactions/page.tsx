"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Coins,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface BlockchainTransaction {
  id: number;
  txHash: string;
  txType: string;
  amount: number;
  token: string;
  status: number;
  marketId: number | null;
  createdAt: string;
  solanaWallet: {
    publicKey: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
  };
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function BlockchainTransactionsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [page, search, typeFilter, statusFilter]);

  const fetchTransactions = async () => {
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
      if (search) params.append("search", search);
      if (typeFilter) params.append("type", typeFilter);
      if (statusFilter) params.append("status", statusFilter);

      const res = await api.get(`/admin/blockchain/transactions?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTransactions(res.data?.data || []);
      setMeta(res.data?.meta || null);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (typeFilter) params.append("type", typeFilter);
      if (statusFilter) params.append("status", statusFilter);

      const res = await api.get(`/admin/blockchain/transactions/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `blockchain-transactions-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const formatTxHash = (hash: string) => {
    if (!hash) return "-";
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "text-emerald-400 bg-emerald-400/10";
      case 0:
        return "text-amber-400 bg-amber-400/10";
      case -1:
        return "text-rose-400 bg-rose-400/10";
      default:
        return "text-slate-400 bg-slate-400/10";
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return t("blockchain.confirmed");
      case 0:
        return t("blockchain.pendingStatus");
      case -1:
        return t("blockchain.failed");
      default:
        return t("blockchain.unknown");
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "BET":
        return "text-indigo-400 bg-indigo-400/10";
      case "CLAIM":
        return "text-emerald-400 bg-emerald-400/10";
      case "DEPOSIT":
        return "text-blue-400 bg-blue-400/10";
      case "WITHDRAW":
        return "text-amber-400 bg-amber-400/10";
      default:
        return "text-slate-400 bg-slate-400/10";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "BET":
      case "DEPOSIT":
        return <ArrowDownRight className="w-3 h-3" />;
      case "CLAIM":
      case "WITHDRAW":
        return <ArrowUpRight className="w-3 h-3" />;
      default:
        return null;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">{t("transactions.title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("transactions.subtitle")}</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-sm transition-all"
        >
          <Download className="w-4 h-4" />
          {t("transactions.exportCsv")}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#11131f] border border-white/5 rounded-2xl p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder={t("transactions.search")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/5 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50"
        >
          <option value="">{t("transactions.allTypes")}</option>
          <option value="BET">{t("transactions.bet")}</option>
          <option value="CLAIM">{t("transactions.claim")}</option>
          <option value="DEPOSIT">{t("transactions.deposit")}</option>
          <option value="WITHDRAW">{t("transactions.withdraw")}</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50"
        >
          <option value="">{t("transactions.allStatus")}</option>
          <option value="1">{t("blockchain.confirmed")}</option>
          <option value="0">{t("blockchain.pendingStatus")}</option>
          <option value="-1">{t("blockchain.failed")}</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#11131f] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-white/5">
                <th className="text-left px-6 py-4 font-bold">{t("blockchain.txHash")}</th>
                <th className="text-left px-6 py-4 font-bold">{t("blockchain.user")}</th>
                <th className="text-center px-6 py-4 font-bold">{t("blockchain.type")}</th>
                <th className="text-right px-6 py-4 font-bold">{t("blockchain.amount")}</th>
                <th className="text-center px-6 py-4 font-bold">{t("markets.market")}</th>
                <th className="text-center px-6 py-4 font-bold">{t("blockchain.status")}</th>
                <th className="text-right px-6 py-4 font-bold">{t("blockchain.date")}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((tx) => (
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
                      <div>
                        <p className="text-sm font-bold text-white">{tx.solanaWallet?.user?.name || "-"}</p>
                        <p className="text-xs text-slate-500">{tx.solanaWallet?.user?.email || "-"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${getTypeColor(tx.txType)}`}>
                        {getTypeIcon(tx.txType)}
                        {tx.txType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-white">
                        {tx.amount?.toLocaleString("en-US", { maximumFractionDigits: 4 })} {tx.token}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {tx.marketId ? (
                        <a
                          href={`/dashboard/markets/${tx.marketId}`}
                          className="text-xs text-indigo-400 hover:text-indigo-300"
                        >
                          #{tx.marketId}
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${getStatusColor(tx.status)}`}>
                        {getStatusText(tx.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div>
                        <p className="text-xs text-white">
                          {new Date(tx.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(tx.createdAt).toLocaleTimeString("pt-BR")}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Coins className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">{t("transactions.noTransactions")}</p>
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
              {t("wallets.showing")} {((meta.page - 1) * meta.limit) + 1} {t("wallets.to")} {Math.min(meta.page * meta.limit, meta.total)} {t("wallets.of")} {meta.total} {t("transactions.transactionsCount")}
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
    </div>
  );
}
