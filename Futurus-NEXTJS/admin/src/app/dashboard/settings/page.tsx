"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Save,
  Info,
  Globe,
  ShieldCheck,
  BellRing,
  Smartphone,
  Mail,
  Hammer,
  CheckCircle2,
  XCircle,
  Activity,
  Zap,
  Lock,
  Bell,
  Cpu,
  RefreshCcw,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Loader2,
  User,
  Phone,
  MapPin,
} from "lucide-react";
import { Card, Button, Badge } from "@/components/ui/PremiumUI";
import { cn } from "@/lib/utils";
import Link from "next/link";

const tabs = [
  { id: "identidade", label: "Identidade", icon: Globe },
  { id: "perfil", label: "Perfil", icon: User },
  { id: "seguranca", label: "Segurança", icon: ShieldCheck },
  { id: "notificacoes", label: "Notificações", icon: BellRing },
  { id: "manutencao", label: "Manutenção", icon: Hammer },
];

export default function AdminSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("identidade");
  const [settings, setSettings] = useState<{
    [key: string]: string | number | undefined;
    siteName?: string;
    logoUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactAddress?: string;
    curSym?: string;
    curText?: string;
    maintenanceMode?: number;
    ev?: number;
    sv?: number;
    kycVerification?: number;
    registration?: number;
    en?: number;
    sn?: number;
    pn?: number;
    force_2fa?: number;
  } | null>(null);
  const [admin2fa, setAdmin2fa] = useState<{
    enabled: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const fetchData = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      setLoading(true);
      const res = await api.get("/admin/settings/general", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettings(res.data);

      try {
        const res2 = await api.get("/admin/2fa", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmin2fa({ enabled: res2.data.enabled });
      } catch (err2) {
        console.error("Error fetching 2fa status", err2);
      }
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

  const handleSave = async () => {
    const token = localStorage.getItem("admin_token");
    setSaving(true);
    setMessage(null);
    try {
      await api.patch("/admin/settings/general", settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({
        text: "Configurações atualizadas com sucesso!",
        type: "success",
      });
      setTimeout(() => setMessage(null), 4000);
    } catch {
      setMessage({
        text: "Ocorreu um erro ao salvar os dados.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("admin_token");
    setUploadingLogo(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post("/admin/upload/logo", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSettings((prev) => (prev ? { ...prev, logoUrl: res.data.url } : prev));
      setMessage({
        text: "Logo atualizado com sucesso!",
        type: "success",
      });
      setTimeout(() => setMessage(null), 4000);
    } catch {
      setMessage({
        text: "Erro ao fazer upload do logo.",
        type: "error",
      });
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

  if (loading)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin shadow-2xl shadow-indigo-500/20" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
          Sincronizando Core
        </span>
      </div>
    );

  return (
    <div className="space-y-8 pb-16 max-w-[1200px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex items-center gap-5">
          <Link
            href="/dashboard"
            className="w-12 h-12 rounded-2xl bg-[#141726]/40 border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center group shrink-0"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight uppercase flex items-center gap-4">
              Configurações Gerais
            </h1>
            <p className="text-slate-500 font-bold mt-1 text-sm">
              Controle as diretrizes principais e comportamento do sistema
            </p>
          </div>
        </div>
        <div>
          <Button
            variant="primary"
            icon={Save}
            loading={saving}
            className="h-14 px-10 rounded-[28px] bg-indigo-600 shadow-2xl shadow-indigo-600/20 text-xs font-black uppercase tracking-widest"
            onClick={handleSave}
          >
            SALVAR ALTERAÇÕES
          </Button>
        </div>
      </div>

      {message && (
        <div
          className={cn(
            "p-6 rounded-[32px] border animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl",
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400",
          )}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border",
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/10"
                  : "bg-rose-500/10 border-rose-500/10",
              )}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </div>
            <p className="text-sm font-black uppercase tracking-tighter">
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-2 bg-[#141726]/60 rounded-2xl border border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all font-bold text-sm uppercase tracking-wide",
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* IDENTIDADE TAB */}
        {activeTab === "identidade" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-8 lg:p-10 border-white/5 bg-[#141726]/40 shadow-2xl space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    Identidade Visual
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                    Nomenclatura e Moeda
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                    Nome do Website
                  </label>
                  <input
                    value={settings?.siteName || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, siteName: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 px-6 text-white font-black text-sm focus:outline-none focus:border-indigo-500/40 transition-all"
                    placeholder="Ex: Futurus Exchange"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                    Logo do Site
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
                      {settings?.logoUrl ? (
                        <img
                          src={`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/api$/, "")}${settings.logoUrl}`}
                          alt="Logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          disabled={uploadingLogo}
                        />
                        <div className={cn(
                          "flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border border-dashed transition-all",
                          uploadingLogo
                            ? "bg-indigo-500/10 border-indigo-500/30 cursor-wait"
                            : "bg-black/30 border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5"
                        )}>
                          {uploadingLogo ? (
                            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                          ) : (
                            <Upload className="w-5 h-5 text-slate-400" />
                          )}
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {uploadingLogo ? "Enviando..." : "Upload Logo"}
                          </span>
                        </div>
                      </label>
                      <p className="text-[10px] text-slate-600 mt-2 ml-2">
                        PNG, JPG ou SVG. Máximo 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                      Símbolo (SYM)
                    </label>
                    <input
                      value={settings?.curSym || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, curSym: e.target.value })
                      }
                      className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 px-6 text-white font-black text-sm focus:outline-none focus:border-indigo-500/40 transition-all text-center"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                      Texto (BRL)
                    </label>
                    <input
                      value={settings?.curText || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, curText: e.target.value })
                      }
                      className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 px-6 text-white font-black text-sm focus:outline-none focus:border-indigo-500/40 transition-all text-center"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 lg:p-10 border-white/5 bg-[#141726]/40 shadow-xl space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    Sistema Interno
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                    Configurações Técnicas
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-5 rounded-[28px] bg-black/30 border border-white/5 group hover:border-purple-500/20 transition-all flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1.5">
                      Paginação Global
                    </p>
                    <p className="text-xl font-black text-white">20 Linhas</p>
                  </div>
                  <RefreshCcw className="w-5 h-5 text-purple-500/40 group-hover:rotate-180 transition-transform duration-500" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* PERFIL TAB */}
        {activeTab === "perfil" && (
          <Card className="p-8 lg:p-10 border-white/5 bg-[#141726]/40 shadow-2xl">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  Informações de Contato
                </h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">
                  Dados exibidos no footer e páginas públicas
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  E-mail de Contato
                </label>
                <input
                  value={settings?.contactEmail || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, contactEmail: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 px-6 text-white font-black text-sm focus:outline-none focus:border-indigo-500/40 transition-all"
                  placeholder="Ex: contato@futurus-brasil.com"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  Telefone
                </label>
                <input
                  value={settings?.contactPhone || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, contactPhone: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 px-6 text-white font-black text-sm focus:outline-none focus:border-indigo-500/40 transition-all"
                  placeholder="Ex: +55 11 99500-1234"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  Endereço
                </label>
                <textarea
                  value={settings?.contactAddress || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, contactAddress: e.target.value })
                  }
                  rows={3}
                  className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 px-6 text-white font-black text-sm focus:outline-none focus:border-indigo-500/40 transition-all resize-none"
                  placeholder="Ex: Av. Paulista 3500 CJ.124, São Paulo - SP"
                />
              </div>
            </div>
          </Card>
        )}

        {/* SEGURANÇA TAB */}
        {activeTab === "seguranca" && (
          <Card className="p-8 lg:p-10 border-white/5 bg-[#141726]/40 shadow-2xl">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  Segurança & KYC
                </h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">
                  Verificações e Acesso
                </p>
              </div>
            </div>

            {/* Admin 2FA Warning/Status */}
            <div className="mb-8 p-8 rounded-[40px] bg-indigo-600/5 border border-indigo-500/10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                    <ShieldCheck className="w-32 h-32 text-indigo-500" />
                </div>
                <div className="flex items-center gap-6">
                    <div className={cn(
                        "w-16 h-16 rounded-3xl flex items-center justify-center border shadow-2xl",
                        admin2fa?.enabled ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                    )}>
                        {admin2fa?.enabled ? <ShieldCheck className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h4 className="text-xl font-black text-white uppercase tracking-tight">Status 2FA</h4>
                            <Badge variant={admin2fa?.enabled ? "success" : "danger"} className="px-3 py-1 text-[9px] font-black tracking-widest uppercase">
                                {admin2fa?.enabled ? "ATIVADO" : "DESATIVADO"}
                            </Badge>
                        </div>
                        <p className="text-sm font-bold text-slate-500 mt-2 max-w-md">
                            {admin2fa?.enabled 
                                ? "Sua conta está protegida por uma camada adicional de segurança."
                                : "Recomendamos fortemente a ativação do 2FA para proteger o acesso administrativo."}
                        </p>
                    </div>
                </div>
                <div className="shrink-0">
                    <Button 
                        variant={admin2fa?.enabled ? "secondary" : "primary"}
                        className="px-8 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl"
                        onClick={() => router.push("/dashboard/settings/2fa")}
                    >
                        {admin2fa?.enabled ? "GERENCIAR SEGURANÇA" : "ATIVAR AGORA"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  key: "ev",
                  label: "Verificação de E-mail (EV)",
                  icon: Mail,
                  color: "text-indigo-400",
                },
                {
                  key: "sv",
                  label: "Verificação de SMS (SV)",
                  icon: Smartphone,
                  color: "text-emerald-400",
                },
                {
                  key: "kycVerification",
                  label: "Sistema de KYC (Identidade)",
                  icon: Info,
                  color: "text-purple-400",
                },
                {
                  key: "registration",
                  label: "Permitir Novos Cadastros",
                  icon: Zap,
                  color: "text-amber-400",
                },
              ].map((ctrl) => (
                <div
                  key={ctrl.key}
                  className="flex items-center justify-between p-6 rounded-[32px] bg-black/30 border border-white/5 transition-all hover:bg-black/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                      <ctrl.icon className={cn("w-5 h-5", ctrl.color)} />
                    </div>
                    <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                      {ctrl.label}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      settings &&
                      setSettings({
                        ...settings,
                        [ctrl.key]: settings[ctrl.key] ? 0 : 1,
                      })
                    }
                    className={cn(
                      "w-14 h-7 rounded-full relative transition-all duration-500 shadow-2xl",
                      settings?.[ctrl.key]
                        ? "bg-indigo-600 shadow-indigo-600/20"
                        : "bg-slate-800",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-xl",
                        settings?.[ctrl.key] ? "left-8" : "left-1",
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* NOTIFICAÇÕES TAB */}
        {activeTab === "notificacoes" && (
          <Card className="p-8 lg:p-10 border-white/5 bg-[#141726]/40 shadow-2xl">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <BellRing className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  Comunicação
                </h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">
                  Alertas e Canais
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  key: "en",
                  label: "Alertas por E-mail",
                  icon: Mail,
                  color: "text-indigo-400",
                },
                {
                  key: "sn",
                  label: "Alertas por SMS",
                  icon: Smartphone,
                  color: "text-emerald-400",
                },
                {
                  key: "pn",
                  label: "Push Notification System",
                  icon: Bell,
                  color: "text-purple-400",
                },
                {
                  key: "force_2fa",
                  label: "Forçar 2FA (Segurança)",
                  icon: Lock,
                  color: "text-rose-400",
                },
              ].map((ctrl) => (
                <div
                  key={ctrl.key}
                  className="flex items-center justify-between p-6 rounded-[32px] bg-black/30 border border-white/5 transition-all hover:bg-black/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                      <ctrl.icon className={cn("w-5 h-5", ctrl.color)} />
                    </div>
                    <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                      {ctrl.label}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      settings &&
                      setSettings({
                        ...settings,
                        [ctrl.key]: settings[ctrl.key] ? 0 : 1,
                      })
                    }
                    className={cn(
                      "w-14 h-7 rounded-full relative transition-all duration-500 shadow-2xl",
                      settings?.[ctrl.key]
                        ? "bg-emerald-600 shadow-emerald-600/20"
                        : "bg-slate-800",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-xl",
                        settings?.[ctrl.key] ? "left-8" : "left-1",
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* MANUTENÇÃO TAB */}
        {activeTab === "manutencao" && (
          <div className="space-y-8">
            <Card className="p-8 lg:p-12 border-rose-500/10 bg-gradient-to-br from-rose-500/5 to-[#141726]/40 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                <div className="max-w-2xl space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                      <Hammer className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                        Modo de Manutenção
                      </h3>
                      <Badge
                        variant="danger"
                        className="mt-2 px-3 py-1 rounded-lg text-[9px] font-black"
                      >
                        {settings?.maintenanceMode
                          ? "SISTEMA OFFLINE"
                          : "SISTEMA ONLINE"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-400 leading-relaxed">
                    Ao ativar este modo, todos os acessos públicos serão
                    encerrados imediatamente. Apenas contas administrativas
                    poderão visualizar a plataforma. Útil para atualizações
                    críticas de banco de dados ou correções de emergência.
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-center gap-4 p-8 bg-black/40 rounded-[40px] border border-white/5 shadow-2xl">
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                    {settings?.maintenanceMode ? "DESATIVAR" : "ATIVAR AGORA"}
                  </span>
                  <button
                    onClick={() =>
                      settings &&
                      setSettings({
                        ...settings,
                        maintenanceMode: settings.maintenanceMode ? 0 : 1,
                      })
                    }
                    className={cn(
                      "w-20 h-10 rounded-full relative transition-all duration-500 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]",
                      settings?.maintenanceMode
                        ? "bg-rose-600 shadow-rose-600/30"
                        : "bg-slate-800",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-1.5 w-7 h-7 rounded-full bg-white transition-all shadow-xl",
                        settings?.maintenanceMode ? "left-11" : "left-2",
                      )}
                    />
                  </button>
                </div>
              </div>
              <Activity className="absolute -bottom-10 -right-10 w-48 h-48 text-rose-600 opacity-[0.03] group-hover:scale-110 transition-transform" />
            </Card>

            {settings?.maintenanceMode === 1 && (
              <div className="p-6 rounded-[28px] bg-rose-500/10 border border-rose-500/20 animate-in fade-in slide-in-from-top-2 duration-500">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-wider mb-3">
                  ⚠️ ATENÇÃO: Site em modo manutenção
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Os usuários não conseguirão acessar o site. Somente administradores podem fazer login.
                  Lembre-se de desativar quando a manutenção for concluída!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
