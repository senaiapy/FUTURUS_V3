"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  TrendingDown,
  TrendingUp,
  Wallet,
  Clock,
  ArrowDownLeft,
  CreditCard,
  Ban,
  Activity,
  Layers,
  ArrowUpRight,
  ChevronRight,
  FileDown,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/PremiumUI";
import { cn } from "@/lib/utils";

const filters = [
  { value: "", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "approved", label: "Aprovados" },
  { value: "rejected", label: "Rejeitados" },
];

export default function AdminDepositsPage() {
  const router = useRouter();
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(
        `/admin/deposits${filter ? `?filter=${filter}` : ""}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setDeposits(res.data);
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
        `/admin/deposits/${id}/${action}`,
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

  const filteredDeposits = deposits.filter(
    (d) =>
      !search ||
      d.trx?.toLowerCase().includes(search.toLowerCase()) ||
      d.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
      d.user?.email?.toLowerCase().includes(search.toLowerCase()),
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
            Gestão de Depósitos
          </h1>
          <p className="text-slate-500 font-bold mt-2">
            Monitore e valide aportes financeiros de usuários
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            icon={FileDown}
            className="rounded-2xl px-6 h-12 shadow-xl shadow-black/20"
          >
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Aprovado",
            value: `R$${deposits.reduce((acc, d) => acc + (d.status === 1 ? Number(d.amount) : 0), 0).toFixed(2)}`,
            icon: ArrowDownLeft,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Pendentes",
            value: deposits.filter((d) => d.status === 2).length,
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            label: "Ticket Médio",
            value: `R$${(deposits.length ? deposits.reduce((acc, d) => acc + Number(d.amount), 0) / deposits.length : 0).toFixed(2)}`,
            icon: Activity,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
          },
          {
            label: "Total Taxas",
            value: `R$${deposits.reduce((acc, d) => acc + Number(d.charge || 0), 0).toFixed(2)}`,
            icon: Layers,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="p-6 border-white/5 bg-[#141726]/40 hover:border-white/10 transition-all group overflow-hidden relative"
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
      <div className="bg-[#141726]/60 border border-white/5 p-3 rounded-[32px] flex flex-col lg:flex-row items-center gap-4 shadow-2xl">
        <div className="relative flex-1 w-full lg:w-auto">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-indigo-500/40 placeholder:text-slate-600 transition-all font-medium"
            placeholder="Buscar por código TRX, @usuario ou e-mail..."
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
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deposits Table */}
      <div className="bg-[#141726]/20 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/2 border-b border-white/5">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Beneficiário
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Transação / Origem
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">
                  Valor Real
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">
                  Status
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/2">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin shadow-xl shadow-indigo-500/20" />
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] animate-pulse">
                        Sincronizando Depósitos
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredDeposits.length > 0 ? (
                filteredDeposits.map((d) => {
                  const s = statusMap[d.status] || statusMap[0];
                  const Icon = s.icon;
                  return (
                    <tr
                      key={d.id}
                      className="group hover:bg-white/1 transition-all cursor-default"
                    >
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                            <span className="text-lg font-black text-indigo-400">
                              {d.user?.username?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[15px] font-black text-white group-hover:text-indigo-400 transition-colors">
                              @{d.user?.username || "Guest"}
                            </p>
                            <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">
                              ID: #{d.user?.id || 0}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-bold text-slate-300 tracking-tight">
                            {d.trx}
                          </span>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">
                              {new Date(d.createdAt).toLocaleDateString()}{" "}
                              {new Date(d.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-7 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-[17px] font-black text-emerald-400 tracking-tight">
                            + R${Number(d.amount).toFixed(2)}
                          </span>
                          <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">
                            R${Number(d.charge || 0).toFixed(2)} taxa incluída
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-7 text-center">
                        <Badge
                          variant={s.variant}
                          className="px-4 py-1.5 rounded-xl flex items-center gap-2 mx-auto w-fit"
                        >
                          <Icon className="w-3 h-3" />
                          <span className="text-[10px] font-black uppercase tracking-wider">
                            {s.label}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-10 py-7">
                        <div className="flex items-center justify-center gap-2.5">
                          <button
                            title="Ver Detalhes"
                            className="w-11 h-11 rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center"
                          >
                            <Eye className="w-4.5 h-4.5" />
                          </button>
                          {d.status === 2 && (
                            <>
                              <button
                                title="Aprovar Depósito"
                                onClick={() => handleAction(d.id, "approve")}
                                className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 hover:text-white hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center shadow-lg shadow-emerald-600/10"
                              >
                                <CheckCircle2 className="w-4.5 h-4.5" />
                              </button>
                              <button
                                title="Rejeitar Depósito"
                                onClick={() => handleAction(d.id, "reject")}
                                className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-500 hover:text-white hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center shadow-lg shadow-rose-600/10"
                              >
                                <XCircle className="w-4.5 h-4.5" />
                              </button>
                            </>
                          )}
                          <Link
                            href={`/dashboard/users/${d.user?.id}`}
                            title="Ver Usuário"
                            className="w-11 h-11 rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-indigo-600 transition-all flex items-center justify-center"
                          >
                            <ChevronRight className="w-4.5 h-4.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <CreditCard className="w-16 h-16 text-slate-500" />
                      <p className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">
                        Nenhum depósito registrado
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
  );
}
