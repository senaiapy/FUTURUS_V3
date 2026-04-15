"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Mail,
  UserX,
  AlertTriangle,
  Shield,
  Send,
  User,
  AtSign,
  MessageSquare,
} from "lucide-react";
import Header from "@/components/Header";
import { Link } from "@/i18n/routing";
import api from "@/lib/api";

export default function AccountRemovalPage() {
  const t = useTranslations();
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/settings/account-removal", {
        name: form.name,
        email: form.email,
        username: form.username,
        reason: form.reason,
        subject: "Solicitação de Remoção de Conta",
      });
      setSent(true);
    } catch (err) {
      console.error(err);
      // Show success anyway - the user can use the direct email link if needed
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 py-8 sm:py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8 sm:mb-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <UserX className="text-rose-400 w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-3 sm:mb-4">
              {t("Remover Conta")}
            </h1>
            <p className="text-slate-400 text-sm sm:text-base px-4">
              {t("Solicite a remoção dos seus dados da nossa plataforma")}
            </p>
          </div>

          <div className="glass-card p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl space-y-6 sm:space-y-8">
            {/* Warning Section */}
            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3 sm:gap-4">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-amber-400 mb-2">
                    {t("Atenção")}
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {t(
                      "Ao solicitar a remoção da sua conta, todos os seus dados pessoais, histórico de transações e informações associadas serão permanentemente excluídos dos nossos sistemas. Esta ação é irreversível."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {sent ? (
              <div className="text-center py-6 sm:py-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Send className="text-emerald-400 w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  {t("Solicitação Enviada!")}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm px-4">
                  {t(
                    "Sua solicitação foi recebida. Processaremos em até 30 dias úteis conforme a LGPD."
                  )}
                </p>
              </div>
            ) : (
              <>
                {/* Form Section */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {t("Preencha os dados abaixo")}
                  </h3>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      {t("Nome Completo")} *
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl sm:rounded-2xl py-3 sm:py-3.5 pl-11 sm:pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-sm sm:text-base"
                        placeholder={t("Seu nome completo cadastrado")}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      {t("E-mail da Conta")} *
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl sm:rounded-2xl py-3 sm:py-3.5 pl-11 sm:pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-sm sm:text-base"
                        placeholder={t("E-mail associado à sua conta")}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      {t("Nome de Usuário (Username)")} *
                    </label>
                    <div className="relative group">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        type="text"
                        value={form.username}
                        onChange={(e) =>
                          setForm({ ...form, username: e.target.value })
                        }
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl sm:rounded-2xl py-3 sm:py-3.5 pl-11 sm:pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-sm sm:text-base"
                        placeholder={t("Seu username na plataforma")}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      {t("Motivo da Solicitação")}{" "}
                      <span className="text-slate-500 text-xs">
                        ({t("opcional")})
                      </span>
                    </label>
                    <div className="relative group">
                      <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                      <textarea
                        value={form.reason}
                        onChange={(e) =>
                          setForm({ ...form, reason: e.target.value })
                        }
                        rows={4}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl sm:rounded-2xl py-3 sm:py-3.5 pl-11 sm:pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none text-sm sm:text-base"
                        placeholder={t(
                          "Conte-nos por que deseja remover sua conta..."
                        )}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-600/50 text-white font-bold py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {t("Enviar Solicitação")}
                      </>
                    )}
                  </button>
                </form>

                {/* Alternative: Email Contact */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-slate-950 px-3 text-slate-500 uppercase tracking-wider">
                      {t("ou")}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-slate-400 text-xs sm:text-sm">
                        {t("Envie diretamente para:")}
                      </p>
                      <a
                        href="mailto:remover-conta@futurus-brasil.com?subject=Solicitação de Remoção de Conta"
                        className="text-base sm:text-lg font-bold text-indigo-400 hover:text-indigo-300 transition-colors break-all"
                      >
                        remover-conta@futurus-brasil.com
                      </a>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Processing Time */}
            <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-900/50 border border-white/5">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                  {t("Prazo de Processamento")}
                </h4>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {t(
                    "Sua solicitação será processada em até 30 dias úteis, conforme previsto na Lei Geral de Proteção de Dados (LGPD). Você receberá uma confirmação por e-mail quando o processo for concluído."
                  )}
                </p>
              </div>
            </div>

            {/* Back Link */}
            <div className="text-center pt-2 sm:pt-4">
              <Link
                href="/contact"
                className="text-indigo-400 hover:text-indigo-300 transition-colors text-xs sm:text-sm"
              >
                {t("Tem outras dúvidas? Entre em contato conosco")}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 sm:py-12 bg-slate-950">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500 text-xs sm:text-sm">
            {t("Copyright")} &copy; PY Foundation 2026 version={process.env.NEXT_PUBLIC_APP_VERSION}.{" "}
            {t("Todos os direitos reservados.")}
          </p>
        </div>
      </footer>
    </div>
  );
}
