"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Users,
  TrendingUp,
  CreditCard,
  Clock,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
} from "lucide-react";
import { Decimal } from "decimal.js";

export default function AdminDashboardPage() {
  const t = useTranslations();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="w-10 h-10 border-4 border-base/20 border-t-base rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: t("Total Users"),
      value: stats?.totalUsers,
      icon: Users,
      color: "indigo",
    },
    {
      label: t("Active Markets"),
      value: stats?.liveMarkets,
      icon: Activity,
      color: "emerald",
    },
    {
      label: t("Total Volume"),
      value: `$${new Decimal(stats?.totalVolume || 0).toFixed(2)}`,
      icon: BarChart2,
      color: "amber",
    },
    {
      label: t("Total Deposits"),
      value: `$${new Decimal(stats?.totalDeposits || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: "blue",
    },
    {
      label: t("Pending Withdrawals"),
      value: stats?.pendingWithdrawals,
      icon: Clock,
      color: "rose",
    },
    {
      label: t("Support Tickets"),
      value: stats?.pendingTickets,
      icon: Clock,
      color: "purple",
    },
  ];

  return (
    <div className="space-y-12 font-maven">
      <div>
        <h1 className="text-3xl font-black text-white">
          {t("System Overview")}
        </h1>
        <p className="text-slate-400 mt-2">
          Real-time performance metrics and platform analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="glass-card p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-base/30 transition-all group overflow-hidden relative"
          >
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div
                className={`p-3 rounded-2xl bg-${stat.color}-500/10 border border-${stat.color}-500/20`}
              >
                <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                <ArrowUpRight className="w-3 h-3" />
                8.2%
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <h3 className="text-3xl font-black text-white">{stat.value}</h3>
            </div>

            {/* Background design elements */}
            <div
              className={`absolute -bottom-8 -right-8 w-24 h-24 bg-${stat.color}-500/5 rounded-full blur-3xl transition-all group-hover:scale-150`}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-3xl bg-white/5 border border-white/5 min-h-[400px]">
          <div className="flex flex-col gap-1 mb-8">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider">
              {t("Market Performance")}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Activity trends over the last 30 days
            </p>
          </div>
          <div className="h-[300px] flex items-end justify-between gap-2 px-2">
            {/* Dummy Chart */}
            {[40, 65, 45, 90, 55, 75, 50, 85, 95, 60, 45, 80].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-base to-base/40 rounded-t-lg transition-all hover:opacity-80 group relative"
                style={{ height: `${h}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {h}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl bg-white/5 border border-white/5 min-h-[400px]">
          <div className="flex flex-col gap-1 mb-8">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider">
              {t("Recent Activity")}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Latest user transactions and trades
            </p>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center font-bold text-base border border-base/20">
                    U
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">johndoe88</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black">
                      Purchase Option
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white">$150.00</p>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">
                    SUCCESS
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
