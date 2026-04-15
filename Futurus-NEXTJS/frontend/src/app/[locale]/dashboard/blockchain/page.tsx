"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Wallet,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Copy,
  Check,
  Plus,
  ExternalLink,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockchainWallet {
  hasWallet: boolean;
  publicKey?: string;
  futBalance?: number;
  solBalance?: number;
  isCustodial?: boolean;
  lastSyncAt?: string;
}

interface BlockchainTransaction {
  id: number;
  txHash: string;
  txType: string;
  amount: number;
  token: string;
  status: string; // 'PENDING' | 'CONFIRMED' | 'FAILED'
  createdAt: string;
}

interface BlockchainPosition {
  id: number;
  marketId: number;
  question: string;
  slug: string;
  yesAmount: number;
  noAmount: number;
  totalInvested: number;
  claimed: boolean;
  marketStatus: string;
  marketResult: boolean | null;
}

export default function BlockchainPage() {
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<BlockchainWallet | null>(null);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [positions, setPositions] = useState<BlockchainPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "positions">("overview");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  useEffect(() => {
    if ((session as any)?.accessToken) {
      fetchWalletData();
    }
  }, [session]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const headers = {
        Authorization: `Bearer ${(session as any)?.accessToken}`,
        "Content-Type": "application/json",
      };

      // Fetch wallet info
      const walletRes = await fetch(`${API_URL}/blockchain/wallet`, { headers });
      const walletRaw = await walletRes.json();
      // Backend wraps response in { success, message, data }
      const walletData = walletRaw?.data || walletRaw;
      setWallet(walletData);

      // Only fetch transactions and positions if user has a wallet
      if (walletData?.hasWallet) {
        // Fetch transactions - backend wraps { data: [...], meta: {...} } in response wrapper
        const txRes = await fetch(`${API_URL}/blockchain/transactions?limit=10`, { headers });
        const txRaw = await txRes.json();
        const txData = txRaw?.data || txRaw;
        setTransactions(txData?.data || []);

        // Fetch positions - backend wraps { data: [...], meta: {...} } in response wrapper
        const posRes = await fetch(`${API_URL}/blockchain/positions?limit=10`, { headers });
        const posRaw = await posRes.json();
        const posData = posRaw?.data || posRaw;
        setPositions(posData?.data || []);
      }
    } catch (error) {
      console.error("Error fetching blockchain data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async () => {
    try {
      setCreating(true);
      const res = await fetch(`${API_URL}/blockchain/wallet/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      // Always refresh wallet data after attempt
      // This handles both success and "already exists" cases
      await fetchWalletData();

      if (!res.ok && data.message !== "User already has a Solana wallet") {
        console.error("Wallet creation issue:", data.message || data);
      }
    } catch (error) {
      console.error("Error creating wallet:", error);
      // Try to refresh anyway in case there's an existing wallet
      await fetchWalletData();
    } finally {
      setCreating(false);
    }
  };

  const syncBalance = async () => {
    try {
      setSyncing(true);
      const res = await fetch(`${API_URL}/blockchain/wallet/balance`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });
      const raw = await res.json();
      // Backend wraps response in { success, message, data }
      const data = raw?.data || raw;
      if (res.ok) {
        setWallet((prev) => prev ? { ...prev, ...data } : null);
      }
    } catch (error) {
      console.error("Error syncing balance:", error);
    } finally {
      setSyncing(false);
    }
  };

  const copyAddress = () => {
    if (wallet?.publicKey) {
      navigator.clipboard.writeText(wallet.publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTxTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      BET: "Aposta",
      CLAIM: "Resgate",
      DEPOSIT: "Depósito",
      WITHDRAW: "Saque",
    };
    return labels[type] || type;
  };

  const getTxTypeIcon = (type: string) => {
    switch (type) {
      case "BET":
        return <ArrowUpRight className="w-4 h-4 text-orange-400" />;
      case "CLAIM":
        return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
      case "DEPOSIT":
        return <ArrowDownLeft className="w-4 h-4 text-blue-400" />;
      case "WITHDRAW":
        return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      default:
        return <RefreshCw className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Blockchain</h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie sua carteira Solana e transações on-chain
          </p>
        </div>
        {wallet?.hasWallet && (
          <button
            onClick={syncBalance}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
            Sincronizar
          </button>
        )}
      </div>

      {/* Wallet Section */}
      {!wallet?.hasWallet ? (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-white/5 p-8 text-center">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Crie sua Carteira Solana
          </h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Para participar de mercados on-chain, você precisa de uma carteira Solana.
            Crie uma carteira custodiada para começar.
          </p>
          <button
            onClick={createWallet}
            disabled={creating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {creating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            Criar Carteira
          </button>
        </div>
      ) : (
        <>
          {/* Wallet Card */}
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl border border-white/10 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Carteira Solana</p>
                  <div className="flex items-center gap-2">
                    <code className="text-white font-mono">
                      {formatAddress(wallet.publicKey || "")}
                    </code>
                    <button
                      onClick={copyAddress}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <a
                      href={`https://explorer.solana.com/address/${wallet.publicKey}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </a>
                  </div>
                </div>
              </div>
              {wallet.isCustodial && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded-full">
                  Custodiada
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-slate-400 text-sm">FUT Balance</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {(wallet.futBalance || 0).toFixed(4)}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
                  <span className="text-slate-400 text-sm">SOL Balance</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {(wallet.solBalance || 0).toFixed(4)}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10 pb-1">
            {[
              { key: "overview", label: "Visão Geral" },
              { key: "transactions", label: "Transações" },
              { key: "positions", label: "Posições" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                  activeTab === tab.key
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <div className="bg-slate-800/50 rounded-2xl border border-white/5 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-blue-400" />
                  Transações Recentes
                </h3>
                {transactions.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">
                    Nenhuma transação encontrada
                  </p>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          {getTxTypeIcon(tx.txType)}
                          <div>
                            <p className="text-white text-sm font-medium">
                              {getTxTypeLabel(tx.txType)}
                            </p>
                            <p className="text-slate-500 text-xs">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-mono text-sm">
                            {tx.amount.toFixed(4)} {tx.token}
                          </p>
                          {getStatusIcon(tx.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Positions */}
              <div className="bg-slate-800/50 rounded-2xl border border-white/5 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Posições Ativas
                </h3>
                {positions.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">
                    Nenhuma posição encontrada
                  </p>
                ) : (
                  <div className="space-y-3">
                    {positions.slice(0, 5).map((pos) => (
                      <div
                        key={pos.id}
                        className="p-3 bg-white/5 rounded-xl"
                      >
                        <p className="text-white text-sm font-medium mb-2 line-clamp-1">
                          {pos.question}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex gap-4">
                            {pos.yesAmount > 0 && (
                              <span className="text-green-400">
                                SIM: {pos.yesAmount.toFixed(2)}
                              </span>
                            )}
                            {pos.noAmount > 0 && (
                              <span className="text-red-400">
                                NÃO: {pos.noAmount.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-bold",
                              pos.marketStatus === "ACTIVE"
                                ? "bg-green-500/20 text-green-400"
                                : pos.marketStatus === "RESOLVED"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                            )}
                          >
                            {pos.marketStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-slate-400 text-xs font-bold uppercase">
                      Tipo
                    </th>
                    <th className="text-left p-4 text-slate-400 text-xs font-bold uppercase">
                      Hash
                    </th>
                    <th className="text-right p-4 text-slate-400 text-xs font-bold uppercase">
                      Valor
                    </th>
                    <th className="text-center p-4 text-slate-400 text-xs font-bold uppercase">
                      Status
                    </th>
                    <th className="text-right p-4 text-slate-400 text-xs font-bold uppercase">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-t border-white/5">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getTxTypeIcon(tx.txType)}
                          <span className="text-white text-sm">
                            {getTxTypeLabel(tx.txType)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <a
                          href={`https://explorer.solana.com/tx/${tx.txHash}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-mono text-sm flex items-center gap-1"
                        >
                          {formatAddress(tx.txHash)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-white font-mono">
                          {tx.amount.toFixed(4)} {tx.token}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {getStatusIcon(tx.status)}
                      </td>
                      <td className="p-4 text-right text-slate-400 text-sm">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  Nenhuma transação encontrada
                </div>
              )}
            </div>
          )}

          {activeTab === "positions" && (
            <div className="bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-slate-400 text-xs font-bold uppercase">
                      Mercado
                    </th>
                    <th className="text-center p-4 text-slate-400 text-xs font-bold uppercase">
                      SIM
                    </th>
                    <th className="text-center p-4 text-slate-400 text-xs font-bold uppercase">
                      NÃO
                    </th>
                    <th className="text-right p-4 text-slate-400 text-xs font-bold uppercase">
                      Investido
                    </th>
                    <th className="text-center p-4 text-slate-400 text-xs font-bold uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => (
                    <tr key={pos.id} className="border-t border-white/5">
                      <td className="p-4">
                        <p className="text-white text-sm line-clamp-1 max-w-xs">
                          {pos.question}
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-green-400 font-mono">
                          {pos.yesAmount.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-red-400 font-mono">
                          {pos.noAmount.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-white font-mono">
                          {pos.totalInvested.toFixed(2)} FUT
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-bold",
                            pos.marketStatus === "ACTIVE"
                              ? "bg-green-500/20 text-green-400"
                              : pos.marketStatus === "RESOLVED"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-yellow-500/20 text-yellow-400"
                          )}
                        >
                          {pos.marketStatus}
                          {pos.claimed && " (Resgatado)"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {positions.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  Nenhuma posição encontrada
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
