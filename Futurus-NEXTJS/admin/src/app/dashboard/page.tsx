"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Users,
  BarChart3,
  ShoppingCart,
  PiggyBank,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Activity,
  Layers,
  ChevronRight,
  Settings2,
  Smartphone,
  Wallet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import CronModal from "@/components/CronModal";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCronModal, setShowCronModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
        // Fallback for demo if API fails
        setStats({
          totalUsers: 3,
          activeUsers: 3,
          emailUnverified: 0,
          mobileUnverified: 0,
          totalDeposited: 0,
          pendingDeposits: 0,
          rejectedDeposits: 0,
          depositCharge: 0,
          totalWithdrawn: 0,
          pendingWithdrawals: 0,
          rejectedWithdrawals: 0,
          withdrawalCharge: 0,
          totalMarkets: 8,
          liveMarkets: 8,
          resolvedMarkets: 0,
          upcomingMarkets: 0,
          todayProfit: 0,
          weekProfit: 0,
          monthProfit: 0,
          allTimeProfit: 0,
          todayPurchases: 0,
          weekPurchases: 0,
          monthPurchases: 0,
          allTimePurchases: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [router]);

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

  const profitData = [
    { name: "Feb 01", profit: 2.1, purchases: 3.2 },
    { name: "Feb 05", profit: 2.5, purchases: 3.8 },
    { name: "Feb 10", profit: 2.8, purchases: 4.2 },
    { name: "Feb 15", profit: 3.2, purchases: 4.5 },
    { name: "Feb 20", profit: 3.1, purchases: 4.1 },
    { name: "Feb 25", profit: 3.8, purchases: 4.9 },
    { name: "Mar 02", profit: 4.2, purchases: 5.2 },
  ];

  const marketStatusData = [
    { name: "Live", value: 8, color: "#6366f1" },
    { name: "Resolved", value: 0, color: "#10b981" },
    { name: "Pending", value: 0, color: "#f59e0b" },
    { name: "Cancelled", value: 0, color: "#ef4444" },
  ];

  const activeUsersData = [
    { name: "Tue", users: 1.2 },
    { name: "Wed", users: 1.5 },
    { name: "Thu", users: 1.8 },
    { name: "Fri", users: 1.6 },
    { name: "Sat", users: 1.9 },
    { name: "Sun", users: 2.1 },
    { name: "Mon", users: 2.3 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <CronModal
        isOpen={showCronModal}
        onClose={() => setShowCronModal(false)}
      />

      {/* Top Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Painel
          </h1>
          <p className="text-slate-500 font-bold mt-2">
            Visão geral do sistema e estatísticas críticas
          </p>
        </div>
        <button
          onClick={() => setShowCronModal(true)}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95 text-sm uppercase tracking-wider"
        >
          <Settings2 className="w-4 h-4" />
          Configuração do Cron
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Users",
            value: stats?.totalUsers || 0,
            icon: Users,
            color: "indigo",
          },
          {
            label: "Active Users",
            value: stats?.activeUsers || 0,
            icon: Activity,
            color: "emerald",
          },
          {
            label: "Email Unverified Users",
            value: stats?.emailUnverified || 0,
            icon: XCircle,
            color: "rose",
          },
          {
            label: "Mobile Unverified Users",
            value: stats?.mobileUnverified || 0,
            icon: Smartphone,
            color: "amber",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-[#141726]/40 border border-white/5 p-6 rounded-[32px] hover:border-white/10 transition-all group flex items-center justify-between shadow-2xl shadow-black/20"
          >
            <div className="flex items-center gap-5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-${item.color}-500/10 border border-${item.color}-500/20 group-hover:scale-110`}
              >
                <item.icon
                  className={`w-6 h-6 text-${item.color === "emerald" ? "emerald-400" : item.color === "rose" ? "rose-400" : item.color === "amber" ? "amber-400" : "indigo-400"}`}
                />
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
                  {item.label}
                </p>
                <p className="text-3xl font-black text-white">{item.value}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </div>
        ))}
      </div>

      {/* Deposits & Withdrawals Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deposits Group */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">
            Depósitos
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#141726]/40 border border-white/5 p-6 rounded-[28px] group hover:border-emerald-500/20 transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <PiggyBank className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-lg font-black text-white leading-tight">
                    R${Number(stats?.totalDeposited || 0).toFixed(2)} Real
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                    Total Depositado
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </div>
            <div className="bg-[#141726]/40 border border-white/5 p-6 rounded-[28px] group hover:border-indigo-500/20 transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Clock className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-lg font-black text-white leading-tight">
                    {stats?.pendingDeposits || 0}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                    Depósitos Pendentes
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </div>
            <div className="bg-[#141726]/40 border border-white/5 p-6 rounded-[28px] group hover:border-rose-500/20 transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                  <XCircle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <p className="text-lg font-black text-white leading-tight">
                    {stats?.rejectedDeposits || 0}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                    Depósitos Rejeitados
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </div>
            <div className="bg-[#141726]/40 border border-white/5 p-6 rounded-[28px] group hover:border-indigo-500/20 transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <PercentIcon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-lg font-black text-white leading-tight">
                    R${Number(stats?.depositCharge || 0).toFixed(2)} Real
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                    Taxa de Depósito
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </div>
          </div>
        </div>

        {/* Withdrawals Group */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">
            Retiradas
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#141726]/40 border border-white/5 p-6 rounded-[28px] group hover:border-emerald-500/20 transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-lg font-black text-white leading-tight">
                    R${Number(stats?.totalWithdrawn || 0).toFixed(2)} Real
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                    Total Retirado
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </div>
            <div className="bg-[#141726]/40 border border-white/5 p-6 rounded-[28px] group hover:border-indigo-500/20 transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Clock className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-lg font-black text-white leading-tight">
                    {stats?.pendingWithdrawals || 0}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                    Retiradas Pendentes
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </div>
            <div className="bg-[#141726]/40 border border-white/5 p-6 rounded-[28px] group hover:border-rose-500/20 transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                  <XCircle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <p className="text-lg font-black text-white leading-tight">
                    {stats?.rejectedWithdrawals || 0}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                    Retiradas Rejeitadas
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </div>
            <div className="bg-[#141726]/40 border border-white/5 p-6 rounded-[28px] group hover:border-indigo-500/20 transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <PercentIcon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-lg font-black text-white leading-tight">
                    R${Number(stats?.withdrawalCharge || 0).toFixed(2)} Real
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                    Taxa de Retirada
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Status Cards (12 items) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Today's Profit/Loss",
            value: `R$${Number(stats?.todayProfit || 0).toFixed(2)} Real`,
            icon: Calendar,
          },
          {
            label: "This Week's Profit/Loss",
            value: `R$${Number(stats?.weekProfit || 0).toFixed(2)} Real`,
            icon: Calendar,
          },
          {
            label: "This Month's Profit/Loss",
            value: `R$${Number(stats?.monthProfit || 0).toFixed(2)} Real`,
            icon: Calendar,
          },
          {
            label: "All Time Profit/Loss",
            value: `R$${Number(stats?.allTimeProfit || 0).toFixed(2)} Real`,
            icon: Layers,
          },
          {
            label: "Today's Purchases",
            value: `R$${Number(stats?.todayPurchases || 0).toFixed(2)} Real`,
            icon: ShoppingCart,
          },
          {
            label: "This Week's Purchases",
            value: `R$${Number(stats?.weekPurchases || 0).toFixed(2)} Real`,
            icon: ShoppingCart,
          },
          {
            label: "This Month's Purchases",
            value: `R$${Number(stats?.monthPurchases || 0).toFixed(2)} Real`,
            icon: ShoppingCart,
          },
          {
            label: "All Time Purchases",
            value: `R$${Number(stats?.allTimePurchases || 0).toFixed(2)} Real`,
            icon: Layers,
          },
          {
            label: "Total Markets",
            value: stats?.totalMarkets || 0,
            icon: BarChart3,
          },
          {
            label: "Live Markets",
            value: stats?.liveMarkets || 0,
            icon: Activity,
          },
          {
            label: "Resolved Markets",
            value: stats?.resolvedMarkets || 0,
            icon: CheckCircle2,
          },
          {
            label: "Upcoming Markets",
            value: stats?.upcomingMarkets || 0,
            icon: Clock,
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-[#141726]/40 border border-white/5 p-6 rounded-[28px] relative overflow-hidden group hover:border-indigo-500/30 transition-all"
          >
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                VER TODOS
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <item.icon className="w-8 h-8 text-indigo-500/40" />
              </div>
              <div>
                <p className="text-xl font-black text-white">{item.value}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-tight">
                  {item.label}
                </p>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <item.icon className="w-16 h-16 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Area Chart */}
        <div className="xl:col-span-2 bg-[#141726]/40 border border-white/5 p-8 rounded-[32px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-white tracking-tight">
              Profit vs Purchases (Last 30 days)
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-500">
                  Purchases
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[10px] font-bold text-slate-500">
                  Profit
                </span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profitData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorPurchases"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#ffffff05"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1d2e",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ fontSize: "10px", fontWeight: 800 }}
                />
                <Area
                  type="monotone"
                  dataKey="purchases"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorPurchases)"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Status Breakdown */}
        <div className="bg-[#141726]/40 border border-white/5 p-8 rounded-[32px] flex flex-col">
          <h3 className="font-black text-white tracking-tight mb-8">
            Market Status Breakdown
          </h3>
          <div className="flex-1 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={marketStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {marketStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-3xl font-black text-white">
                {stats?.totalMarkets || 8}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                TOTAL
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {marketStatusData.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-[11px] font-bold text-slate-400">
                  {s.name}
                </span>
                <span className="ml-auto text-[11px] font-black text-white">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second row of charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Users Chart */}
        <div className="bg-[#141726]/40 border border-white/5 p-8 rounded-[32px]">
          <h3 className="font-black text-white tracking-tight mb-8">
            Active Users (Last 7 days)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeUsersData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#ffffff05"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1d2e",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Login by Browser/Device simplified */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "By Browser",
              data: [
                { name: "Chrome", val: 65 },
                { name: "Safari", val: 20 },
                { name: "Firefox", val: 15 },
              ],
              color: "#6366f1",
            },
            {
              title: "By OS",
              data: [
                { name: "Windows", val: 50 },
                { name: "macOS", val: 30 },
                { name: "Linux", val: 20 },
              ],
              color: "#10b981",
            },
            {
              title: "By Country",
              data: [
                { name: "Brazil", val: 80 },
                { name: "USA", val: 10 },
                { name: "Other", val: 10 },
              ],
              color: "#f59e0b",
            },
          ].map((chart, idx) => (
            <div
              key={idx}
              className="bg-[#141726]/40 border border-white/5 p-6 rounded-[28px] flex flex-col items-center"
            >
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6">
                {chart.title}
              </h4>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chart.data}
                      innerRadius={35}
                      outerRadius={50}
                      dataKey="val"
                    >
                      {chart.data.map((e, i) => (
                        <Cell
                          key={i}
                          fill={
                            i === 0
                              ? chart.color
                              : `${chart.color}${20 + i * 30}`
                          }
                          stroke="none"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-1 w-full">
                {chart.data.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-[10px] font-bold"
                  >
                    <span className="text-slate-500">{d.name}</span>
                    <span className="text-white">{d.val}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PercentIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}
