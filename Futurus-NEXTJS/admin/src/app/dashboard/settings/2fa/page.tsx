"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  ArrowLeft,
  ShieldCheck,
  Smartphone,
  KeyRound,
  QrCode,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Loader2,
} from "lucide-react";
import { Card, Button } from "@/components/ui/PremiumUI";
import { cn } from "@/lib/utils";

export default function AdminTwoFactorPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<{
    twoFactorEnabled?: boolean;
    name?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{
    secret: string;
    qrCode: string;
  } | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }
    fetchStatus();
  }, [router]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      
      // Get admin profile stats or specific 2fa check
      const res = await api.get("/admin/2fa", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setAdmin({
        twoFactorEnabled: res.data.enabled,
        name: res.data.name
      });

      if (!res.data.enabled) {
        setQrCodeData({
          secret: res.data.secret,
          qrCode: res.data.qrCodeUrl,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    if (code.length !== 6) return;
    setVerifying(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("admin_token");
      await api.post("/admin/2fa/enable", { code }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({ type: "success", text: "Autenticação 2FA ativada com sucesso!" });
      setAdmin(prev => prev ? { ...prev, twoFactorEnabled: true } : prev);
      setQrCodeData(null);
      setCode("");
    } catch (err: any) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Código inválido. Tente novamente." 
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable = async () => {
    if (code.length !== 6) return;
    setVerifying(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("admin_token");
      await api.post("/admin/2fa/disable", { code }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({ type: "success", text: "Autenticação 2FA desativada." });
      setAdmin(prev => prev ? { ...prev, twoFactorEnabled: false } : prev);
      setCode("");
      // Re-fetch to get new QR code
      fetchStatus();
    } catch (err: any) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Código inválido. Tente novamente." 
      });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">
            Segurança em Duas Etapas
          </h1>
          <p className="text-slate-500 font-bold mt-2">
            Proteja sua conta administrativa com Google Authenticator
          </p>
        </div>
        <Button
          variant="secondary"
          icon={ArrowLeft}
          className="rounded-2xl px-6 h-12"
          onClick={() => router.push("/dashboard/settings")}
        >
          Voltar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Status Card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 border-white/5 bg-[#141726]/40 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck className="w-32 h-32 text-indigo-500" />
            </div>
            
            <div className={cn(
              "w-20 h-20 rounded-[28px] mx-auto flex items-center justify-center mb-6 border shadow-2xl transition-all",
              admin?.twoFactorEnabled 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-emerald-500/20" 
                : "bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-rose-500/20"
            )}>
              {admin?.twoFactorEnabled ? <ShieldCheck className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
            </div>

            <h3 className="text-xl font-black text-white uppercase tracking-tight">
              Status 2FA
            </h3>
            
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/5">
              <div className={cn("w-2 h-2 rounded-full", admin?.twoFactorEnabled ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                admin?.twoFactorEnabled ? "text-emerald-400" : "text-rose-400"
              )}>
                {admin?.twoFactorEnabled ? "ATIVADO" : "DESATIVADO"}
              </span>
            </div>

            <p className="mt-6 text-sm font-bold text-slate-500 leading-relaxed">
              {admin?.twoFactorEnabled 
                ? "Sua conta está protegida por uma camada adicional de segurança."
                : "Recomendamos fortemente a ativação do 2FA para proteger o acesso administrativo."}
            </p>
          </Card>

          <Card className="p-6 border-white/5 bg-black/20">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              Como funciona?
            </h4>
            <ol className="space-y-4">
              {[
                "Baixe o Google Authenticator",
                "Escaneie o QR Code ao lado",
                "Insira o código de 6 dígitos",
                "Sua conta estará segura!"
              ].map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="text-indigo-500 font-black text-xs">{i+1}.</span>
                  <span className="text-[12px] text-slate-500 font-medium">{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* Action Card */}
        <div className="lg:col-span-8">
          <Card className="p-8 lg:p-12 border-white/5 bg-[#141726]/40 h-full">
            {message && (
              <div className={cn(
                "mb-8 p-6 rounded-3xl border flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500",
                message.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              )}>
                {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
                <p className="text-sm font-black uppercase tracking-tight">{message.text}</p>
              </div>
            )}

            {!admin?.twoFactorEnabled ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                      Configurar Autenticador
                    </h2>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                      Escaneie este QR Code com seu aplicativo de autenticação (Google Authenticator, Authy, etc).
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                        Código de Verificação
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="000 000"
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                          className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 pl-16 pr-6 text-white font-black text-xl tracking-[0.5em] focus:outline-none focus:border-indigo-500/40 transition-all placeholder:tracking-normal placeholder:text-slate-800"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleEnable}
                      loading={verifying}
                      disabled={code.length !== 6}
                      variant="primary"
                      className="w-full h-16 rounded-[28px] bg-indigo-600 text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30"
                    >
                      ATIVAR SEGURANÇA
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center space-y-6 p-10 bg-black/40 rounded-[48px] border border-white/5 shadow-2xl relative group">
                  <div className="absolute inset-0 bg-indigo-600/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {qrCodeData?.qrCode ? (
                    <div className="relative bg-white p-6 rounded-[32px] shadow-2xl shadow-indigo-500/20">
                      <img 
                        src={qrCodeData.qrCode} 
                        alt="2FA QR Code" 
                        className="w-48 h-48 lg:w-56 lg:h-56 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 bg-white/5 rounded-[32px] flex items-center justify-center border border-white/5">
                      <QrCode className="w-16 h-16 text-slate-700 animate-pulse" />
                    </div>
                  )}

                  <div className="text-center space-y-2 relative">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      Chave Manual
                    </p>
                    <code className="px-5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-sm font-bold block">
                      {qrCodeData?.secret || "XXXX-XXXX-XXXX-XXXX"}
                    </code>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 space-y-10 max-w-md mx-auto">
                <div className="w-24 h-24 rounded-[32px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/20">
                  <Smartphone className="w-12 h-12" />
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                    2FA Ativado!
                  </h2>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Sua conta está protegida. Para desativar, insira o código gerado no seu dispositivo e confirme a ação.
                  </p>
                </div>

                <div className="w-full space-y-6">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                      Código de Verificação
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="000 000"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 pl-16 pr-6 text-white font-black text-xl tracking-[0.5em] focus:outline-none focus:border-indigo-500/40 transition-all placeholder:text-slate-800"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleDisable}
                    loading={verifying}
                    disabled={code.length !== 6}
                    variant="danger"
                    className="w-full h-16 rounded-[28px] bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20 text-xs font-black uppercase tracking-[0.2em] transition-all"
                  >
                    DESATIVAR SEGURANÇA
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
