"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Wallet,
  ArrowUpCircle,
  Plus,
  Zap,
  Globe,
  ChevronRight,
  History,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { Decimal } from "decimal.js";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";

export default function WithdrawPage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [methods, setMethods] = useState<any[]>([
    { id: 1, name: "Crypto Payout", icon: Zap, rate: 1, delay: "24h" },
    { id: 2, name: "Pix / Transfer", icon: Globe, rate: 1, delay: "2h-24h" },
  ]);
  const [amount, setAmount] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const fetchData = async () => {
    if (!session) return;
    try {
      const [historyRes, profileRes] = await Promise.all([
        api.get("/withdrawals/history", {
          headers: { Authorization: `Bearer ${(session as any).accessToken}` },
        }),
        api.get("/users/profile", {
          headers: { Authorization: `Bearer ${(session as any).accessToken}` },
        }),
      ]);
      setHistory(historyRes.data);
      setProfile(profileRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    if (parseFloat(amount) > (profile?.balance || 0)) {
      alert(t("Saldo insuficiente."));
      return;
    }

    setLoading(true);
    try {
      await api.post(
        "/withdrawals",
        {
          amount: parseFloat(amount),
          methodId: selectedMethod,
        },
        {
          headers: { Authorization: `Bearer ${(session as any).accessToken}` },
        },
      );
      setAmount("");
      fetchData();
      alert(t("Withdrawal request submitted successfully."));
    } catch (err) {
      console.error("Failed to withdraw", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#1a1c2d] tracking-tight">
            {t("Retirada")}
          </h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            {t(
              "Saque seus ganhos diretamente para sua conta preferida de forma segura.",
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
            <div className="bg-slate-50 p-7 rounded-[32px] border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                  {t("Saldo Disponível")}
                </p>
                <h2 className="text-3xl font-black text-[#1a1c2d] mt-1">
                  R${new Decimal(profile?.balance || 0).toFixed(2)}
                </h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#3b5bdb]">
                <Wallet className="w-7 h-7" />
              </div>
            </div>

            <div className="space-y-5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                {t("1. Selecione o Método de Saque")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    className={cn(
                      "p-6 rounded-[24px] border transition-all flex items-center gap-4 text-left group",
                      selectedMethod === m.id
                        ? "bg-[#3b5bdb] border-[#3b5bdb] text-white shadow-xl shadow-[#3b5bdb]/20"
                        : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200",
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                        selectedMethod === m.id
                          ? "bg-white/20"
                          : "bg-white border border-slate-100",
                      )}
                    >
                      <m.icon
                        className={cn(
                          "w-6 h-6",
                          selectedMethod === m.id
                            ? "text-white"
                            : "text-slate-400",
                        )}
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-widest block">
                        {m.name}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] font-bold uppercase mt-1 block",
                          selectedMethod === m.id
                            ? "text-white/70"
                            : "text-slate-400",
                        )}
                      >
                        {m.delay}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                {t("2. Digite o Valor do Saque")}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none text-[#1a1c2d] font-black text-xl">
                  R$
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-6 pl-16 pr-8 text-[#1a1c2d] text-2xl font-black focus:outline-none focus:border-[#3b5bdb] focus:bg-white transition-all placeholder:text-slate-300 shadow-inner"
                  placeholder="0,00"
                />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-amber-500 font-black uppercase tracking-widest ml-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t("Valor mínimo de saque é R$50.00")}
              </div>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={loading || !amount || parseFloat(amount) < 50}
              className="w-full bg-[#3b5bdb] hover:bg-[#2f49b5] disabled:bg-slate-200 disabled:cursor-not-allowed text-white py-6 rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-[#3b5bdb]/20 transition-all flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowUpRight className="w-5 h-5" />
                  {t("Solicitar Saque")}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#1a1c2d]">
              {t("Saques Recentes")}
            </h2>
            <Link
              href="/dashboard/transactions"
              className="text-[11px] font-black text-[#3b5bdb] uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              {t("Ver Tudo")}
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm min-h-[400px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                      {t("Transação")}
                    </th>
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                      {t("Valor")}
                    </th>
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">
                      {t("Status")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {history.length > 0 ? (
                    history.map((h) => (
                      <tr
                        key={h.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                              {h.methodId === 1 ? (
                                <Zap className="w-4 h-4" />
                              ) : (
                                <Globe className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                {h.trx}
                              </p>
                              <p className="text-[13px] font-bold text-[#1a1c2d]">
                                {new Date(
                                  h.createdAt || "",
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[15px] font-black text-rose-500">
                            - R${new Decimal(h.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span
                            className={cn(
                              "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                              h.status === 1
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : h.status === 2
                                  ? "bg-amber-50 text-amber-600 border-amber-100"
                                  : "bg-rose-50 text-rose-600 border-rose-100",
                            )}
                          >
                            {h.status === 1
                              ? t("Aprovado")
                              : h.status === 2
                                ? t("Pendente")
                                : t("Rejeitado")}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-8 py-32 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                          <History className="w-12 h-12 text-slate-300" />
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {t("Nenhum saque realizado")}
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
      </div>
    </div>
  );
}
