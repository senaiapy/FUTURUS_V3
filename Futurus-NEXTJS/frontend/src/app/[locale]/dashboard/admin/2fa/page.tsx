"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useSession } from "next-auth/react";
import {
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  ShieldAlert,
  ChevronRight,
  QrCode,
  Lock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminTwoFactorPage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null,
  );

  const fetchData = async () => {
    if (!session) return;
    try {
      const res = await api.get("/admin/2fa", {
        headers: { Authorization: `Bearer ${(session as any).accessToken}` },
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch admin 2FA data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  const handleToggle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const endpoint = data?.enabled
        ? "/admin/2fa/disable"
        : "/admin/2fa/enable";
      await api.post(
        endpoint,
        { code, key: data?.secret },
        {
          headers: { Authorization: `Bearer ${(session as any).accessToken}` },
        },
      );
      setMessage({
        type: "success",
        text: data?.enabled
          ? t("2FA desativado com sucesso!")
          : t("2FA ativado com sucesso!"),
      });
      setCode("");
      fetchData();
    } catch (err: any) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message || t("Código de verificação inválido"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (!data?.secret) return;
    navigator.clipboard.writeText(data.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="w-10 h-10 border-4 border-base/20 border-t-base rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10 font-maven text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {t("Segurança Admin 2FA")}
          </h1>
          <p className="text-[13px] text-slate-400 font-medium mt-1">
            {t(
              "Adicione uma camada extra de proteção à sua conta administrativa usando o Google Authenticator.",
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {message && (
            <div
              className={cn(
                "p-6 rounded-[30px] border flex items-center gap-4 animate-in fade-in duration-500",
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400",
              )}
            >
              {message.type === "success" ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <ShieldAlert className="w-6 h-6" />
              )}
              <p className="text-[14px] font-bold">{message.text}</p>
            </div>
          )}

          {!data?.enabled ? (
            <div className="bg-white/5 p-10 rounded-[40px] border border-white/5 shadow-sm space-y-10">
              <div className="flex flex-col md:flex-row gap-10">
                <div className="w-full md:w-1/3 flex flex-col items-center justify-center space-y-4">
                  <div className="p-6 bg-white rounded-[32px] shadow-2xl relative group transition-all hover:shadow-xl hover:shadow-base/20">
                    {data?.qrCodeUrl ? (
                      <img
                        src={data.qrCodeUrl}
                        alt="QR Code"
                        className="w-48 h-48 md:w-56 md:h-56 object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 md:w-56 md:h-56 flex items-center justify-center text-slate-200">
                        <QrCode className="w-16 h-16 animate-pulse" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Smartphone className="w-8 h-8 text-base" />
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                    {t("Escaneie o QR Code")}
                  </p>
                </div>

                <div className="flex-1 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-[16px] font-black text-white uppercase tracking-wider">
                      {t("Configuração Manual")}
                    </h3>
                    <p className="text-[13px] text-slate-400 font-medium leading-relaxed">
                      {t(
                        "Se você não conseguir escanear o código, pode inserir esta chave manualmente no seu aplicativo autenticador.",
                      )}
                    </p>
                    <div className="flex items-center gap-3 p-3 bg-slate-950/50 border border-white/10 rounded-[20px] shadow-inner">
                      <div className="flex-1 px-4 font-mono text-[13px] text-base font-bold truncate">
                        {data?.secret || "••••••••••••••••"}
                      </div>
                      <button
                        onClick={copyToClipboard}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          copied
                            ? "bg-emerald-500 text-white"
                            : "bg-white/5 text-slate-500 hover:text-base border border-white/5 shadow-sm",
                        )}
                      >
                        {copied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleToggle} className="space-y-5">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                        {t("Código de Verificação")}
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-base transition-colors" />
                        <input
                          type="text"
                          maxLength={6}
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          className="w-full bg-slate-950/50 border border-white/10 rounded-[24px] py-5 pl-16 pr-7 text-white text-2xl font-black tracking-[0.4em] focus:outline-none focus:border-base transition-all placeholder:text-slate-800 shadow-inner"
                          placeholder="000000"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || code.length !== 6}
                      className="w-full bg-base hover:opacity-90 disabled:bg-slate-800 text-white py-6 rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-base/20 transition-all flex items-center justify-center gap-4 group"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5" />
                          {t("Ativar Autenticação")}
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 p-10 rounded-[40px] border border-white/5 shadow-sm space-y-8 text-center max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-[32px] flex items-center justify-center mx-auto text-emerald-500 shadow-xl shadow-emerald-500/10">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {t("Sua conta está protegida")}
                </h3>
                <p className="text-[14px] text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                  {t(
                    "A autenticação de dois fatores está ativa. Para desativa-la, insira o código gerado no seu aplicativo autenticador.",
                  )}
                </p>
              </div>

              <form
                onSubmit={handleToggle}
                className="max-w-xs mx-auto space-y-6 pt-6"
              >
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    {t("Código de 6 dígitos")}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-[20px] py-4 text-center text-3xl font-black tracking-[0.3em] text-white focus:outline-none focus:border-rose-500 transition-all shadow-inner"
                    placeholder="000000"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || code.length !== 6}
                  className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-slate-800 text-white py-5 rounded-[20px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-rose-500/20 transition-all flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4" />
                      {t("Desativar Proteção")}
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white/5 p-10 rounded-[40px] text-white shadow-xl border border-white/5 space-y-8 relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <h4 className="text-[16px] font-black uppercase tracking-wider">
                {t("Segurança Máxima")}
              </h4>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-base mt-2 shrink-0 shadow-[0_0_10px_var(--base)]" />
                  <p className="text-[13px] font-medium text-slate-400 leading-relaxed">
                    {t(
                      "Protege as funções administrativas contra acesso não autorizado.",
                    )}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-base mt-2 shrink-0 shadow-[0_0_10px_var(--base)]" />
                  <p className="text-[13px] font-medium text-slate-400 leading-relaxed">
                    {t(
                      "Obrigatório para realizar ações críticas no sistema.",
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button className="w-full py-4 border border-white/10 rounded-[20px] text-[11px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                  {t("Histórico de Acessos")}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-base/5 rounded-full blur-3xl" />
          </div>

          <div className="bg-slate-900/50 p-8 rounded-[40px] border border-white/5 space-y-6">
            <h4 className="text-[14px] font-black text-white uppercase tracking-wider">
              {t("Acesso Mobile")}
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-base rounded-xl flex items-center justify-center text-white">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className="text-[12px] font-bold text-slate-400">
                    {t("Google Authenticator")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
