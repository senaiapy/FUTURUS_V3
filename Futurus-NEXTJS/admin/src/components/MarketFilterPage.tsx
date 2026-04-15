"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import {
  BarChart3,
  Search,
  Eye,
  Calendar,
  Archive,
  TrendingUp,
  MoreVertical,
  Activity,
  CheckCircle2,
  Clock,
  Ban,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/PremiumUI";
import { cn } from "@/lib/utils";

const statusMap: Record<
  number,
  {
    label: string;
    variant: "default" | "success" | "warning" | "danger" | "info";
    icon: any;
  }
> = {
  0: { label: "Rascunho", variant: "default", icon: Archive },
  1: { label: "Ativo", variant: "success", icon: Activity },
  2: { label: "Pendente", variant: "warning", icon: Clock },
  3: { label: "Resolvido", variant: "info", icon: CheckCircle2 },
  4: { label: "Cancelado", variant: "danger", icon: Ban },
  9: { label: "Desativado", variant: "danger", icon: AlertTriangle },
};

interface MarketFilterPageProps {
  title: string;
  subtitle: string;
  filter: string;
  emptyMessage?: string;
}

export default function MarketFilterPage({
  title,
  subtitle,
  filter,
  emptyMessage = "Nenhum mercado encontrado",
}: MarketFilterPageProps) {
  const router = useRouter();
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await api.get(`/admin/markets?filter=${filter}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMarkets(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter, router]);

  const filteredMarkets = markets.filter(
    (m) =>
      m.question?.toLowerCase().includes(search.toLowerCase()) ||
      m.category?.name?.toLowerCase().includes(search.toLowerCase()),
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
            {loading ? "..." : filteredMarkets.length} mercados
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#141726]/60 border border-white/5 p-3 rounded-[32px] flex items-center gap-4 shadow-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-indigo-500/40 placeholder:text-slate-600 transition-all font-medium"
            placeholder="Pesquisar por pergunta ou categoria..."
          />
        </div>
      </div>

      {/* Markets Table */}
      <div className="bg-[#141726]/20 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/2 border-b border-white/5">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Evento / Mercado
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Categoria
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">
                  Status
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">
                  Engajamento
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
                        Sincronizando Dados
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredMarkets.length > 0 ? (
                filteredMarkets.map((m) => {
                  const s = statusMap[m.status] || statusMap[0];
                  const Icon = s.icon;
                  return (
                    <tr
                      key={m.id}
                      className="group hover:bg-white/1 transition-all cursor-default"
                    >
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 relative">
                            <BarChart3 className="w-6 h-6 text-indigo-400/60" />
                            {m.isTrending && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-[#0a0b14] flex items-center justify-center">
                                <TrendingUp className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[15px] font-black text-white transition-colors group-hover:text-indigo-400 line-clamp-1">
                              {m.question}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 opacity-60">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                #{m.id}
                              </span>
                              <span className="w-1 h-1 bg-slate-700 rounded-full" />
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span className="text-[10px] text-slate-500 font-bold uppercase">
                                {new Date(m.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-black text-indigo-300/80">
                            {m.category?.name || "Sem Categoria"}
                          </span>
                          <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">
                            Predição
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
                      <td className="px-10 py-7 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-[16px] font-black text-white">
                            {m._count?.purchases || 0}
                          </span>
                          <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">
                            Predições Ativas
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <div className="flex items-center justify-center gap-2.5">
                          <Link
                            href={`/dashboard/markets/${m.id}`}
                            title="Editar Mercado"
                            className="w-11 h-11 rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-indigo-600/80 hover:shadow-lg hover:shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center"
                          >
                            <Eye className="w-4.5 h-4.5" />
                          </Link>
                          <button
                            title="Ver Gráfico"
                            className="w-11 h-11 rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-emerald-600/80 hover:shadow-lg hover:shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center"
                          >
                            <TrendingUp className="w-4.5 h-4.5" />
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <Archive className="w-16 h-16 text-slate-500" />
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
