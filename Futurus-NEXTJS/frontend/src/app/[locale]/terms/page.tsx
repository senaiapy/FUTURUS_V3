"use client";

import { useTranslations } from "next-intl";
import { FileText, ShieldAlert, CheckCircle, Scale } from "lucide-react";

export default function TermsPage() {
  const t = useTranslations();

  return (
    <div className="font-maven text-slate-50 min-h-screen bg-slate-950">
      <section className="relative py-32 overflow-hidden border-b border-white/5">
        <div className="container mx-auto px-4 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Scale className="w-4 h-4" />
            {t("Acordo Legal")}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
            {t("Termos de Serviço")}
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg leading-relaxed">
            {t(
              "Ao acessar o Futurus, você concorda com os termos abaixo. Por favor, leia com atenção todos os pontos deste acordo.",
            )}
          </p>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent -z-1" />
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 text-center md:text-left">
            <div className="space-y-4 p-8 bg-white/5 border border-white/5 rounded-[2.5rem]">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 mx-auto md:mx-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                {t("Uso Legítimo")}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                A plataforma deve ser utilizada apenas para fins lícitos de
                previsão de mercado e interação comunitária. Qualquer uso
                malicioso resultará em banimento imediato.
              </p>
            </div>
            <div className="space-y-4 p-8 bg-white/5 border border-white/5 rounded-[2.5rem]">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 mx-auto md:mx-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                {t("Responsabilidade")}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                A Futurus não se responsabiliza por perdas financeiras
                decorrentes de previsões de mercado incorretas ou flutuações de
                ativos.
              </p>
            </div>
          </div>

          <div className="prose prose-invert prose-emerald max-w-none space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-emerald-600 pl-6">
                1. {t("Elegibilidade")}
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed font-medium">
                O uso da plataforma é restrito a maiores de 18 anos ou idade
                legal permitida em seu país. É sua responsabilidade verificar se
                o uso de mercados de previsão é legal em sua jurisdição.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-emerald-600 pl-6">
                2. {t("Contas de Usuário")}
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Você é o único responsável por manter a segurança de sua conta e
                senha. Recomendamos o uso de autenticação de dois fatores (2FA)
                em todos os acessos.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-emerald-600 pl-6">
                3. {t("Mercados e Resoluções")}
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                As resoluções de cada mercado são baseadas em fontes de dados
                oficiais ou oracles descentralizados. Uma vez resolvido, o
                resultado é final e irreversível.
              </p>
            </div>

            <div className="p-10 rounded-[3rem] bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border border-white/5 text-center space-y-6 mt-20">
              <div className="w-16 h-16 bg-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-emerald-600/40 transform -rotate-12">
                <FileText className="text-white w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {t("Aceita os nossos Termos?")}
              </h3>
              <p className="text-slate-400 max-w-md mx-auto">
                Ao continuar utilizando nossos serviços, você confirma que leu e
                concorda com todos os termos descritos acima.
              </p>
              <div className="pt-4">
                <span className="inline-block px-10 py-4 bg-emerald-600 text-white rounded-full font-black text-xs uppercase tracking-widest cursor-default">
                  {t("Acordo Ativo")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
