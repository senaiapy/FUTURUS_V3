"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Search,
  Monitor,
  Smartphone,
  Shield,
  History,
  MapPin,
  Activity,
  Lock,
  FileDown,
} from "lucide-react";
import { Card, Button } from "@/components/ui/PremiumUI";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AdminLoginsReportPage() {
  const router = useRouter();
  const [logins, setLogins] = useState<
    {
      id: number;
      user_ip: string;
      browser: string;
      os: string;
      user_agent: string;
      city: string;
      country: string;
      createdAt: string;
      user: { id: number; username: string };
    }[]
  >([]);
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
      const res = await api.get(`/admin/reports/logins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogins(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = logins.filter(
    (l) =>
      !search ||
      l.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
      l.user_ip?.toLowerCase().includes(search.toLowerCase()) ||
      l.browser?.toLowerCase().includes(search.toLowerCase()) ||
      l.os?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">
            Histórico de Acessos
          </h1>
          <p className="text-slate-500 font-bold mt-2">
            Log detalhado de autenticações e sessões de usuários
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            icon={FileDown}
            className="rounded-2xl h-12 shadow-xl shadow-black/20"
          >
            Exportar Logs
          </Button>
        </div>
      </div>

      {/* Grid Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Acessos (30d)",
            value: logins.length,
            icon: Activity,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
          },
          {
            label: "IPs Únicos",
            value: new Set(logins.map((l) => l.user_ip)).size,
            icon: Shield,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Mobile vs Desktop",
            value: "42% / 58%",
            icon: Smartphone,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            label: "Tentativas Falhas",
            value: "0",
            icon: Lock,
            color: "text-rose-400",
            bg: "bg-rose-500/10",
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
            placeholder="Procurar por @usuario, IP, navegador ou sistema..."
          />
        </div>
      </div>

      {/* Logins Table */}
      <div className="bg-[#141726]/20 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 border-b border-white/5">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Usuário
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Origem (IP)
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Dispositivo / Sistema
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">
                  Localização
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
                      Monitorando Acessos
                    </span>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((l) => (
                  <tr
                    key={l.id}
                    className="group hover:bg-white/1 transition-all"
                  >
                    <td className="px-10 py-7">
                      <Link
                        href={`/dashboard/users/${l.user?.id}`}
                        className="flex items-center gap-4 group/user"
                      >
                        <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover/user:border-indigo-500/20 transition-all">
                          <span className="text-xs font-black text-indigo-400">
                            {l.user?.username?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-white group-hover/user:text-indigo-400 transition-colors uppercase tracking-tight truncate">
                            @{l.user?.username || "Guest"}
                          </p>
                          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5 truncate">
                            ID: #{l.user?.id || 0}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-indigo-400 opacity-60" />
                        <span className="text-sm font-black text-slate-300 font-mono tracking-tighter">
                          {l.user_ip}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          {l.os?.toLowerCase().includes("windows") ||
                          l.os?.toLowerCase().includes("mac") ? (
                            <Monitor className="w-3.5 h-3.5 text-slate-600" />
                          ) : (
                            <Smartphone className="w-3.5 h-3.5 text-slate-600" />
                          )}
                          <span className="text-xs font-black text-white tracking-tight leading-none uppercase">
                            {l.browser} / {l.os}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter mt-1.5 line-clamp-1 opacity-60">
                          UA: {l.user_agent}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-7 text-center">
                      <div className="flex items-center justify-center gap-2 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-rose-500/40" />
                        <span className="text-[10px] font-black uppercase tracking-tight">
                          {l.city || "São Paulo"}, {l.country || "Brasil"}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-7 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">
                          {new Date(l.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[9px] text-slate-600 font-black uppercase mt-1 opacity-60">
                          {new Date(l.createdAt).toLocaleTimeString([], {
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
                      Nenhum acesso registrado
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
