"use client";

import { useTranslations } from "next-intl";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPage() {
  const t = useTranslations();

  return (
    <div className="font-maven text-slate-50 min-h-screen bg-slate-950">
      <section className="relative py-32 overflow-hidden border-b border-white/5">
        <div className="container mx-auto px-4 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
            <Shield className="w-4 h-4" />
            {t("Segurança em Primeiro Lugar")}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
            {t("Política de Privacidade")}
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg leading-relaxed">
            {t(
              "Sua privacidade é nossa prioridade absoluta. Entenda como protegemos seus dados e garantimos sua anonimidade.",
            )}
          </p>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent -z-1" />
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-4 hover:border-blue-500/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {t("Proteção de Dados")}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {t("privacy.protection.description")}
              </p>
            </div>
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-4 hover:border-emerald-500/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {t("Transparência Total")}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {t("privacy.transparency.description")}
              </p>
            </div>
          </div>

          <div className="prose prose-invert prose-slate max-w-none space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-blue-600 pl-6">
                1. {t("Coleta de Informações")}
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                {t("privacy.collection.description")}
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-blue-600 pl-6">
                2. {t("Uso de Dados")}
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                {t("privacy.usage.description")}
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-blue-600 pl-6">
                3. {t("Compartilhamento")}
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                {t("privacy.sharing.description")}
              </p>
            </div>

            <div className="p-10 rounded-[3rem] bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/5 text-center space-y-6 mt-20">
              <div className="w-16 h-16 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-600/40">
                <FileText className="text-white w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {t("Dúvidas sobre sua Privacidade?")}
              </h3>
              <p className="text-slate-400 max-w-md mx-auto">
                {t("privacy.questions.description")}
              </p>
              <a
                href="mailto:privacy@futurus.com"
                className="inline-block px-10 py-4 bg-white text-slate-950 rounded-full font-bold hover:scale-105 transition-transform"
              >
                {t("Contate a Equipe DPO")}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
