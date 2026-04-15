"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Clock,
  Terminal,
  Play,
  Calendar,
  Info,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { Card, Button } from "@/components/ui/PremiumUI";

export default function AdminCronPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
    } else {
      setLoading(false);
    }
  }, [router]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading)
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
          Carregando Tarefas Cron...
        </p>
      </div>
    );

  const cronJobs = [
    {
      id: "5min",
      name: "Update Market Status",
      desc: "Atualiza o status dos mercados baseados no tempo de expiração.",
      schedule: "*/5 * * * *",
      command: "curl -s https://futurus.com.br/cron/market",
    },
    {
      id: "1h",
      name: "Resolve Markets",
      desc: "Verifica e resolve mercados que já completaram o ciclo.",
      schedule: "0 * * * *",
      command: "curl -s https://futurus.com.br/cron/resolve",
    },
    {
      id: "daily",
      name: "System Cleanup",
      desc: "Limpa logs antigos e arquivos temporários.",
      schedule: "0 0 * * *",
      command: "curl -s https://futurus.com.br/cron/cleanup",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Cron Jobs
          </h1>
          <p className="text-slate-500 font-bold mt-2">
            Configure o agendamento de tarefas automáticas do sistema
          </p>
        </div>
      </div>

      {/* Info Warning */}
      <Card className="p-6 bg-indigo-500/5 border-indigo-500/10">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-400">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-300">
              Instruções de Configuração
            </p>
            <p className="text-xs text-indigo-400/60 mt-1 leading-relaxed">
              Para que o sistema funcione corretamente, você deve configurar os
              comandos abaixo no painel de controle do seu servidor (cPanel,
              DirectAdmin, ou crontab via SSH). Certifique-se de que o comando{" "}
              <strong>curl</strong> esteja disponível no seu ambiente.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {cronJobs.map((job) => (
          <Card key={job.id} className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0B0D17] border border-white/5 flex items-center justify-center text-emerald-400 shadow-lg">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">
                      {job.name}
                    </h3>
                    <p className="text-sm text-slate-500 font-bold">
                      {job.desc}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/2 border border-white/5">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Frequência
                    </p>
                    <code className="text-sm font-mono text-indigo-400">
                      {job.schedule}
                    </code>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/2 border border-white/5">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Última Execução
                    </p>
                    <p className="text-sm font-bold text-white italic opacity-40">
                      Nunca executada via painel
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Terminal className="w-3 h-3" /> Comando de Execução
                  </p>
                  <div className="group relative">
                    <div className="w-full bg-[#0B0D17] border border-white/5 rounded-2xl py-4 px-5 pr-12 font-mono text-xs text-emerald-400/80 break-all leading-relaxed">
                      {job.command}
                    </div>
                    <button
                      onClick={() => copyToClipboard(job.command, job.id)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                    >
                      {copied === job.id ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:w-48 flex lg:flex-col justify-end lg:justify-center gap-3">
                <Button
                  variant="primary"
                  icon={Play}
                  className="flex-1 lg:flex-none py-4 shadow-indigo-600/20"
                >
                  Rodar Agora
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 lg:flex-none py-4 border-none bg-white/5"
                >
                  Ver Logs
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
