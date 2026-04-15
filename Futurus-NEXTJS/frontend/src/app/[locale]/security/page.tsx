"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck, Lock, Fingerprint, Activity } from "lucide-react";

export default function SecurityPage() {
  const t = useTranslations();

  return (
    <div className="font-maven text-slate-50 min-h-screen bg-slate-950">
      <section className="relative py-32 overflow-hidden border-b border-white/5">
        <div className="container mx-auto px-4 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Lock className="w-4 h-4" />
            {t("Segurança de Nível Bancário")}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
            {t("Política de Segurança")}
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg leading-relaxed">
            {t(
              "Protegemos seus ativos e sua identidade com tecnologias de ponta e auditorias constantes. Conheça nossos pilares de proteção.",
            )}
          </p>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent -z-1" />
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 text-center">
            <div className="space-y-4 p-8 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                {t("Auditoria")}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed font-bold uppercase">
                {t(
                  "Realizamos testes de segurança mensais em toda a nossa infraestrutura.",
                )}
              </p>
            </div>
            <div className="space-y-4 p-8 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 mx-auto">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                {t("2FA")}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed font-bold uppercase">
                {t(
                  "Autenticação multifator obrigatória para operações sensíveis.",
                )}
              </p>
            </div>
            <div className="space-y-4 p-8 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20 mx-auto">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                {t("Monitoria")}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed font-bold uppercase">
                {t(
                  "Detecção de anomalias em tempo real baseada em IA e padrões de uso.",
                )}
              </p>
            </div>
          </div>

          <div className="prose prose-invert prose-amber max-w-none space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-amber-600 pl-6 uppercase tracking-tighter">
                1. {t("Nossa Infraestrutura")}
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed font-medium">
                Operamos em servidores isolados com firewalls de última geração.
                O acesso físico e digital aos nossos sistemas centrais é
                restrito e monitorado 24/7 por especialistas de segurança.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-amber-600 pl-6 uppercase tracking-tighter">
                2. {t("Proteção de Fundos")}
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                98% dos ativos digitais são mantidos em câmaras frias (cold
                wallets), garantindo que um ataque direto aos servidores não
                comprometa a liquidez dos nossos usuários.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-amber-600 pl-6 uppercase tracking-tighter">
                3. {t("Denúncia de Vulnerabilidades")}
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Mantemos um programa de recompensas (Bug Bounty) para hackers
                éticos que identifiquem e reportem falhas de segurança em nossa
                plataforma antes que sejam exploradas.
              </p>
            </div>

            <div className="p-12 rounded-[3.5rem] bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-white/5 text-center mt-20 relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                <h3 className="text-3xl font-bold text-white tracking-tight">
                  {t("Viu algo suspeito?")}
                </h3>
                <p className="text-slate-400 max-w-md mx-auto italic font-medium">
                  "
                  {t(
                    "A segurança é uma responsabilidade compartilhada. Ajude-nos a manter a Futurus segura para todos.",
                  )}
                  "
                </p>
                <div className="pt-4">
                  <a
                    href="mailto:security@futurus.com"
                    className="inline-flex items-center gap-3 px-12 py-5 bg-amber-600 text-white rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-amber-600/30"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    {t("Reportar Incidente")}
                  </a>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-amber-600/5 blur-[80px] group-hover:bg-amber-600/10 transition-all pointer-events-none" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
