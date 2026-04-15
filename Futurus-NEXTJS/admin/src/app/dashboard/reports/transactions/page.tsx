"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  Calendar,
  Layers,
  FileDown,
  User,
  History,
  TrendingDown,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/PremiumUI";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AdminTransactionsReportPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(
        `/admin/reports/transactions${filter ? `?filter=${filter}` : ""}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter, router]);

  const filtered = transactions.filter(
    (t) =>
      !search ||
      t.trx?.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
      t.details?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">
            Histórico de Transações
          </h1>
          <p className="text-slate-500 font-bold mt-2">
            Log completo de todas as movimentações financeiras da plataforma
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            icon={FileDown}
            className="rounded-2xl h-12 shadow-xl shadow-black/20"
          >
            Exportar Detalhado
          </Button>
        </div>
      </div>

      {/* Grid Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Volume Total",
            value: `R$${transactions.reduce((acc, t) => acc + Number(t.amount), 0).toFixed(2)}`,
            icon: Activity,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
          },
          {
            label: "Entradas (+)",
            value: `R$${transactions
              .filter((t) => t.trxType === "+")
              .reduce((acc, t) => acc + Number(t.amount), 0)
              .toFixed(2)}`,
            icon: TrendingUp,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Saídas (-)",
            value: `R$${transactions
              .filter((t) => t.trxType === "-")
              .reduce((acc, t) => acc + Number(t.amount), 0)
              .toFixed(2)}`,
            icon: TrendingDown,
            color: "text-rose-400",
            bg: "bg-rose-500/10",
          },
          {
            label: "Total Registros",
            value: transactions.length,
            icon: Layers,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="p-6 border-white/5 bg-[#141726]/40 relative overflow-hidden group shadow-xl hover:border-white/10 transition-all"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {stat.label}
                </p>
                <p className="text-2xl font-black text-white mt-1 uppercase tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform",
                  stat.bg,
                )}
              >
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-[#141726]/60 border border-white/5 p-3 rounded-[32px] flex flex-col lg:flex-row items-center gap-4 shadow-2xl backdrop-blur-md">
        <div className="relative flex-1 w-full lg:w-auto">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-indigo-500/40 placeholder:text-slate-600 transition-all font-medium"
            placeholder="Procurar por TRX, @usuario ou descrição..."
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#141726]/20 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 border-b border-white/5">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Usuário
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Transação / Info
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">
                  Montante
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">
                  Saldo Final
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">
                  Data / Hora
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/2">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="w-10 h-10 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest animate-pulse">
                      Lendo Ledger
                    </span>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="group hover:bg-white/1 transition-all"
                  >
                    <td className="px-10 py-7">
                      <Link
                        href={`/dashboard/users/${t.user?.id}`}
                        className="flex items-center gap-4 group/user"
                      >
                        <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover/user:border-indigo-500/20 transition-all">
                          <span className="text-xs font-black text-indigo-400">
                            {t.user?.username?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-black text-white group-hover/user:text-indigo-400 transition-colors uppercase tracking-tight">
                            @{t.user?.username || "Guest"}
                          </p>
                          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">
                            ID: #{t.user?.id || 0}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white tracking-tight uppercase">
                          {t.details}
                        </span>
                        <span className="text-[10px] text-slate-600 font-mono mt-1 font-black">
                          TRX: {t.trx}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <span
                        className={cn(
                          "text-base font-black tracking-tight",
                          t.trxType === "+"
                            ? "text-emerald-400"
                            : "text-rose-400",
                        )}
                      >
                        {t.trxType}
                        {Number(t.amount).toFixed(2).replace(".", ",")} R$
                      </span>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <span className="text-sm font-black text-slate-400 tracking-tight">
                        {Number(t.post_balance).toFixed(2).replace(".", ",")} R$
                      </span>
                    </td>
                    <td className="px-10 py-7 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[9px] text-slate-600 font-black uppercase mt-1 opacity-60">
                          {new Date(t.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-10 py-32 text-center opacity-30"
                  >
                    <History className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <span className="text-sm font-black text-slate-600 uppercase tracking-widest">
                      Nenhuma transação encontrada
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
