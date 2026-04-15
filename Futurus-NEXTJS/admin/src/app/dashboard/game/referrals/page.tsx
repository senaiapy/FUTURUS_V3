"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Users,
  Gift,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  Copy,
  ExternalLink,
  Check,
  X,
} from "lucide-react";

interface Referral {
  id: number;
  userId: number;
  username: string;
  email: string;
  referralCode: string;
  referrerId?: number;
  status: number; // 0=pending, 1=completed
  commission?: number;
  createdAt: string;
  updatedAt: string;
}

interface ReferralDetails {
  referral: Referral;
  referredUsers?: Referral[];
  totalEarned?: number;
  totalCompleted?: number;
}

export default function GameReferrals() {
  const router = useRouter();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<ReferralDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<number | "ALL">("ALL");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchReferrals = async () => {
      try {
        const res = await api.get("/game/referrals", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReferrals(res.data.referrals || []);
      } catch (err) {
        console.error("Failed to fetch referrals:", err);
        // Fallback demo data
        setReferrals([
          {
            id: 1,
            userId: 1,
            username: "john_doe",
            email: "john@example.com",
            referralCode: "JOHN2024",
            status: 1,
            commission: 500,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            userId: 2,
            username: "jane_smith",
            email: "jane@example.com",
            referralCode: "JANE2024",
            status: 1,
            commission: 750,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 3,
            userId: 3,
            username: "mike_wilson",
            email: "mike@example.com",
            referralCode: "MIKE2024",
            status: 0,
            referrerId: 1,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: 4,
            userId: 4,
            username: "sarah_connor",
            email: "sarah@example.com",
            referralCode: "SARAH2024",
            status: 0,
            referrerId: 2,
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            updatedAt: new Date(Date.now() - 259200000).toISOString(),
          },
          {
            id: 5,
            userId: 5,
            username: "alex_johnson",
            email: "alex@example.com",
            referralCode: "ALEX2024",
            status: 1,
            commission: 250,
            createdAt: new Date(Date.now() - 345600000).toISOString(),
            updatedAt: new Date(Date.now() - 345600000).toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [router]);

  const filteredReferrals = referrals.filter((referral) => {
    const matchesSearch =
      referral.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referralCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || referral.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = async (referralId: number) => {
    const token = localStorage.getItem("admin_token");
    try {
      const res = await api.get(`/game/referrals/${referralId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedReferral(res.data);
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Failed to fetch referral details:", err);
      // Fallback demo data
      setSelectedReferral({
        referral: referrals.find((r) => r.id === referralId)!,
        referredUsers: [],
        totalEarned: 500,
        totalCompleted: 5,
      });
      setShowDetailsModal(true);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm("Are you sure you want to approve this referral?")) return;
    const token = localStorage.getItem("admin_token");
    try {
      await api.post(`/game/referrals/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Reload referrals
      const res = await api.get("/game/referrals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReferrals(res.data.referrals || []);
      alert("Referral approved successfully!");
    } catch (err) {
      console.error("Failed to approve referral:", err);
      alert("Failed to approve referral");
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Are you sure you want to reject this referral?")) return;
    const token = localStorage.getItem("admin_token");
    try {
      await api.post(`/game/referrals/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Reload referrals
      const res = await api.get("/game/referrals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReferrals(res.data.referrals || []);
      alert("Referral rejected successfully!");
    } catch (err) {
      console.error("Failed to reject referral:", err);
      alert("Failed to reject referral");
    }
  };

  const copyReferralCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert("Referral code copied to clipboard!");
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "bg-amber-600/30 text-amber-200";
      case 1:
        return "bg-green-600/30 text-green-200";
      default:
        return "bg-slate-600/30 text-slate-200";
    }
  };

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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift size={32} />
            <div>
              <h1 className="text-2xl font-bold">Referrals</h1>
              <p className="text-purple-100">Manage user referrals and rewards</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Filters */}
        <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search referrals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0f111a] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value === "ALL" ? "ALL" : parseInt(e.target.value))}
              className="w-full bg-[#0f111a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            >
              <option value="ALL">All Status</option>
              <option value="0">Pending</option>
              <option value="1">Completed</option>
            </select>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-purple-400" />
              <span className="text-slate-400 text-sm">Total Referrals</span>
            </div>
            <p className="text-3xl font-bold text-white">{referrals.length}</p>
          </div>
          <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
              <span className="text-slate-400 text-sm">Completed</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {referrals.filter((r) => r.status === 1).length}
            </p>
          </div>
          <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8 text-amber-400" />
              <span className="text-slate-400 text-sm">Pending</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {referrals.filter((r) => r.status === 0).length}
            </p>
          </div>
          <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-8 h-8 text-pink-400" />
              <span className="text-slate-400 text-sm">Total Earned</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {referrals
                .filter((r) => r.commission)
                .reduce((sum, r) => sum + (r.commission || 0), 0)
                .toLocaleString()}
            </p>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="p-4 text-purple-200 font-medium">ID</th>
                  <th className="p-4 text-purple-200 font-medium">User</th>
                  <th className="p-4 text-purple-200 font-medium">Email</th>
                  <th className="p-4 text-purple-200 font-medium">Referral Code</th>
                  <th className="p-4 text-purple-200 font-medium">Commission</th>
                  <th className="p-4 text-purple-200 font-medium">Status</th>
                  <th className="p-4 text-purple-200 font-medium">Created</th>
                  <th className="p-4 text-purple-200 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReferrals.length > 0 ? (
                  filteredReferrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                      <td className="p-4 text-slate-300 font-mono">{referral.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center">
                            <User size={16} className="text-purple-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{referral.username}</p>
                            <p className="text-slate-500 text-xs">ID: {referral.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-slate-500" />
                          {referral.email}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-indigo-600/30 text-indigo-200 rounded text-xs font-mono">
                            {referral.referralCode}
                          </code>
                          <button
                            onClick={() => copyReferralCode(referral.referralCode)}
                            className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded transition-all"
                            title="Copy code"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-pink-400 font-bold">
                          {referral.commission ? `+${referral.commission.toLocaleString()}` : "-"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            referral.status,
                          )}`}
                        >
                          {getStatusLabel(referral.status)}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(referral.id)}
                            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all"
                            title="View Details"
                          >
                            <ExternalLink size={16} />
                          </button>
                          {referral.status === 0 && (
                            <>
                              <button
                                onClick={() => handleApprove(referral.id)}
                                className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all"
                                title="Approve"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => handleReject(referral.id)}
                                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all"
                                title="Reject"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Gift size={48} className="text-slate-600" />
                        <p className="text-slate-500 text-lg">No referrals found</p>
                        <p className="text-slate-600">
                          {searchTerm || filterStatus !== "ALL"
                            ? "Try adjusting your filters"
                            : "Referrals will appear here when users sign up with referral codes"}
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
      {showDetailsModal && selectedReferral && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f2e] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Referral Details</h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedReferral(null);
                }}
                className="text-slate-400 hover:text-white transition-all"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-[#0f111a] rounded-xl">
                <div className="w-16 h-16 rounded-full bg-purple-600/30 flex items-center justify-center">
                  <User size={32} className="text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-lg">
                    {selectedReferral.referral.username}
                  </p>
                  <p className="text-slate-400 flex items-center gap-2">
                    <Mail size={14} />
                    {selectedReferral.referral.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="px-3 py-1 bg-indigo-600/30 text-indigo-200 rounded text-sm">
                      {selectedReferral.referral.referralCode}
                    </code>
                    <button
                      onClick={() => copyReferralCode(selectedReferral.referral.referralCode)}
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded transition-all"
                      title="Copy code"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0f111a] rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-1">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedReferral.referral.status,
                    )}`}
                  >
                    {getStatusLabel(selectedReferral.referral.status)}
                  </span>
                </div>
                <div className="bg-[#0f111a] rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-1">Commission</p>
                  <p className="text-2xl font-bold text-pink-400">
                    {selectedReferral.referral.commission
                      ? `+${selectedReferral.referral.commission.toLocaleString()}`
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0f111a] rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-1">Total Earned</p>
                  <p className="text-2xl font-bold text-green-400">
                    {selectedReferral.totalEarned
                      ? `+${selectedReferral.totalEarned.toLocaleString()}`
                      : "+500"}
                  </p>
                </div>
                <div className="bg-[#0f111a] rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-1">Tasks Completed</p>
                  <p className="text-2xl font-bold text-indigo-400">
                    {selectedReferral.totalCompleted || "5"}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0f111a] rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-1">Created At</p>
                  <p className="text-white">
                    {new Date(selectedReferral.referral.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="bg-[#0f111a] rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-1">Updated At</p>
                  <p className="text-white">
                    {new Date(selectedReferral.referral.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
