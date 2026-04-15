"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Users,
  Copy,
  Check,
  Share2,
  Gift,
  TrendingUp,
  DollarSign,
  ArrowRight,
  ChevronRight,
  UserPlus,
} from "lucide-react";
import { Decimal } from "decimal.js";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export default function ReferralPage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    if (!session) return;
    try {
      const [profileRes, referralsRes] = await Promise.all([
        api.get("/users/profile", {
          headers: { Authorization: `Bearer ${(session as any).accessToken}` },
        }),
        api.get("/users/referrals", {
          headers: { Authorization: `Bearer ${(session as any).accessToken}` },
        }),
      ]);
      setProfile(profileRes.data);
      setReferrals(referralsRes.data);
    } catch (err) {
      console.error("Failed to fetch referral data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/register?ref=${profile?.username}`
      : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#1a1c2d] tracking-tight">
            {t("Programa de Indicação")}
          </h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            {t(
              "Convide seus amigos e ganhe comissões em cada operação que eles realizarem.",
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Referral Link Card */}
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#3b5bdb]/10 flex items-center justify-center text-[#3b5bdb]">
                  <Gift className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#1a1c2d]">
                    {t("Compartilhe e Ganhe")}
                  </h2>
                  <p className="text-[13px] text-slate-400 font-medium">
                    {t("Seu link exclusivo para convidar novos parceiros.")}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-[24px] bg-slate-50 border border-slate-100 group/input focus-within:border-[#3b5bdb] transition-all shadow-inner">
                  <div className="flex-1 px-5 py-3 font-mono text-[13px] text-slate-500 truncate font-semibold">
                    {referralLink || "Carregando seu link..."}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className={cn(
                      "px-8 py-4 rounded-[18px] font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 shrink-0",
                      copied
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        : "bg-[#3b5bdb] text-white shadow-lg shadow-[#3b5bdb]/20 hover:bg-[#2f49b5]",
                    )}
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? t("Copiado") : t("Copiar Link")}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                    {t("Seu Nível")}
                  </p>
                  <p className="text-[16px] font-black text-[#1a1c2d]">
                    {t("Parceiro Diamante")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                    {t("Taxa de Comissão")}
                  </p>
                  <p className="text-[16px] font-black text-emerald-500">
                    15.0%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                    {t("Total de Indicações")}
                  </p>
                  <p className="text-[16px] font-black text-[#1a1c2d]">
                    {referrals.length} {t("pessoas")}
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute top-0 right-0 w-48 h-48 bg-[#3b5bdb]/5 rounded-bl-[100px] -mr-12 -mt-12" />
          </div>

          {/* Network Table */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-[#1a1c2d] flex items-center gap-3">
                <Users className="w-6 h-6 text-[#3b5bdb]" />
                {t("Minha Rede")}
              </h3>
              <span className="px-5 py-2 rounded-xl bg-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                {referrals.length} {t("Parceiros")}
              </span>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm min-h-[400px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                      {t("Parceiro")}
                    </th>
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                      {t("Data de Adesão")}
                    </th>
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">
                      {t("Volume Total")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={3} className="px-8 py-8">
                          <div className="h-6 bg-slate-50 rounded-xl w-full" />
                        </td>
                      </tr>
                    ))
                  ) : referrals.length > 0 ? (
                    referrals.map((ref) => (
                      <tr
                        key={ref.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-[#3b5bdb]/10 flex items-center justify-center font-black text-[#3b5bdb] uppercase text-[15px]">
                              {ref.username[0]}
                            </div>
                            <div>
                              <p className="text-[14px] font-bold text-[#1a1c2d]">
                                @{ref.username}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                {ref.email.split("@")[0]}***@
                                {ref.email.split("@")[1]}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-[13px] font-medium text-slate-500">
                          {new Date(ref.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6 text-right font-black text-emerald-500">
                          R$0.00
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-8 py-32 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                          <UserPlus className="w-14 h-14 text-slate-300" />
                          <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">
                            {t("Nenhum parceiro ainda")}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Info Card */}
          <div className="bg-[#3b5bdb] p-8 rounded-[40px] text-white shadow-xl shadow-[#3b5bdb]/20 space-y-8 relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-[15px] font-black uppercase tracking-widest">
                    {t("Renda Passiva")}
                  </h4>
                  <p className="text-[11px] text-white/70 font-bold uppercase tracking-widest">
                    {t("Nível Diamante")}
                  </p>
                </div>
              </div>
              <p className="text-[13px] font-medium leading-relaxed text-white/80">
                {t(
                  "Sempre que um usuário indicado por você completa uma operação, você recebe automaticamente uma comissão em seu saldo.",
                )}
              </p>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                  <span>{t("Próxima Meta")}</span>
                  <span>Tier 2</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-[45%] h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                </div>
                <p className="text-[9px] font-bold italic text-white/50 tracking-wider">
                  {t("Faltam 8 novas indicações para o Nível 2")}
                </p>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </div>

          {/* Steps Card */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
            <h4 className="text-[15px] font-black text-[#1a1c2d] uppercase tracking-wider">
              {t("Como funciona?")}
            </h4>
            <div className="space-y-10">
              <div className="flex gap-5">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <span className="text-[14px] font-black text-[#3b5bdb]">
                    1
                  </span>
                </div>
                <p className="text-[13px] font-bold text-slate-500 leading-relaxed pt-1">
                  {t(
                    "Copie seu link exclusivo e compartilhe com seu público ou amigos.",
                  )}
                </p>
              </div>
              <div className="flex gap-5">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <span className="text-[14px] font-black text-[#3b5bdb]">
                    2
                  </span>
                </div>
                <p className="text-[13px] font-bold text-slate-500 leading-relaxed pt-1">
                  {t(
                    "Seus indicados se cadastram e começam a fazer previsões na plataforma.",
                  )}
                </p>
              </div>
              <div className="flex gap-5">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <span className="text-[14px] font-black text-[#3b5bdb]">
                    3
                  </span>
                </div>
                <p className="text-[13px] font-bold text-slate-500 leading-relaxed pt-1">
                  {t(
                    "Você recebe comissões em tempo real diretamente em seu saldo principal.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
