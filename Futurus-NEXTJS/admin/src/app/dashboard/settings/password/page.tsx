"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  ShieldCheck,
} from "lucide-react";
import { Card, Button } from "@/components/ui/PremiumUI";

export default function PasswordSettingsPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<{
    name?: string;
    username?: string;
    email?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const adminUser = localStorage.getItem("admin_user");
    if (!token) {
      router.push("/");
      return;
    }
    if (adminUser) {
      setAdmin(JSON.parse(adminUser));
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: "As senhas não coincidem." });
      return;
    }

    if (form.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "A nova senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }

    const token = localStorage.getItem("admin_token");
    setLoading(true);

    try {
      await api.post(
        "/admin/change-password",
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessage({ type: "success", text: "Senha alterada com sucesso!" });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Erro ao alterar senha. Verifique a senha atual.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Configuração de Senha
          </h1>
          <p className="text-slate-500 font-bold mt-2">
            Altere sua senha de administrador
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Admin Profile Card */}
        <Card className="p-8 border-white/5 bg-[#141726]/40 flex flex-col items-center text-center col-span-1">
          <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-6">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-black text-white">
            {admin?.name || "Super Admins"}
          </h3>
          <div className="mt-4 space-y-3 w-full text-left">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                Nome
              </span>
              <span className="text-[13px] font-bold text-white">
                {admin?.name || "Super Admins"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                Nome de Usuário
              </span>
              <span className="text-[13px] font-bold text-white">
                {admin?.username || "admin"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                E-mail
              </span>
              <span className="text-[13px] font-bold text-white truncate max-w-[180px]">
                {admin?.email || "admin@futurus.com"}
              </span>
            </div>
          </div>
        </Card>

        {/* Password Change Form */}
        <Card className="p-8 border-white/5 bg-[#141726]/40 col-span-1 lg:col-span-2">
          <h2 className="text-xl font-black text-white mb-8">Alterar Senha</h2>

          {message && (
            <div
              className={`mb-6 px-6 py-4 rounded-2xl text-[12px] font-bold ${
                message.type === "success"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-white mb-3">
                Senha <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.currentPassword}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 pr-14 text-white text-sm focus:outline-none focus:border-indigo-500/40 transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-white mb-3">
                Nova Senha <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 pr-14 text-white text-sm focus:outline-none focus:border-indigo-500/40 transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-white mb-3">
                Confirmar Senha <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 pr-14 text-white text-sm focus:outline-none focus:border-indigo-500/40 transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                icon={Save}
                loading={loading}
                className="w-full rounded-2xl h-14 bg-indigo-600 shadow-xl shadow-indigo-600/30 text-sm"
              >
                Enviar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
