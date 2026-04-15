"use client";

import { useTranslations } from "next-intl";
import {
  Trophy,
  Medal,
  TrendingUp,
  Users,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function LeaderboardPage() {
  const t = useTranslations();
  const [tab, setTab] = useState<"traders" | "markets">("traders");
  const [timeframe, setTimeframe] = useState<"all" | "week" | "month">("all");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users/leaderboard?period=${timeframe}&limit=100`);
      if (response.data.success) {
        // Map API data to component format
        const mappedData = response.data.data.map((user: any) => ({
          id: user.userId,
          rank: user.rank,
          username: user.username,
          totalProfit: parseFloat(user.totalProfit).toFixed(2),
          successRate: user.totalTrades > 0
            ? ((user.totalProfit / user.totalShares) * 100).toFixed(1)
            : 0,
          totalTrades: user.totalTrades,
          avatar: user.username.substring(0, 2).toUpperCase(),
        }));
        setLeaderboard(mappedData);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="w-6 h-6 text-amber-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <main className="flex-1 font-maven">
        <section className="py-24">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-16">
              <Trophy className="w-20 h-20 text-base mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t("Leaderboard")}
              </h1>
              <p className="text-slate-400 text-lg">
                {t("See who's leading the markets")}
              </p>
            </div>

            {/* Tabs */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="flex gap-2 p-2 glass-card rounded-2xl">
                <button
                  onClick={() => setTab("traders")}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                    tab === "traders" ? "bg-base text-white" : "text-slate-400 hover:bg-white/5"
                  }`}
                >
                  {t("Top Traders")}
                </button>
                <button
                  onClick={() => setTab("markets")}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                    tab === "markets" ? "bg-base text-white" : "text-slate-400 hover:bg-white/5"
                  }`}
                >
                  {t("Popular Markets")}
                </button>
              </div>
            </div>

            {/* Timeframe Filter */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="flex gap-2 p-2 glass-card rounded-2xl">
                {["all", "week", "month"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf as any)}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all capitalize ${
                      timeframe === tf ? "bg-base text-white" : "text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    {t(tf)}
                  </button>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            {loading ? (
              <div className="max-w-4xl mx-auto glass-card rounded-2xl p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-base border-t-transparent"></div>
                <p className="text-slate-400 mt-6">{t("Loading...")}</p>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-4">
                {leaderboard.map((item, idx) => (
                  <div
                    key={item.id}
                    className="glass-card rounded-2xl p-6 flex items-center gap-6 hover:border-white/10 transition-all"
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(item.rank) || (
                        <span className="text-2xl font-bold text-slate-600">
                          {item.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                      {item.avatar}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {item.username}
                      </h3>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span>{t("Profit")}: {item.totalProfit}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Users className="w-4 h-4 text-blue-400" />
                          <span>{t("Trades")}: {item.totalTrades}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <span className="text-emerald-400 font-semibold">{item.successRate}%</span>
                          <span>{t("Success Rate")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <button className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
