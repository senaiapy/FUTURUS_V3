"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Wallet,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowDownRight,
  Eye,
  Building2,
  User,
  PiggyBank,
  ArrowUpRight,
  ChevronRight,
  FileDown,
  Activity,
  History,
  AlertTriangle,
  Ban,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/PremiumUI";
import { cn } from "@/lib/utils";
import Link from "next/link";

const filters = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "approved", label: "Aprovados" },
  { value: "rejected", label: "Rejeitados" },
];

export default function AdminWithdrawalsPage() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/admin/withdrawals?filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWithdrawals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter, router]);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    const token = localStorage.getItem("admin_token");
    try {
      await api.post(
        `/admin/withdrawals/${id}/${action}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredWithdrawals = withdrawals.filter(
    (w) =>
      !search ||
      w.trx?.toLowerCase().includes(search.toLowerCase()) ||
      w.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
      w.user?.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const statusMap: any = {
    1: { label: "Aprovado", variant: "success", icon: CheckCircle2 },
    2: { label: "Pendente", variant: "warning", icon: Clock },
    3: { label: "Rejeitado", variant: "danger", icon: Ban },
    0: { label: "Iniciado", variant: "default", icon: Activity },
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header Section */}
      <div className="flex flex-col lg:row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Gestão de Saques
          </h1>
          <p className="text-slate-500 font-bold mt-2">
            Valide e processe retiradas de fundos dos usuários
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            icon={FileDown}
            className="rounded-2xl px-6 h-12 shadow-xl shadow-black/20"
          >
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Pago",
            value: `R$${withdrawals.reduce((acc, w) => acc + (w.status === 1 ? Number(w.amount) : 0), 0).toFixed(2)}`,
            icon: ArrowUpRight,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Pendentes",
            value: withdrawals.filter((w) => w.status === 2).length,
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            label: "Taxas Retidas",
            value: `R$${withdrawals.reduce((acc, w) => acc + Number(w.charge || 0), 0).toFixed(2)}`,
            icon: Activity,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
          },
          {
            label: "Cancelados",
            value: withdrawals.filter((w) => w.status === 3).length,
            icon: AlertTriangle,
            color: "text-rose-400",
            bg: "bg-rose-500/10",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="p-6 border-white/5 bg-[#141726]/40 hover:border-white/10 transition-all group overflow-hidden relative shadow-xl"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {stat.label}
                </p>
                <p className="text-2xl font-black text-white mt-1 tracking-tight uppercase">
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

      {/* Filters Bar */}
      <div className="bg-[#141726]/60 border border-white/5 p-3 rounded-[32px] flex flex-col lg:flex-row items-center gap-4 shadow-2xl backdrop-blur-md">
        <div className="relative flex-1 w-full lg:w-auto">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-amber-500/40 placeholder:text-slate-600 transition-all font-medium"
            placeholder="Buscar por código TRX, @usuario ou documento..."
          />
        </div>
        <div className="flex bg-black/30 p-1.5 rounded-2xl border border-white/5 w-full lg:w-auto overflow-x-auto scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                filter === f.value
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Withdrawals List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-32 text-center">
            <div className="w-10 h-10 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin mx-auto mb-6 shadow-xl shadow-amber-500/20" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] animate-pulse">
              Sincronizando Saques
            </span>
          </div>
        ) : filteredWithdrawals.length > 0 ? (
          filteredWithdrawals.map((w) => {
            const s = statusMap[w.status] || statusMap[0];
            const StatusIcon = s.icon;
            return (
              <Card
                key={w.id}
                className="p-8 border-white/5 bg-[#141726]/20 hover:bg-[#141726]/40 hover:border-amber-500/20 transition-all group flex flex-col lg:flex-row lg:items-center justify-between gap-8 rounded-[40px] shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center gap-8 min-w-0">
                  <div className="w-20 h-20 rounded-[32px] bg-linear-to-br from-amber-500/10 to-orange-500/10 border border-white/5 flex items-center justify-center relative shrink-0 group-hover:scale-105 transition-transform overflow-hidden shadow-2xl">
                    <Wallet className="w-9 h-9 text-amber-500 opacity-60" />
                    <div className="absolute top-2 right-2">
                      <StatusIcon
                        className={cn(
                          "w-4 h-4",
                          w.status === 1
                            ? "text-emerald-400"
                            : w.status === 2
                              ? "text-amber-400 animate-pulse"
                              : "text-rose-400",
                        )}
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors tracking-tight">
                        R${Number(w.amount).toFixed(2).replace(".", ",")}
                      </span>
                      <Badge
                        variant={s.variant}
                        className="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider"
                      >
                        {s.label}
                      </Badge>
                    </div>
                    <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <Link
                        href={`/dashboard/users/${w.user?.id}`}
                        className="flex items-center gap-2 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4 text-indigo-400" /> @
                        {w.user?.username || "Guest"}
                      </Link>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-700" />{" "}
                        {new Date(w.createdAt).toLocaleString()}
                      </span>
                      <span className="text-slate-700 font-mono tracking-tighter">
                        TRX: {w.trx}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:items-end gap-5 shrink-0">
                  <div className="lg:text-right">
                    <p className="text-xs font-black text-slate-300 flex items-center lg:justify-end gap-2.5">
                      <Building2 className="w-4.5 h-4.5 text-amber-500/40" />{" "}
                      {w.method?.name || "Transferência Bancária / PIX"}
                    </p>
                    {w.user?.email && (
                      <p className="text-[10px] text-slate-600 font-bold mt-1 uppercase tracking-tighter">
                        {w.user.email}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="w-12 h-12 rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center">
                      <Eye className="w-5 h-5" />
                    </button>
                    {w.status === 2 && (
                      <>
                        <button
                          onClick={() => handleAction(w.id, "reject")}
                          className="px-6 h-12 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-rose-900/10 active:scale-95 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                        >
                          <XCircle className="w-5 h-5" /> REJEITAR
                        </button>
                        <button
                          onClick={() => handleAction(w.id, "approve")}
                          className="px-6 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all shadow-xl shadow-emerald-900/10 active:scale-95 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                        >
                          <CheckCircle2 className="w-5 h-5" /> APROVAR
                        </button>
                      </>
                    )}
                    <Link
                      href={`/dashboard/users/${w.user?.id}`}
                      className="w-12 h-12 rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-indigo-600 transition-all flex items-center justify-center"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="py-32 text-center rounded-[40px] border border-white/5 bg-[#141726]/10 flex flex-col items-center gap-5 opacity-30">
            <PiggyBank className="w-20 h-20 text-slate-700" />
            <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">
              Nenhuma solicitação encontrada
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
