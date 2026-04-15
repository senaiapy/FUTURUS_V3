"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import {
  ShieldCheck,
  Smartphone,
  KeyRound,
  QrCode,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Loader2,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export default function UserTwoFactorPage() {
  const { data: session } = useSession();
  const t = useTranslations();
  const [user, setUser] = useState<{
    twoFactorEnabled?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{
    secret: string;
    qrCode: string;
  } | null>(null);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  const accessToken = (session as any)?.accessToken;

  const fetchStatus = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      const res = await api.get("/users/2fa", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      setUser({
        twoFactorEnabled: res.data.enabled
      });

      if (!res.data.enabled) {
        setQrCodeData({
          secret: res.data.secret,
          qrCode: res.data.qrCodeUrl || res.data.qrCode, // Support both potential keys
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleEnable = async () => {
    const accessToken = (session as any)?.accessToken;
    try {
      await api.post("/users/2fa/enable", { code }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setMessage({ type: "success", text: t("2FA ativado com sucesso!") });
      setUser({ twoFactorEnabled: true });
      
      // Fetch recovery codes after enabling
      const codesRes = await api.get("/users/2fa/recovery-codes", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setRecoveryCodes(codesRes.data);
      setShowRecoveryModal(true);

      setQrCodeData(null);
      setCode("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || t("Código de verificação inválido")
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable = async () => {
    const accessToken = (session as any)?.accessToken;
    if (code.length !== 6) return;
    setVerifying(true);
    setMessage(null);
    try {
      await api.post("/users/2fa/disable", { code }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setMessage({ type: "success", text: t("2FA desativado com sucesso!") });
      setUser({ twoFactorEnabled: false });
      setCode("");
      fetchStatus();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || t("Código de verificação inválido")
      });
    } finally {
      setVerifying(false);
    }
  };

  const fetchRecoveryCodes = async () => {
    const accessToken = (session as any)?.accessToken;
    try {
      const res = await api.get("/users/2fa/recovery-codes", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setRecoveryCodes(res.data);
      setShowRecoveryModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = () => {
    if (!qrCodeData?.secret) return;
    navigator.clipboard.writeText(qrCodeData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">
            {t("Segurança 2FA")}
          </h1>
          <p className="text-slate-500 text-[13px] font-bold mt-3 uppercase tracking-widest">
            {t("Autenticação em duas etapas via Google Authenticator")}
          </p>
        </div>
        <Link 
          href="/dashboard"
          className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/2 border border-white/5 text-slate-400 hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("Voltar")}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Status & Steps */}
        <div className="lg:col-span-4 space-y-8">
          <div className="p-10 rounded-[40px] bg-slate-900 border border-white/5 flex flex-col items-center text-center space-y-8 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck className="w-32 h-32 text-blue-500" />
            </div>

            <div className={cn(
              "w-24 h-24 rounded-[32px] flex items-center justify-center transition-all shadow-2xl",
              user?.twoFactorEnabled 
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-emerald-500/20" 
                : "bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-rose-500/20"
            )}>
              {user?.twoFactorEnabled ? <ShieldCheck className="w-12 h-12" /> : <ShieldAlert className="w-12 h-12" />}
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-black text-white uppercase tracking-tight italic">STATUS</h3>
              <div className={cn(
                "px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] inline-flex items-center gap-2.5",
                user?.twoFactorEnabled ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
              )}>
                <div className={cn("w-2 h-2 rounded-full", user?.twoFactorEnabled ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-rose-500")} />
                {user?.twoFactorEnabled ? t("ATIVADO") : t("DESATIVADO")}
              </div>
            </div>

            <p className="text-[13px] text-slate-500 font-bold leading-relaxed px-2">
              {user?.twoFactorEnabled 
                ? t("Sua conta está mais segura e protegida contra acessos não autorizados.")
                : t("Seu acesso está protegido apenas por senha. Recomendamos ativar o 2FA.")}
            </p>
          </div>

          <div className="p-8 rounded-[32px] bg-slate-900/40 border border-white/5 space-y-6">
            <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <KeyRound className="w-4 h-4 text-blue-500" />
              {t("COMO ATIVAR?")}
            </h4>
            <div className="space-y-5">
              {[
                t("Baixe o Google Authenticator"),
                t("Escaneie o QR Code ao lado"),
                t("Digite o código de 6 dígitos"),
                t("Aproveite sua segurança total!")
              ].map((step, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <span className="text-blue-500 font-black text-sm pt-0.5 group-hover:scale-110 transition-transform">{i+1}.</span>
                  <p className="text-[13px] text-slate-400 font-bold leading-snug">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Actions (QR Code / Verify) */}
        <div className="lg:col-span-8">
          <div className="p-10 md:p-14 rounded-[56px] bg-slate-900 border border-white/5 h-full flex flex-col justify-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />
            
            {message && (
              <div className={cn(
                "mb-10 p-6 rounded-[28px] border flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500",
                message.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/5"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-lg shadow-rose-500/5"
              )}>
                {message.type === "success" ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <ShieldAlert className="w-6 h-6 shrink-0" />}
                <p className="text-[12px] font-black uppercase tracking-wider">{message.text}</p>
              </div>
            )}

            {!user?.twoFactorEnabled ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="space-y-10 order-2 md:order-1">
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">{t("CONFIGURAR AGORA")}</h2>
                    <p className="text-slate-500 text-[14px] font-bold leading-relaxed">{t("Use seu aplicativo de autenticação para escanear o código digital.")}</p>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] ml-5">
                        {t("CÓDIGO DE VERIFICAÇÃO")}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-7 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-700 transition-colors" />
                        <input 
                          type="text" 
                          maxLength={6}
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="000 000"
                          className="w-full bg-black/40 border border-white/5 rounded-[32px] py-6 pl-18 pr-8 text-white font-black text-3xl tracking-[0.4em] focus:outline-none focus:border-blue-500/40 focus:bg-black/60 transition-all placeholder:tracking-normal placeholder:text-slate-800 shadow-inner"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleEnable}
                      disabled={code.length !== 6 || verifying}
                      className="w-full h-20 rounded-[32px] bg-blue-600 text-white text-[13px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-4 group"
                    >
                      {verifying ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="w-6 h-6 group-hover:animate-bounce" />
                          {t("ATIVAR SEGURANÇA")}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center space-y-8 p-12 bg-black/30 rounded-[64px] border border-white/5 order-1 md:order-2 shadow-inner group">
                  <div className="relative bg-white p-7 rounded-[40px] shadow-2xl shadow-blue-900/30 transition-transform duration-500 group-hover:scale-105">
                    <div className="absolute inset-0 bg-blue-600/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {qrCodeData?.qrCode ? (
                      <Image 
                        src={qrCodeData.qrCode} 
                        alt="QR Code" 
                        width={320}
                        height={320}
                        className="w-64 h-64 lg:w-80 lg:h-80 object-contain aspect-square relative"
                        unoptimized
                      />
                    ) : (
                      <div className="w-48 h-48 lg:w-56 lg:h-56 flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-slate-200 animate-pulse" />
                      </div>
                    )}
                  </div>
                  <div className="text-center space-y-3 w-full max-w-[240px]">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">{t("CHAVE MANUAL")}</p>
                    <div className="flex items-center gap-2 p-2 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                      <code className="flex-1 font-mono text-xs font-bold text-blue-400 truncate">
                        {qrCodeData?.secret || "XXXX-XXXX-XXXX-XXXX"}
                      </code>
                      <button 
                        onClick={copyToClipboard}
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                          copied ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-500 hover:text-white"
                        )}
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-6 space-y-12 max-w-md mx-auto">
                <div className="w-28 h-28 rounded-[40px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/10 group">
                  <Smartphone className="w-14 h-14 group-hover:scale-110 transition-transform" />
                </div>
                
                <div className="space-y-5">
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">{t("PROTEÇÃO TOTAL")}</h2>
                  <p className="text-slate-500 text-[15px] font-bold leading-relaxed px-4">
                    {t("A autenticação de dois fatores está ativa. Para desativação total ou visualização de códigos de backup, utilize os controles abaixo.")}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button
                    onClick={fetchRecoveryCodes}
                    className="flex-1 h-18 rounded-3xl bg-white/5 border border-white/5 text-slate-300 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/20"
                  >
                    <KeyRound className="w-4 h-4 text-blue-500" />
                    {t("VER CÓDIGOS DE RECUPERAÇÃO")}
                  </button>
                </div>

                <div className="w-full space-y-8 text-left">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] ml-5">{t("CÓDIGO DE VERIFICAÇÃO")}</label>
                    <div className="relative">
                      <Lock className="absolute left-7 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-700" />
                      <input 
                        type="text" 
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000 000"
                        className="w-full bg-black/40 border border-white/5 rounded-[32px] py-6 pl-18 pr-8 text-white font-black text-3xl tracking-[0.5em] focus:outline-none focus:border-rose-500/40 focus:bg-black/60 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleDisable}
                    disabled={code.length !== 6 || verifying}
                    className="w-full h-20 rounded-[32px] bg-rose-500/5 text-rose-500 border border-rose-500/20 text-[13px] font-black uppercase tracking-[0.3em] hover:bg-rose-600 hover:text-white shadow-2xl shadow-rose-600/10 hover:shadow-rose-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                  >
                    {verifying ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <ShieldAlert className="w-6 h-6" />
                        {t("DESATIVAR SEGURANÇA")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recovery Codes Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 rounded-[48px] p-10 md:p-14 max-w-2xl w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500" />
            
            <div className="space-y-10 text-center">
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">{t("CÓDIGOS DE RECUPERAÇÃO")}</h2>
                <p className="text-slate-500 text-sm font-bold leading-relaxed">
                  {t("Guarde estes códigos em um lugar seguro. Eles permitem o acesso se você perder seu dispositivo.")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {recoveryCodes.map((code, i) => (
                  <div key={i} className="bg-black/40 border border-white/5 rounded-2xl py-4 px-6 font-mono text-sm font-bold text-blue-400 text-center tracking-widest">
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => {
                    const text = recoveryCodes.join("\n");
                    navigator.clipboard.writeText(text);
                  }}
                  className="flex-1 h-16 rounded-2xl bg-white/5 border border-white/5 text-slate-300 text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                >
                  <Copy className="w-4 h-4" />
                  {t("COPIAR TUDO")}
                </button>
                <button 
                  onClick={() => setShowRecoveryModal(false)}
                  className="flex-1 h-16 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all"
                >
                  {t("CONCLUÍDO")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
