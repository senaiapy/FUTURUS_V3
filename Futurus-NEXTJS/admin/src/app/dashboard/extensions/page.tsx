"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Puzzle,
  Settings2,
  Power,
  ShieldCheck,
  BarChart3,
  MessageSquare,
  CreditCard,
  Cloud,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/PremiumUI";

export default function AdminExtensionsPage() {
  const router = useRouter();
  const [extensions, setExtensions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }
    const fetchExtensions = async () => {
      try {
        const res = await api.get("/admin/extensions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExtensions(res.data.extensions || mockExtensions);
      } catch (err) {
        console.error(err);
        setExtensions(mockExtensions);
      } finally {
        setLoading(false);
      }
    };
    fetchExtensions();
  }, [router]);

  const mockExtensions = [
    {
      id: 1,
      name: "Google Recaptcha",
      alias: "google_recaptcha",
      description:
        "Proteção contra bots e spam em formulários de registro e login.",
      image: "https://www.gstatic.com/recaptcha/api2/logo_48.png",
      status: 1,
      icon: ShieldCheck,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      id: 2,
      name: "Tawk.to Live Chat",
      alias: "tawk_chat",
      description:
        "Chat em tempo real para suporte direto aos usuários no frontend.",
      image: "https://static-lib.tawk.to/images/logo.png",
      status: 0,
      icon: MessageSquare,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      id: 3,
      name: "Custom CSS",
      alias: "custom_css",
      description:
        "Adicione estilos CSS customizados sem alterar os arquivos do sistema.",
      image: "",
      status: 1,
      icon: Puzzle,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
  ];

  if (loading)
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
          Carregando Extensões...
        </p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Extensões
          </h1>
          <p className="text-slate-500 font-bold mt-2">
            Gerencie plugins e integrações de terceiros
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {extensions.map((ext) => (
          <Card
            key={ext.id}
            className="p-6 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`w-14 h-14 rounded-[20px] ${ext.bg || "bg-white/5"} flex items-center justify-center border border-white/5 shadow-xl`}
                >
                  {ext.icon ? (
                    <ext.icon
                      className={`w-7 h-7 ${ext.color || "text-indigo-400"}`}
                    />
                  ) : (
                    <Puzzle className="w-7 h-7 text-indigo-400" />
                  )}
                </div>
                <Badge variant={ext.status === 1 ? "success" : "default"}>
                  {ext.status === 1 ? "Ativo" : "Desativado"}
                </Badge>
              </div>

              <h3 className="text-xl font-black text-white mb-2">{ext.name}</h3>
              <p className="text-sm text-slate-500 font-bold leading-relaxed line-clamp-2">
                {ext.description}
              </p>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <Button
                variant="secondary"
                icon={Settings2}
                className="flex-1 rounded-2xl border-none bg-white/5 hover:bg-white/10 text-[10px]"
              >
                Configurar
              </Button>
              <Button
                variant={ext.status === 1 ? "danger" : "success"}
                icon={Power}
                className="flex-1 rounded-2xl text-[10px]"
              >
                {ext.status === 1 ? "Desativar" : "Ativar"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
