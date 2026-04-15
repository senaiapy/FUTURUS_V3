"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import {
  Users,
  Search,
  Ban,
  CheckCircle2,
  ChevronRight,
  Filter,
  UserCheck,
  UserX,
  Clock,
  Wallet,
  Activity,
  UserPlus,
  ShieldCheck,
  Mail,
  Smartphone,
  CreditCard,
  MoreVertical,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/PremiumUI";
import { cn } from "@/lib/utils";

const filters = [
  { value: "", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "banned", label: "Banidos" },
  { value: "email-verified", label: "E-mail OK" },
  { value: "kyc-pending", label: "KYC Pendente" },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await api.get(
          `/admin/users${filter ? `?filter=${filter}` : ""}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [filter, router]);

  const filteredUsers = users.filter(
    (u) =>
      !search ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.firstname?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-10 pb-12">
      {/* Header Section */}
      <div className="flex flex-col lg:row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Gestão de Usuários
          </h1>
          <p className="text-slate-500 font-bold mt-2">
            Administre membros, valide identidades e gerencie saldos
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            icon={Filter}
            className="rounded-2xl px-6 h-12 shadow-xl shadow-black/20"
          >
            Filtros Avançados
          </Button>
          <Button
            variant="primary"
            icon={UserPlus}
            className="rounded-2xl px-8 h-12 bg-indigo-600 shadow-xl shadow-indigo-600/20"
          >
            Notificar Todos
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total de Usuários",
            value: users.length,
            icon: Users,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
          },
          {
            label: "Usuários Ativos",
            value: users.filter((u) => u.status === 1).length,
            icon: Activity,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "KYC Pendente",
            value: users.filter((u) => u.kv === 2).length,
            icon: ShieldCheck,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            label: "Contas Banidas",
            value: users.filter((u) => u.status === 0).length,
            icon: Ban,
            color: "text-rose-400",
            bg: "bg-rose-500/10",
          },
        ].map((item, idx) => (
          <Card
            key={idx}
            className="p-6 border-white/5 bg-[#141726]/40 hover:border-white/10 transition-all group overflow-hidden relative"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {item.label}
                </p>
                <p className="text-3xl font-black text-white mt-1 uppercase tracking-tight">
                  {item.value}
                </p>
              </div>
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform",
                  item.bg,
                )}
              >
                <item.icon className={cn("w-6 h-6", item.color)} />
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
            placeholder="Pesquisar por nome, username, e-mail ou documento..."
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

      {/* Users Table */}
      <div className="bg-[#141726]/20 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/2 border-b border-white/5">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Usuário / Perfil
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Verificações
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">
                  Saldo
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
                        Carregando Usuários
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="group hover:bg-white/1 transition-all cursor-default"
                  >
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform shrink-0">
                          <span className="text-lg font-black text-indigo-400">
                            {user.firstname?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15px] font-black text-white group-hover:text-indigo-400 transition-colors">
                            {user.firstname} {user.lastname}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 opacity-60">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                              @{user.username}
                            </span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                            <span className="text-[10px] text-slate-500 font-bold uppercase">
                              ID: #{user.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-3">
                        <div
                          title="Email"
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center border",
                            user.ev
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                              : "bg-white/5 border-white/5 text-slate-600",
                          )}
                        >
                          <Mail className="w-4 h-4" />
                        </div>
                        <div
                          title="Mobile"
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center border",
                            user.sv
                              ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
                              : "bg-white/5 border-white/5 text-slate-600",
                          )}
                        >
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div
                          title="KYC"
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center border",
                            user.kv === 1
                              ? "bg-blue-500/10 border-blue-500/20 text-blue-500"
                              : user.kv === 2
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse"
                                : "bg-white/5 border-white/5 text-slate-600",
                          )}
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[17px] font-black text-emerald-400 tracking-tight">
                          R${Number(user.balance || 0).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <CreditCard className="w-3 h-3 text-slate-600" />
                          <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">
                            Balanço Principal
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7 text-center">
                      <Badge
                        variant={user.status === 1 ? "success" : "danger"}
                        className="px-4 py-1.5 rounded-xl"
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          {user.status === 1 ? "Ativo" : "Banido"}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center justify-center gap-2.5">
                        <Link
                          href={`/dashboard/users/${user.id}`}
                          title="Detalhes do Usuário"
                          className="w-11 h-11 rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-indigo-600/80 hover:shadow-lg hover:shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center"
                        >
                          <Activity className="w-4.5 h-4.5" />
                        </Link>
                        <button
                          title={
                            user.status === 1
                              ? "Banir Usuário"
                              : "Ativar Usuário"
                          }
                          className={cn(
                            "w-11 h-11 rounded-2xl bg-white/5 transition-all active:scale-95 flex items-center justify-center",
                            user.status === 1
                              ? "text-rose-500/60 hover:text-white hover:bg-rose-600 hover:shadow-rose-600/20 shadow-lg"
                              : "text-emerald-500/60 hover:text-white hover:bg-emerald-600 hover:shadow-emerald-600/20 shadow-lg",
                          )}
                        >
                          {user.status === 1 ? (
                            <UserX className="w-4.5 h-4.5" />
                          ) : (
                            <UserCheck className="w-4.5 h-4.5" />
                          )}
                        </button>
                        <button
                          title="Mais Opções"
                          className="w-11 h-11 rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center"
                        >
                          <MoreVertical className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <Users className="w-16 h-16 text-slate-500" />
                      <p className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">
                        Nenhum usuário encontrado
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
