"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Wallet,
  Search,
  ExternalLink,
  Copy,
  CheckCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface SolanaWallet {
  id: number;
  userId: number;
  publicKey: string;
  isCustodial: boolean;
  futBalance: number;
  solBalance: number;
  lastSyncAt: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function BlockchainWalletsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [wallets, setWallets] = useState<SolanaWallet[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [syncingId, setSyncingId] = useState<number | null>(null);

  useEffect(() => {
    fetchWallets();
  }, [page, search]);

  const fetchWallets = async () => {
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
      if (search) {
        params.append("search", search);
      }

      const res = await api.get(`/admin/blockchain/wallets?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWallets(res.data?.data || []);
      setMeta(res.data?.meta || null);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      setWallets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (publicKey: string, id: number) => {
    await navigator.clipboard.writeText(publicKey);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSync = async (userId: number) => {
    setSyncingId(userId);
    try {
      const token = localStorage.getItem("admin_token");
      await api.post(`/admin/blockchain/wallets/${userId}/sync`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchWallets();
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncingId(null);
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
          <h1 className="text-2xl font-black text-white tracking-tight">{t("wallets.title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("wallets.subtitle")}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#11131f] border border-white/5 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder={t("wallets.search")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/5 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Wallets Table */}
      <div className="bg-[#11131f] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-white/5">
                <th className="text-left px-6 py-4 font-bold">{t("blockchain.user")}</th>
                <th className="text-left px-6 py-4 font-bold">{t("wallets.walletAddress")}</th>
                <th className="text-center px-6 py-4 font-bold">{t("blockchain.type")}</th>
                <th className="text-right px-6 py-4 font-bold">{t("wallets.futBalance")}</th>
                <th className="text-right px-6 py-4 font-bold">{t("wallets.solBalance")}</th>
                <th className="text-center px-6 py-4 font-bold">{t("wallets.lastSync")}</th>
                <th className="text-center px-6 py-4 font-bold">{t("wallets.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {wallets.length > 0 ? (
                wallets.map((wallet) => (
                  <tr key={wallet.id} className="border-b border-white/3 hover:bg-white/2">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-white">{wallet.user?.name || "-"}</p>
                        <p className="text-xs text-slate-500">{wallet.user?.email || "-"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-indigo-400 font-mono">
                          {formatAddress(wallet.publicKey)}
                        </code>
                        <button
                          onClick={() => handleCopy(wallet.publicKey, wallet.id)}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                        >
                          {copiedId === wallet.id ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <a
                          href={`https://explorer.solana.com/address/${wallet.publicKey}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-indigo-400 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                          wallet.isCustodial
                            ? "text-indigo-400 bg-indigo-400/10"
                            : "text-amber-400 bg-amber-400/10"
                        }`}
                      >
                        {wallet.isCustodial ? "Custodial" : "Linked"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-white">
                        {wallet.futBalance?.toLocaleString("en-US", { maximumFractionDigits: 4 }) || "0"} FUT
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-slate-400">
                        {wallet.solBalance?.toLocaleString("en-US", { maximumFractionDigits: 4 }) || "0"} SOL
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs text-slate-500">
                        {wallet.lastSyncAt
                          ? new Date(wallet.lastSyncAt).toLocaleString("pt-BR")
                          : t("wallets.never")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleSync(wallet.userId)}
                        disabled={syncingId === wallet.userId}
                        className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-all disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`w-4 h-4 ${syncingId === wallet.userId ? "animate-spin" : ""}`}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Wallet className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">{t("wallets.noWallets")}</p>
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
              {t("wallets.showing")} {((meta.page - 1) * meta.limit) + 1} {t("wallets.to")} {Math.min(meta.page * meta.limit, meta.total)} {t("wallets.of")} {meta.total} {t("wallets.walletsCount")}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-400 px-4">
                {t("wallets.page")} {meta.page} {t("wallets.of")} {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
