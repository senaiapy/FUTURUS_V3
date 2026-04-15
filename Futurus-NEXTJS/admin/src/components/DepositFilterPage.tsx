"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import {
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  CreditCard,
  Ban,
  Activity,
  ChevronRight,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/PremiumUI";
import { cn } from "@/lib/utils";

const statusMap: Record<
  number,
  {
    label: string;
    variant: "default" | "success" | "warning" | "danger" | "info";
    icon: any;
  }
> = {
  1: { label: "Aprovado", variant: "success", icon: CheckCircle2 },
  2: { label: "Pendente", variant: "warning", icon: Clock },
  3: { label: "Rejeitado", variant: "danger", icon: Ban },
  0: { label: "Iniciado", variant: "default", icon: Activity },
};

interface DepositFilterPageProps {
  title: string;
  subtitle: string;
  filter: string;
  emptyMessage?: string;
}

export default function DepositFilterPage({
  title,
  subtitle,
  filter,
  emptyMessage = "Nenhum depósito encontrado",
}: DepositFilterPageProps) {
  const router = useRouter();
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/admin/deposits?filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        { headers: { Authorization: `Bearer ${token}` } },
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

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            {title}
          </h1>
          <p className="text-slate-500 font-bold mt-2">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest bg-white/3 px-6 py-3 rounded-2xl border border-white/5">
            {loading ? "..." : filteredDeposits.length} depósitos
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total",
            value: `R$${deposits.reduce((acc, d) => acc + Number(d.amount || 0), 0).toFixed(2)}`,
            icon: CreditCard,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
          },
          {
            label: "Registros",
            value: deposits.length,
            icon: Activity,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Taxas",
            value: `R$${deposits.reduce((acc, d) => acc + Number(d.charge || 0), 0).toFixed(2)}`,
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
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

      {/* Search */}
      <div className="bg-[#141726]/60 border border-white/5 p-3 rounded-[32px] flex items-center gap-4 shadow-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-indigo-500/40 placeholder:text-slate-600 transition-all font-medium"
            placeholder="Buscar por código TRX, @usuario ou e-mail..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#141726]/20 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/2 border-b border-white/5">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Beneficiário
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Transação
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">
                  Valor
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
                        <span className="text-xs font-mono font-bold text-slate-300 tracking-tight">
                          {d.trx}
                        </span>
                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1.5">
                          {new Date(d.createdAt).toLocaleDateString()}{" "}
                          {new Date(d.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="px-10 py-7 text-right">
                        <span className="text-[17px] font-black text-emerald-400 tracking-tight">
                          + R${Number(d.amount).toFixed(2)}
                        </span>
                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">
                          R${Number(d.charge || 0).toFixed(2)} taxa
                        </p>
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
                          <button className="w-11 h-11 rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center">
                            <Eye className="w-4.5 h-4.5" />
                          </button>
                          {d.status === 2 && (
                            <>
                              <button
                                onClick={() => handleAction(d.id, "approve")}
                                className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 hover:text-white hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center shadow-lg shadow-emerald-600/10"
                              >
                                <CheckCircle2 className="w-4.5 h-4.5" />
                              </button>
                              <button
                                onClick={() => handleAction(d.id, "reject")}
                                className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-500 hover:text-white hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center shadow-lg shadow-rose-600/10"
                              >
                                <XCircle className="w-4.5 h-4.5" />
                              </button>
                            </>
                          )}
                          <Link
                            href={`/dashboard/users/${d.user?.id}`}
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
                        {emptyMessage}
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
