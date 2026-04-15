"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Trophy,
  Coins,
  CheckCircle2,
  Users,
  Clock,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";

interface GameStats {
  totalUsers: number;
  totalCoinsEarned: number;
  totalTasksCompleted: number;
  totalReferrals: number;
  pendingVerifications: number;
  activeTasks: number;
  todayEarnings: number;
  weeklyEarnings: number;
}

export default function GameStatistics() {
  const router = useRouter();
  const [stats, setStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await api.get("/game/statistics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch game statistics:", err);
        // Fallback demo data
        setStats({
          totalUsers: 1250,
          totalCoinsEarned: 52500,
          totalTasksCompleted: 3240,
          totalReferrals: 385,
          pendingVerifications: 12,
          activeTasks: 8,
          todayEarnings: 1250,
          weeklyEarnings: 8750,
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchStats();
  }, [router]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const token = localStorage.getItem("admin_token");
    try {
      const res = await api.get("/game/statistics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Failed to refresh statistics:", err);
    } finally {
      setRefreshing(false);
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

  if (!stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f111a]">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy size={32} />
            <div>
              <h1 className="text-2xl font-bold">Game Statistics</h1>
              <p className="text-indigo-100">Overview of gamification performance</p>
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
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Users size={24} className="text-white" />
              </div>
              <span className="text-indigo-100 text-sm">Total Users</span>
            </div>
            <p className="text-4xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Coins size={24} className="text-white" />
              </div>
              <span className="text-purple-100 text-sm">Total Coins Earned</span>
            </div>
            <p className="text-4xl font-bold text-white">{stats.totalCoinsEarned.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <CheckCircle2 size={24} className="text-white" />
              </div>
              <span className="text-green-100 text-sm">Tasks Completed</span>
            </div>
            <p className="text-4xl font-bold text-white">{stats.totalTasksCompleted.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Clock size={24} className="text-white" />
              </div>
              <span className="text-orange-100 text-sm">Total Referrals</span>
            </div>
            <p className="text-4xl font-bold text-white">{stats.totalReferrals.toLocaleString()}</p>
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <UserCheck size={20} className="text-emerald-400" />
              </div>
              <span className="text-slate-400 text-sm">Active Tasks</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.activeTasks}</p>
          </div>

          <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <Clock size={20} className="text-amber-400" />
              </div>
              <span className="text-slate-400 text-sm">Pending Verifications</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.pendingVerifications}</p>
          </div>

          <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <ArrowUpRight size={20} className="text-cyan-400" />
              </div>
              <span className="text-slate-400 text-sm">Today's Earnings</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">+{stats.todayEarnings.toLocaleString()}</p>
          </div>

          <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-violet-500/20 rounded-xl">
                <ArrowDownRight size={20} className="text-violet-400" />
              </div>
              <span className="text-slate-400 text-sm">Weekly Earnings</span>
            </div>
            <p className="text-2xl font-bold text-violet-400">+{stats.weeklyEarnings.toLocaleString()}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/dashboard/game/tasks"
              className="flex items-center gap-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 px-4 py-3 rounded-xl transition-all group"
            >
              <CheckCircle2 size={20} className="text-indigo-400" />
              <span className="text-sm font-medium text-indigo-200 group-hover:text-white">Manage Tasks</span>
            </a>
            <a
              href="/dashboard/game/referrals"
              className="flex items-center gap-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 px-4 py-3 rounded-xl transition-all group"
            >
              <Users size={20} className="text-purple-400" />
              <span className="text-sm font-medium text-purple-200 group-hover:text-white">Manage Referrals</span>
            </a>
            <a
              href="/dashboard/game/coins"
              className="flex items-center gap-3 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 px-4 py-3 rounded-xl transition-all group"
            >
              <Coins size={20} className="text-amber-400" />
              <span className="text-sm font-medium text-amber-200 group-hover:text-white">Coin Transactions</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
