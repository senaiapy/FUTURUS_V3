"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UsersRound, CheckCircle, XCircle, Clock, TrendingUp, Eye, Search, RefreshCw } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface Group {
  id: number;
  name: string;
  slug: string;
  status: string;
  statusCode: number;
  isPublic: boolean;
  currentLiquidity: number;
  targetLiquidity: number;
  memberCount: number;
  adminApproved: boolean;
  outcomeSelected: string | null;
  creator: { id: number; username: string; firstname: string | null };
  market: { id: number; question: string; slug: string };
  createdAt: string;
}

interface Stats {
  total: number;
  pending: number;
  active: number;
  resolved: number;
  totalLiquidity: number;
}

export default function GruposPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, active: 0, resolved: 0, totalLiquidity: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const statusFilters = [
    { key: "all", label: "All" },
    { key: "1", label: "Pending Approval" },
    { key: "10", label: "Pending Result" },
    { key: "3", label: "Open" },
    { key: "6", label: "Executed" },
    { key: "7", label: "Resolved" },
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem("admin_token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }
    fetchGroups();
    fetchStats();
  }, [filter, page]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (filter !== "all") params.status = parseInt(filter);
      if (search) params.search = search;

      const response = await api.get("/admin/groups", { params, ...getAuthHeaders() });
      setGroups(response.data.data || []);
      setTotalPages(response.data.meta?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/groups/stats", getAuthHeaders());
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const approveGroup = async (id: number) => {
    try {
      await api.post(`/admin/groups/${id}/approve`, {}, getAuthHeaders());
      fetchGroups();
      fetchStats();
    } catch (error) {
      console.error("Failed to approve group:", error);
    }
  };

  const rejectGroup = async (id: number) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await api.post(`/admin/groups/${id}/reject`, { reason }, getAuthHeaders());
      fetchGroups();
      fetchStats();
    } catch (error) {
      console.error("Failed to reject group:", error);
    }
  };

  const cancelGroup = async (id: number) => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;
    try {
      await api.post(`/admin/groups/${id}/cancel`, { reason }, getAuthHeaders());
      fetchGroups();
      fetchStats();
    } catch (error) {
      console.error("Failed to cancel group:", error);
    }
  };

  const getStatusBadge = (status: string, statusCode: number) => {
    const statusColors: Record<string, string> = {
      DRAFT: "bg-gray-500/20 text-gray-400",
      PENDING_APPROVAL: "bg-amber-500/20 text-amber-400",
      REJECTED: "bg-red-500/20 text-red-400",
      OPEN: "bg-emerald-500/20 text-emerald-400",
      LOCKED: "bg-blue-500/20 text-blue-400",
      VOTING: "bg-purple-500/20 text-purple-400",
      EXECUTED: "bg-indigo-500/20 text-indigo-400",
      RESOLVED: "bg-purple-500/20 text-purple-400",
      CANCELLED: "bg-red-500/20 text-red-400",
      REFUNDED: "bg-orange-500/20 text-orange-400",
      AWAITING_RESULT_APPROVAL: "bg-amber-500/20 text-amber-400",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-500/20 text-gray-400"}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Group Syndicates</h1>
          <p className="text-gray-400">Manage betting groups and syndicates</p>
        </div>
        <button
          onClick={() => { fetchGroups(); fetchStats(); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-[#1a1c29] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <UsersRound className="w-8 h-8 text-indigo-400" />
            <div>
              <p className="text-gray-400 text-sm">Total Groups</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1c29] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-400" />
            <div>
              <p className="text-gray-400 text-sm">Pending Approval</p>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1c29] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1c29] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-gray-400 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-white">{stats.resolved}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1c29] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-gray-400 text-sm">Total Liquidity</p>
              <p className="text-2xl font-bold text-white">${stats.totalLiquidity.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.key
                  ? "bg-indigo-600 text-white"
                  : "bg-[#1a1c29] text-gray-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchGroups()}
              className="w-full pl-10 pr-4 py-2 bg-[#1a1c29] border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Groups Table */}
      <div className="bg-[#1a1c29] rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <UsersRound className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No groups found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#0f1117]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Group</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Market</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Manager</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Members</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Liquidity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-[#0f1117]/50">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-white">{group.name}</p>
                      <p className="text-xs text-gray-400">{group.isPublic ? "Public" : "Private"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-gray-300 text-sm truncate max-w-xs">{group.market.question}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-gray-300">@{group.creator.username}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-white">{group.memberCount}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-white">${group.currentLiquidity.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">of ${group.targetLiquidity.toLocaleString()}</p>
                      <div className="w-20 h-1 bg-gray-700 rounded-full mt-1">
                        <div
                          className="h-1 bg-indigo-500 rounded-full"
                          style={{ width: `${Math.min((group.currentLiquidity / group.targetLiquidity) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">{getStatusBadge(group.status, group.statusCode)}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {group.status === "PENDING_APPROVAL" && (
                        <>
                          <button
                            onClick={() => approveGroup(group.id)}
                            className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => rejectGroup(group.id)}
                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <Link
                        href={`/dashboard/grupos/${group.id}`}
                        className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-[#1a1c29] text-gray-400 rounded-lg disabled:opacity-50 hover:text-white"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-[#1a1c29] text-gray-400 rounded-lg disabled:opacity-50 hover:text-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
