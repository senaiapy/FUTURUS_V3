"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  BellRing,
  Mail,
  Smartphone,
  Bell,
  Save,
  Info,
  ChevronDown,
  Layout,
  MessageCircle,
  AppWindow,
  Settings,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/PremiumUI";

export default function AdminNotificationSettingPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }
    const fetchSettings = async () => {
      try {
        const res = await api.get("/admin/notification/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSettings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [router]);

  const handleSave = async () => {
    const token = localStorage.getItem("admin_token");
    setSaving(true);
    try {
      await api.post("/admin/notification/settings", settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Success alert
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
          Carregando Configuração de Notificações...
        </p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Canais de Notificação
          </h1>
          <p className="text-slate-500 font-bold mt-2">
            Configure gateways de E-mail, SMS e Push Notifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={Save}
            loading={saving}
            onClick={handleSave}
            className="rounded-2xl shadow-indigo-600/20 px-8"
          >
            Salvar Configurações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Email Notification */}
        <Card className="p-8 space-y-8 h-full bg-[#141726]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">E-mail Gateway</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                SMTP / PHP Mail
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                Servidor SMTP
              </label>
              <input
                placeholder="smtp.gmail.com"
                className="w-full bg-[#0B0D17] border border-white/5 rounded-2xl py-3 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                  Usuário
                </label>
                <input className="w-full bg-[#0B0D17] border border-white/5 rounded-2xl py-3 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                  Senha
                </label>
                <input
                  type="password"
                  className="w-full bg-[#0B0D17] border border-white/5 rounded-2xl py-3 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-bold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                  Porta
                </label>
                <input className="w-full bg-[#0B0D17] border border-white/5 rounded-2xl py-3 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                  Criptografia
                </label>
                <select className="w-full bg-[#0B0D17] border border-white/5 rounded-2xl py-3 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-bold">
                  <option>SSL</option>
                  <option>TLS</option>
                </select>
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full py-4 border-none bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400"
          >
            Enviar E-mail de Teste
          </Button>
        </Card>

        {/* Push & SMS Stats Sidebar */}
        <div className="space-y-8">
          <Card className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                <AppWindow className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  Push Notifications
                </h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                  Firebase Cloud Messaging
                </p>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-[#0B0D17] border border-white/5">
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">
                Chave do Servidor (FCM)
              </label>
              <textarea
                className="w-full bg-transparent border-none text-xs font-mono text-orange-400/80 resize-none h-24 focus:outline-none"
                placeholder="Cole seu Server Key do Firebase Console aqui..."
              />
            </div>
          </Card>

          <Card className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Gateway SMS</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                  Twilio / Nexmo / Infobip
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <select className="w-full bg-[#0B0D17] border border-white/5 rounded-2xl py-4 px-5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-bold">
                <option>Selecione um Provedor</option>
                <option>Twilio SMS</option>
                <option>Infobip</option>
              </select>
              <Button
                variant="secondary"
                className="w-full py-4 border-none bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400"
              >
                Configurar Credenciais
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
