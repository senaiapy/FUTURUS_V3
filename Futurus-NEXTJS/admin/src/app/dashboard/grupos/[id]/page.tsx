"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, TrendingUp, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface Member {
  id: number;
  user: { id: number; username: string; firstname: string | null; image: string | null };
  contributionAmount: number;
  ownershipPercentage: number | null;
  joinedAt: string;
}

interface Group {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: number;
  isPublic: boolean;
  currentLiquidity: { toString: () => string };
  targetLiquidity: { toString: () => string };
  minContribution: { toString: () => string };
  maxContribution: { toString: () => string } | null;
  maxParticipants: number | null;
  managerFeePercent: { toString: () => string };
  adminApproved: boolean;
  outcomeSelected: string | null;
  decisionMethod: number;
  rejectionReason: string | null;
  creator: { id: number; username: string; firstname: string | null };
  market: { id: number; question: string; slug: string; status: number };
  members: Member[];
  orders: any[];
  _count: { members: number; votes: number };
  createdAt: string;
  lockedAt: string | null;
  executedAt: string | null;
  resolvedAt: string | null;
}

const statusNames = [
  "DRAFT",
  "PENDING_APPROVAL",
  "REJECTED",
  "OPEN",
  "LOCKED",
  "VOTING",
  "EXECUTED",
  "RESOLVED",
  "CANCELLED",
  "REFUNDED",
  "AWAITING_RESULT_APPROVAL",
];

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

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
    fetchGroup();
  }, [params.id]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/groups/${params.id}`, getAuthHeaders());
      setGroup(response.data);
    } catch (error) {
      console.error("Failed to fetch group:", error);
    } finally {
      setLoading(false);
    }
  };

  const approveGroup = async () => {
    try {
      await api.post(`/admin/groups/${params.id}/approve`, {}, getAuthHeaders());
      fetchGroup();
    } catch (error) {
      console.error("Failed to approve group:", error);
    }
  };

  const rejectGroup = async () => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await api.post(`/admin/groups/${params.id}/reject`, { reason }, getAuthHeaders());
      fetchGroup();
    } catch (error) {
      console.error("Failed to reject group:", error);
    }
  };

  const cancelGroup = async () => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;
    try {
      await api.post(`/admin/groups/${params.id}/cancel`, { reason }, getAuthHeaders());
      fetchGroup();
    } catch (error) {
      console.error("Failed to cancel group:", error);
    }
  };

  const approveResult = async () => {
    if (!confirm("Are you sure you want to approve this result and execute the bet?")) return;
    try {
      await api.post(`/admin/groups/${params.id}/approve-result`, {}, getAuthHeaders());
      fetchGroup();
    } catch (error) {
      console.error("Failed to approve result:", error);
    }
  };

  const rejectResult = async () => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await api.post(`/admin/groups/${params.id}/reject-result`, { reason }, getAuthHeaders());
      fetchGroup();
    } catch (error) {
      console.error("Failed to reject result:", error);
    }
  };

  const getStatusBadge = (status: number) => {
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
    const name = statusNames[status] || "UNKNOWN";
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[name] || "bg-gray-500/20 text-gray-400"}`}>
        {name.replace("_", " ")}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">Group not found</p>
        <Link href="/dashboard/grupos" className="text-indigo-400 mt-4 inline-block">
          Back to Groups
        </Link>
      </div>
    );
  }

  const currentLiquidity = parseFloat(group.currentLiquidity.toString());
  const targetLiquidity = parseFloat(group.targetLiquidity.toString());
  const progress = targetLiquidity > 0 ? (currentLiquidity / targetLiquidity) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-[#1a1c29] text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{group.name}</h1>
          <p className="text-gray-400">{group.isPublic ? "Public Group" : "Private Group"}</p>
        </div>
        {getStatusBadge(group.status)}
      </div>

      {/* Action Buttons - Group Approval */}
      {group.status === 1 && (
        <div className="flex gap-3">
          <button
            onClick={approveGroup}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <CheckCircle className="w-4 h-4" />
            Approve Group
          </button>
          <button
            onClick={rejectGroup}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <XCircle className="w-4 h-4" />
            Reject Group
          </button>
        </div>
      )}

      {/* Action Buttons - Result Approval */}
      {group.status === 10 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-amber-400 font-medium mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Result Pending Approval
          </p>
          <p className="text-gray-300 mb-4">
            Manager @{group.creator.username} has declared result: <strong className="text-white">{group.outcomeSelected}</strong>
          </p>
          <div className="flex gap-3">
            <button
              onClick={approveResult}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <CheckCircle className="w-4 h-4" />
              Approve Result & Execute Bet
            </button>
            <button
              onClick={rejectResult}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <XCircle className="w-4 h-4" />
              Reject Result
            </button>
          </div>
        </div>
      )}

      {/* Rejection Reason */}
      {group.rejectionReason && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 font-medium">Rejection Reason:</p>
          <p className="text-gray-300">{group.rejectionReason}</p>
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Market Info */}
        <div className="bg-[#1a1c29] rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Market</p>
          <p className="text-white font-medium">{group.market.question}</p>
          <Link
            href={`/dashboard/markets?id=${group.market.id}`}
            className="text-indigo-400 text-sm mt-2 inline-block hover:underline"
          >
            View Market
          </Link>
        </div>

        {/* Manager */}
        <div className="bg-[#1a1c29] rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Manager</p>
          <p className="text-white font-medium">@{group.creator.username}</p>
          <p className="text-gray-400 text-sm">{group.creator.firstname || "No name"}</p>
        </div>

        {/* Decision Method */}
        <div className="bg-[#1a1c29] rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Decision Method</p>
          <p className="text-white font-medium">{group.decisionMethod === 0 ? "Manager Decides" : "Member Voting"}</p>
          {group.outcomeSelected && (
            <p className="text-indigo-400 text-sm mt-1">Outcome: {group.outcomeSelected}</p>
          )}
        </div>

        {/* Liquidity Progress */}
        <div className="bg-[#1a1c29] rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Liquidity</p>
          <div className="flex justify-between mb-1">
            <span className="text-white font-medium">${currentLiquidity.toLocaleString()}</span>
            <span className="text-gray-400">${targetLiquidity.toLocaleString()}</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-gray-400 text-sm mt-1">{progress.toFixed(1)}% filled</p>
        </div>

        {/* Contribution Limits */}
        <div className="bg-[#1a1c29] rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Contribution Limits</p>
          <p className="text-white">
            Min: ${parseFloat(group.minContribution.toString()).toLocaleString()}
          </p>
          <p className="text-white">
            Max: {group.maxContribution ? `$${parseFloat(group.maxContribution.toString()).toLocaleString()}` : "No limit"}
          </p>
        </div>

        {/* Participants */}
        <div className="bg-[#1a1c29] rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Participants</p>
          <p className="text-white font-medium">{group._count.members} members</p>
          {group.maxParticipants && (
            <p className="text-gray-400 text-sm">Max: {group.maxParticipants}</p>
          )}
        </div>

        {/* Manager Fee */}
        <div className="bg-[#1a1c29] rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Manager Fee</p>
          <p className="text-white font-medium">{parseFloat(group.managerFeePercent.toString())}%</p>
        </div>

        {/* Created */}
        <div className="bg-[#1a1c29] rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Created</p>
          <p className="text-white">{new Date(group.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Approval Status */}
        <div className="bg-[#1a1c29] rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Approval Status</p>
          <p className={`font-medium ${group.adminApproved ? "text-emerald-400" : "text-amber-400"}`}>
            {group.adminApproved ? "Approved" : "Not Approved"}
          </p>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-[#1a1c29] rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members ({group.members.length})
          </h2>
        </div>
        {group.members.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No members yet</div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#0f1117]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Contribution</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Ownership</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {group.members.map((member) => (
                <tr key={member.id} className="hover:bg-[#0f1117]/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                        {member.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">@{member.user.username}</p>
                        <p className="text-gray-400 text-xs">{member.user.firstname || ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white">
                    ${member.contributionAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-indigo-400">
                    {member.ownershipPercentage ? (member.ownershipPercentage * 100).toFixed(2) : 0}%
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Cancel Button */}
      {![7, 8, 9].includes(group.status) && (
        <div className="flex justify-end">
          <button
            onClick={cancelGroup}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 border border-red-600/30"
          >
            <XCircle className="w-4 h-4" />
            Cancel & Refund Group
          </button>
        </div>
      )}
    </div>
  );
}
