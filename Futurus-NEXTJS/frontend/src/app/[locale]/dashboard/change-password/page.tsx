"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useState } from "react";
import api from "@/lib/api";
import { useSession } from "next-auth/react";
import {
  Lock,
  Save,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChangePasswordPage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: t("As senhas não coincidem") });
      return;
    }
    if (form.newPassword.length < 8) {
      setMessage({
        type: "error",
        text: t("A senha deve ter pelo menos 8 caracteres"),
      });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await api.post(
        "/users/change-password",
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${(session as any).accessToken}` },
        },
      );
      setMessage({ type: "success", text: t("Senha alterada com sucesso!") });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || t("Erro ao alterar senha"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#1a1c2d] tracking-tight">
            {t("Alterar Senha")}
          </h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            {t(
              "Garanta a segurança da sua conta atualizando sua senha periodicamente.",
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8 animate-in fade-in duration-500"
          >
            {message && (
              <div
                className={cn(
                  "p-6 rounded-[24px] flex items-center gap-4",
                  message.type === "success"
                    ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
                    : "bg-rose-50 border border-rose-100 text-rose-700",
                )}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                ) : (
                  <ShieldAlert className="w-6 h-6 shrink-0" />
                )}
                <p className="text-[14px] font-bold">{message.text}</p>
              </div>
            )}

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  {t("Senha Atual")}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#3b5bdb] transition-colors" />
                  <input
                    type="password"
                    value={form.currentPassword}
                    onChange={(e) =>
                      setForm({ ...form, currentPassword: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 pl-16 pr-7 text-[#1a1c2d] font-bold focus:outline-none focus:border-[#3b5bdb] focus:bg-white transition-all shadow-inner"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  {t("Nova Senha")}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#3b5bdb] transition-colors" />
                  <input
                    type="password"
                    value={form.newPassword}
                    onChange={(e) =>
                      setForm({ ...form, newPassword: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 pl-16 pr-7 text-[#1a1c2d] font-bold focus:outline-none focus:border-[#3b5bdb] focus:bg-white transition-all shadow-inner"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  {t("Confirmar Nova Senha")}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#3b5bdb] transition-colors" />
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 pl-16 pr-7 text-[#1a1c2d] font-bold focus:outline-none focus:border-[#3b5bdb] focus:bg-white transition-all shadow-inner"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3b5bdb] hover:bg-[#2f49b5] disabled:bg-slate-200 text-white py-6 rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-[#3b5bdb]/20 transition-all flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {t("Atualizar Senha")}
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-8">
          <div className="bg-amber-50 p-8 rounded-[40px] border border-amber-100 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-[15px] font-black text-amber-900 uppercase tracking-widest mb-3">
                {t("Dica de Segurança")}
              </h4>
              <p className="text-[13px] text-amber-800/70 font-medium leading-relaxed">
                {t(
                  "Uma senha forte deve conter letras maiúsculas, minúsculas, números e caracteres especiais. Evite usar informações pessoais como datas de nascimento.",
                )}
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-[15px] font-black text-[#1a1c2d] uppercase tracking-wider">
              {t("Links Rápidos")}
            </h3>
            <div className="space-y-3">
              <Link
                href="/dashboard/profile"
                className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:border-[#3b5bdb]/20 transition-all group"
              >
                <span className="text-[13px] font-bold text-slate-500 group-hover:text-[#3b5bdb]">
                  {t("Editar Perfil")}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </Link>
              <Link
                href="/dashboard/transactions"
                className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:border-[#3b5bdb]/20 transition-all group"
              >
                <span className="text-[13px] font-bold text-slate-500 group-hover:text-[#3b5bdb]">
                  {t("Ver Atividade")}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
