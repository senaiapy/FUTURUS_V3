"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Coins,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Search,
  Filter,
  User,
  CheckCircle2,
  XCircle,
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
} from "lucide-react";

interface CoinTransaction {
  id: number;
  userId: number;
  username?: string;
  email?: string;
  amount: number;
  type: "EARNED" | "SPENT" | "REFUND";
  source: string;
  reference?: string;
  createdAt: string;
}

interface TransactionDetails {
  transaction: CoinTransaction;
  userBalance?: number;
  userTotalEarned?: number;
  userTotalSpent?: number;
}

export default function CoinTransactions() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<CoinTransaction["type"] | "ALL">("ALL");
  const [filterSource, setFilterSource] = useState<string>("ALL");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchTransactions = async () => {
      try {
        const res = await api.get("/game/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(res.data.transactions || []);
      } catch (err) {
        console.error("Failed to fetch coin transactions:", err);
        // Fallback demo data
        setTransactions([
          {
            id: 1,
            userId: 1,
            username: "john_doe",
            email: "john@example.com",
            amount: 100,
            type: "EARNED",
            source: "TASK_COMPLETION",
            reference: "Complete Profile",
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            userId: 1,
            username: "john_doe",
            email: "john@example.com",
            amount: 200,
            type: "EARNED",
            source: "TASK_COMPLETION",
            reference: "Make First Trade",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 3,
            userId: 2,
            username: "jane_smith",
            email: "jane@example.com",
            amount: 500,
            type: "EARNED",
            source: "REFERRAL",
            reference: "Referral Bonus",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: 4,
            userId: 1,
            username: "john_doe",
            email: "john@example.com",
            amount: 50,
            type: "SPENT",
            source: "MARKET_PURCHASE",
            reference: "Market #123",
            createdAt: new Date(Date.now() - 259200000).toISOString(),
          },
          {
            id: 5,
            userId: 3,
            username: "mike_wilson",
            email: "mike@example.com",
            amount: 100,
            type: "EARNED",
            source: "TASK_COMPLETION",
            reference: "Daily Login",
            createdAt: new Date(Date.now() - 345600000).toISOString(),
          },
          {
            id: 6,
            userId: 2,
            username: "jane_smith",
            email: "jane@example.com",
            amount: 25,
            type: "SPENT",
            source: "MARKET_PURCHASE",
            reference: "Market #124",
            createdAt: new Date(Date.now() - 432000000).toISOString(),
          },
          {
            id: 7,
            userId: 4,
            username: "sarah_connor",
            email: "sarah@example.com",
            amount: 10,
            type: "REFUND",
            source: "MARKET_CANCEL",
            reference: "Refund: Market #125",
            createdAt: new Date(Date.now() - 518400000).toISOString(),
          },
          {
            id: 8,
            userId: 5,
            username: "alex_johnson",
            email: "alex@example.com",
            amount: 200,
            type: "EARNED",
            source: "TASK_COMPLETION",
            reference: "Complete Profile",
            createdAt: new Date(Date.now() - 604800000).toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchTransactions();
  }, [router]);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || transaction.type === filterType;
    const matchesSource = filterSource === "ALL" || transaction.source === filterSource;
    return matchesSearch && matchesType && matchesSource;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    const token = localStorage.getItem("admin_token");
    try {
      const res = await api.get("/game/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error("Failed to refresh transactions:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewDetails = async (transactionId: number) => {
    const token = localStorage.getItem("admin_token");
    try {
      const res = await api.get(`/game/transactions/${transactionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedTransaction(res.data);
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Failed to fetch transaction details:", err);
      // Fallback demo data
      const tx = transactions.find((t) => t.id === transactionId)!;
      setSelectedTransaction({
        transaction: tx,
        userBalance: 500,
        userTotalEarned: 350,
        userTotalSpent: 50,
      });
      setShowDetailsModal(true);
    }
  };

  const getTypeLabel = (type: CoinTransaction["type"]) => {
    switch (type) {
      case "EARNED":
        return "Earned";
      case "SPENT":
        return "Spent";
      case "REFUND":
        return "Refund";
      default:
        return type;
    }
  };

  const getTypeColor = (type: CoinTransaction["type"]) => {
    switch (type) {
      case "EARNED":
        return "bg-green-600/30 text-green-200";
      case "SPENT":
        return "bg-red-600/30 text-red-200";
      case "REFUND":
        return "bg-amber-600/30 text-amber-200";
      default:
        return "bg-slate-600/30 text-slate-200";
    }
  };

  const getTypeIcon = (type: CoinTransaction["type"]) => {
    switch (type) {
      case "EARNED":
        return <ArrowUp className="w-4 h-4" />;
      case "SPENT":
        return <ArrowDown className="w-4 h-4" />;
      case "REFUND":
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Coins className="w-4 h-4" />;
    }
  };

  const sources = Array.from(new Set(transactions.map((t) => t.source))).filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f111a]">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coins size={32} />
            <div>
              <h1 className="text-2xl font-bold">Coin Transactions</h1>
              <p className="text-amber-100">Track all coin transactions and rewards</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
            <span className="font-medium">Refresh</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Filters */}
        <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0f111a] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as CoinTransaction["type"] | "ALL")}
              className="w-full bg-[#0f111a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <option value="ALL">All Types</option>
              <option value="EARNED">Earned</option>
              <option value="SPENT">Spent</option>
              <option value="REFUND">Refund</option>
            </select>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full bg-[#0f111a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <option value="ALL">All Sources</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Coins className="w-8 h-8 text-amber-400" />
              <span className="text-slate-400 text-sm">Total Transactions</span>
            </div>
            <p className="text-3xl font-bold text-white">{transactions.length}</p>
          </div>
          <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <span className="text-slate-400 text-sm">Total Earned</span>
            </div>
            <p className="text-3xl font-bold text-green-400">
              +{transactions
                .filter((t) => t.type === "EARNED")
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-8 h-8 text-red-400" />
              <span className="text-slate-400 text-sm">Total Spent</span>
            </div>
            <p className="text-3xl font-bold text-red-400">
              -{transactions
                .filter((t) => t.type === "SPENT")
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw className="w-8 h-8 text-amber-400" />
              <span className="text-slate-400 text-sm">Total Refunded</span>
            </div>
            <p className="text-3xl font-bold text-amber-400">
              +{transactions
                .filter((t) => t.type === "REFUND")
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="p-4 text-amber-200 font-medium">ID</th>
                  <th className="p-4 text-amber-200 font-medium">User</th>
                  <th className="p-4 text-amber-200 font-medium">Type</th>
                  <th className="p-4 text-amber-200 font-medium">Amount</th>
                  <th className="p-4 text-amber-200 font-medium">Source</th>
                  <th className="p-4 text-amber-200 font-medium">Reference</th>
                  <th className="p-4 text-amber-200 font-medium">Date</th>
                  <th className="p-4 text-amber-200 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                      <td className="p-4 text-slate-300 font-mono">{transaction.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-600/30 flex items-center justify-center">
                            <User size={16} className="text-amber-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">
                              {transaction.username || `User #${transaction.userId}`}
                            </p>
                            <p className="text-slate-500 text-xs">
                              {transaction.email || `ID: ${transaction.userId}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                            transaction.type,
                          )}`}
                        >
                          {getTypeIcon(transaction.type)}
                          {getTypeLabel(transaction.type)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-lg font-bold ${
                            transaction.type === "EARNED"
                              ? "text-green-400"
                              : transaction.type === "SPENT"
                                ? "text-red-400"
                                : "text-amber-400"
                          }`}
                        >
                          {transaction.type === "EARNED" || transaction.type === "REFUND"
                            ? "+"
                            : "-"}
                          {transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-sm">
                        {transaction.source.replace(/_/g, " ")}
                      </td>
                      <td className="p-4 text-slate-400 text-sm max-w-xs truncate">
                        {transaction.reference || "-"}
                      </td>
                      <td className="p-4 text-slate-400">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar size={14} />
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleViewDetails(transaction.id)}
                          className="p-2 bg-amber-600 hover:bg-amber-700 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Coins size={48} className="text-slate-600" />
                        <p className="text-slate-500 text-lg">No transactions found</p>
                        <p className="text-slate-600">
                          {searchTerm || filterType !== "ALL" || filterSource !== "ALL"
                            ? "Try adjusting your filters"
                            : "Coin transactions will appear here"}
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

      {/* Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f2e] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Transaction Details</h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedTransaction(null);
                }}
                className="text-slate-400 hover:text-white transition-all"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Transaction ID */}
              <div className="flex items-center justify-between p-4 bg-[#0f111a] rounded-xl">
                <span className="text-slate-400 text-sm">Transaction ID</span>
                <span className="text-white font-mono">
                  #{selectedTransaction.transaction.id}
                </span>
              </div>

              {/* Amount & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0f111a] rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-1">Amount</p>
                  <p
                    className={`text-2xl font-bold ${
                      selectedTransaction.transaction.type === "EARNED" ||
                      selectedTransaction.transaction.type === "REFUND"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {selectedTransaction.transaction.type === "EARNED" ||
                    selectedTransaction.transaction.type === "REFUND"
                      ? "+"
                      : "-"}
                    {selectedTransaction.transaction.amount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-[#0f111a] rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-1">Type</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
                      selectedTransaction.transaction.type,
                    )}`}
                  >
                    {getTypeIcon(selectedTransaction.transaction.type)}
                    {getTypeLabel(selectedTransaction.transaction.type)}
                  </span>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-[#0f111a] rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-1">User</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-600/30 flex items-center justify-center">
                    <User size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {selectedTransaction.transaction.username ||
                        `User #${selectedTransaction.transaction.userId}`}
                    </p>
                    <p className="text-slate-500 text-sm">
                      {selectedTransaction.transaction.email ||
                        `ID: ${selectedTransaction.transaction.userId}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Source & Reference */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0f111a] rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-1">Source</p>
                  <p className="text-white">
                    {selectedTransaction.transaction.source.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="bg-[#0f111a] rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-1">Reference</p>
                  <p className="text-white text-sm truncate">
                    {selectedTransaction.transaction.reference || "-"}
                  </p>
                </div>
              </div>

              {/* User Stats */}
              {(selectedTransaction.userBalance !== undefined ||
                selectedTransaction.userTotalEarned !== undefined ||
                selectedTransaction.userTotalSpent !== undefined) && (
                <div className="grid grid-cols-3 gap-4">
                  {selectedTransaction.userBalance !== undefined && (
                    <div className="bg-[#0f111a] rounded-xl p-4">
                      <p className="text-slate-400 text-sm mb-1">Balance</p>
                      <p className="text-2xl font-bold text-white">
                        {selectedTransaction.userBalance.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedTransaction.userTotalEarned !== undefined && (
                    <div className="bg-[#0f111a] rounded-xl p-4">
                      <p className="text-slate-400 text-sm mb-1">Total Earned</p>
                      <p className="text-2xl font-bold text-green-400">
                        +{selectedTransaction.userTotalEarned.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedTransaction.userTotalSpent !== undefined && (
                    <div className="bg-[#0f111a] rounded-xl p-4">
                      <p className="text-slate-400 text-sm mb-1">Total Spent</p>
                      <p className="text-2xl font-bold text-red-400">
                        -{selectedTransaction.userTotalSpent.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Date */}
              <div className="bg-[#0f111a] rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-1">Transaction Date</p>
                <p className="text-white">
                  {new Date(selectedTransaction.transaction.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
