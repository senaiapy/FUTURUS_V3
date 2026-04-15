"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Server,
  Database,
  Cpu,
  HardDrive,
  ShieldCheck,
  RefreshCw,
  Clock,
  Code2,
  Package,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/PremiumUI";

export default function AdminSystemInfoPage() {
  const router = useRouter();
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }
    const fetchInfo = async () => {
      try {
        const res = await api.get("/admin/system/info", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInfo(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [router]);

  if (loading)
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
          Carregando Informações do Sistema...
        </p>
      </div>
    );

  const serverInfo = [
    {
      label: "Versão Base",
      value: info?.php_version || "8.2.12",
      icon: Code2,
    },
    {
      label: "Versão http",
      value: info?.laravel_version || "10.48.4",
      icon: Package,
    },
    {
      label: "Servidor Web",
      value: info?.server_software || "nginx/1.24.0",
      icon: Server,
    },
    {
      label: "IP do Servidor",
      value: info?.server_ip || "127.0.0.1",
      icon: Database,
    },
    { label: "Tempo de Execução PHP", value: "30s", icon: Clock },
    { label: "Memória Limite", value: "512M", icon: HardDrive },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Informações do Sistema
          </h1>
          <p className="text-slate-500 font-bold mt-2">
            Detalhes técnicos da infraestrutura e software
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={RefreshCw}
            className="rounded-2xl border-none bg-white/5"
          >
            Limpar Cache
          </Button>
          <Button
            variant="primary"
            icon={ShieldCheck}
            className="rounded-2xl shadow-indigo-600/20"
          >
            Verificar Segurança
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Server Stats */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  Configuração do Servidor
                </h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                  Especificações Técnicas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {serverInfo.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#0B0D17] border border-white/5 flex items-center justify-between group hover:border-indigo-500/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <item.icon className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm font-mono text-indigo-400">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  Banco de Dados
                </h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                  Informações de Conexão
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b border-white/5">
                <span className="text-sm font-bold text-slate-400">Driver</span>
                <Badge variant="success">MySQL 8.0</Badge>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-white/5">
                <span className="text-sm font-bold text-slate-400">
                  Tamanho do DB
                </span>
                <span className="text-sm font-mono text-white">42.5 MB</span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-white/5">
                <span className="text-sm font-bold text-slate-400">
                  Total de Tabelas
                </span>
                <span className="text-sm font-mono text-white">84</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-8">
          <Card className="p-8 bg-linear-to-b from-indigo-500/10 to-transparent border-indigo-500/20">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">
              Status do Sistema
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-bold text-slate-300">
                    API Gateway
                  </span>
                </div>
                <Badge variant="success">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-bold text-slate-300">
                    WebSocket
                  </span>
                </div>
                <Badge variant="success">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-bold text-slate-300">
                    Cron Queue
                  </span>
                </div>
                <Badge variant="success">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-sm font-bold text-slate-300">
                    Backup
                  </span>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase">
                  2h atrás
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">
              Uso de Recursos
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span>CPU Load</span>
                  <span>12%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: "12%" }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span>RAM Usage</span>
                  <span>284MB / 1GB</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: "28%" }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span>Disk Usage</span>
                  <span>4.2GB / 20GB</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: "21%" }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
