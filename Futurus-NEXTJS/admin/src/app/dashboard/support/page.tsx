"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Search,
  MessageCircle,
  Clock,
  User,
  LifeBuoy,
  BadgeInfo,
  Activity,
  MessageSquare,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/PremiumUI";
import { cn } from "@/lib/utils";

const filters = [
  { value: "all", label: "Todos" },
  { value: "open", label: "Abertos" },
  { value: "answered", label: "Respondidos" },
  { value: "closed", label: "Fechados" },
];

export default function AdminSupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<
    {
      id: number;
      ticket: string;
      subject: string;
      status: number;
      priority: number;
      updatedAt: string;
      user?: { username: string };
    }[]
  >([]);
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
      const res = await api.get(`/admin/tickets?filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filteredTickets = tickets.filter(
    (t) =>
      !search ||
      t.ticket?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.username?.toLowerCase().includes(search.toLowerCase()),
  );

  const statusMap: Record<
    number,
    {
      label: string;
      variant: "info" | "warning" | "success" | "default";
      icon: React.ComponentType<{ className?: string }>;
    }
  > = {
    1: { label: "Aberto", variant: "info", icon: Clock },
    2: { label: "Respondido", variant: "warning", icon: MessageSquare },
    3: { label: "Ag. Resposta", variant: "success", icon: CheckCircle2 },
    0: { label: "Fechado", variant: "default", icon: XCircle },
  };

  const priorityMap: Record<
    number,
    { label: string; color: string; bg: string }
  > = {
    3: { label: "Urgente", color: "text-rose-400", bg: "bg-rose-500/10" },
    2: { label: "Média", color: "text-amber-400", bg: "bg-amber-500/10" },
    1: { label: "Baixa", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header Section */}
      <div className="flex flex-col lg:row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">
            Central de Suporte
          </h1>
          <p className="text-slate-500 font-bold mt-2">
            Atendimento especializado e resolução de conflitos
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            icon={BadgeInfo}
            className="rounded-2xl h-12 shadow-xl shadow-black/20"
          >
            Configurar SLA
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Tickets",
            value: tickets.length,
            icon: MessageCircle,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
          },
          {
            label: "Abertos Hoje",
            value: tickets.filter((t) => t.status === 1).length,
            icon: Activity,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            label: "Resposta Média",
            value: "32min",
            icon: Clock,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Resolvidos",
            value: tickets.filter((t) => t.status === 0).length,
            icon: CheckCircle2,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
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
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-indigo-500/40 placeholder:text-slate-600 transition-all font-medium"
            placeholder="Buscar por #ticket, assunto ou @usuario..."
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

      {/* Tickets Feed */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-32 text-center">
            <div className="w-10 h-10 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6 shadow-xl shadow-indigo-500/20" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] animate-pulse">
              Sincronizando Atendimentos
            </span>
          </div>
        ) : filteredTickets.length > 0 ? (
          filteredTickets.map((t) => {
            const s = statusMap[t.status] || statusMap[0];
            const p = priorityMap[t.priority] || {
              label: "Normal",
              color: "text-slate-500",
              bg: "bg-white/5",
            };
            const StatusIcon = s.icon;

            return (
              <Card
                key={t.id}
                className="p-8 border-white/5 bg-[#141726]/20 hover:bg-[#141726]/40 hover:border-indigo-500/20 transition-all group rounded-[40px] shadow-2xl relative overflow-hidden cursor-pointer"
                onClick={() => router.push(`/dashboard/support/${t.ticket}`)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex items-center gap-8 min-w-0 flex-1">
                    <div className="w-20 h-20 rounded-[32px] bg-linear-to-br from-indigo-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center relative shrink-0 group-hover:scale-105 transition-transform overflow-hidden shadow-2xl">
                      <LifeBuoy className="w-9 h-9 text-indigo-400 opacity-60" />
                      <div className="absolute top-2 right-2">
                        <StatusIcon
                          className={cn(
                            "w-4 h-4",
                            s.variant === "info"
                              ? "text-indigo-400 animate-pulse"
                              : s.variant === "warning"
                                ? "text-amber-400"
                                : "text-slate-600",
                          )}
                        />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-xs font-mono font-black text-indigo-400 uppercase tracking-widest">
                          #{t.ticket}
                        </span>
                        <Badge
                          variant={s.variant}
                          className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider"
                        >
                          {s.label}
                        </Badge>
                        <div
                          className={cn(
                            "px-3 py-1 rounded-lg flex items-center gap-1.5",
                            p.bg,
                          )}
                        >
                          <div
                            className={cn(
                              "w-1 h-1 rounded-full",
                              p.color.replace("text", "bg"),
                            )}
                          />
                          <span
                            className={cn(
                              "text-[9px] font-black uppercase tracking-widest",
                              p.color,
                            )}
                          >
                            {p.label}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-black text-white group-hover:text-indigo-200 transition-colors uppercase tracking-tight truncate max-w-[80%]">
                        {t.subject}
                      </h3>

                      <div className="flex items-center flex-wrap gap-x-6 gap-y-2 mt-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <div className="flex items-center gap-2 hover:text-white transition-colors">
                          <User className="w-4 h-4 text-indigo-500" /> @
                          {t.user?.username || "Guest"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-800" />{" "}
                          Atualizado há{" "}
                          {new Date(t.updatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-10 shrink-0">
                    <div className="lg:text-right">
                      <p className="text-sm font-black text-white">
                        {new Date(t.updatedAt).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-slate-600 font-bold mt-1 uppercase tracking-widest">
                        Data do Ticket
                      </p>
                    </div>
                    <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-indigo-600/20 transition-all">
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <MessageSquare className="absolute -bottom-8 -left-8 w-40 h-40 text-white opacity-[0.01] group-hover:scale-110 transition-transform" />
              </Card>
            );
          })
        ) : (
          <div className="py-32 text-center rounded-[40px] border border-white/5 bg-[#141726]/10 flex flex-col items-center gap-5 opacity-30">
            <MessageCircle className="w-20 h-20 text-slate-700" />
            <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">
              Nenhum ticket pendente de suporte
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
