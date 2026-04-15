"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  CreditCard,
  Plus,
  Zap,
  Globe,
  ChevronRight,
  History,
  Wallet,
} from "lucide-react";
import { Decimal } from "decimal.js";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";

export default function DepositPage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [methods, setMethods] = useState<any[]>([
    { id: 1, name: "Crypto Transfer", icon: Zap, rate: 1, delay: "Instant", code: 1 },
    { id: 2, name: "Pix / Card", icon: CreditCard, rate: 1, delay: "1-5 min", code: 2 },
    { id: 3, name: "Manual Bank", icon: Globe, rate: 1, delay: "24h", code: 3 },
  ]);
  const [paypalAvailable, setPaypalAvailable] = useState(false);
  const [stripeAvailable, setStripeAvailable] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    if (!session) return;
    try {
      const res = await api.get("/deposits/history", {
        headers: {
          Authorization: `Bearer ${(session as any).accessToken}`,
        },
      });
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchPaymentMethods();
  }, [session]);

  const fetchPaymentMethods = async () => {
    if (!session) return;
    try {
      // Check PayPal availability
      const paypalRes = await api.get("/paypal/methods", {
        headers: {
          Authorization: `Bearer ${(session as any).accessToken}`,
        },
      });
      if (paypalRes.data.success && paypalRes.data.data.available) {
        setPaypalAvailable(true);
        setMethods((prev) => [
          ...prev,
          {
            id: 201,
            name: "PayPal",
            icon: Wallet,
            rate: 1,
            delay: "Instant",
            code: 201,
          },
        ]);
      }

      // Check Stripe availability
      const stripeRes = await api.get("/stripe/methods", {
        headers: {
          Authorization: `Bearer ${(session as any).accessToken}`,
        },
      });
      if (stripeRes.data.success && stripeRes.data.data.available) {
        setStripeAvailable(true);
        setMethods((prev) => [
          ...prev,
          {
            id: 202,
            name: "Stripe",
            icon: CreditCard,
            rate: 1,
            delay: "Instant",
            code: 202,
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch payment methods", err);
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    try {
      // Handle PayPal separately
      if (selectedMethod === 201) {
        const res = await api.post(
          "/paypal/deposit/create",
          {
            amount: parseFloat(amount),
          },
          {
            headers: {
              Authorization: `Bearer ${(session as any).accessToken}`,
            },
          },
        );
        if (res.data.success && res.data.data.approvalUrl) {
          // Redirect to PayPal
          window.location.href = res.data.data.approvalUrl;
        }
        return;
      }

      // Handle Stripe separately
      if (selectedMethod === 202) {
        const res = await api.post(
          "/stripe/deposit/create-session",
          {
            amount: parseFloat(amount),
          },
          {
            headers: {
              Authorization: `Bearer ${(session as any).accessToken}`,
            },
          },
        );
        if (res.data.success && res.data.data.sessionUrl) {
          // Redirect to Stripe Checkout
          window.location.href = res.data.data.sessionUrl;
        }
        return;
      }

      // Handle other methods
      await api.post(
        "/deposits",
        {
          amount: parseFloat(amount),
          methodCode: selectedMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${(session as any).accessToken}`,
          },
        },
      );
      setAmount("");
      fetchHistory();
      alert(t("Deposit request submitted successfully."));
    } catch (err) {
      console.error("Failed to deposit", err);
      alert(t("Failed to process deposit. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {t("Adicionar Saldo")}
          </h1>
          <p className="text-[13px] text-slate-400 font-medium mt-1">
            {t(
              "Escolha o método preferido para financiar sua conta e começar a investir.",
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 shadow-sm space-y-8">
            <div className="space-y-5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                {t("1. Selecione o Método")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    className={cn(
                      "p-6 rounded-[24px] border transition-all flex flex-col items-center gap-4 group relative overflow-hidden",
                      selectedMethod === m.id
                        ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20"
                        : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10",
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                        selectedMethod === m.id
                          ? "bg-white/20"
                          : "bg-white/5 border border-white/5",
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
                    <div className="text-center">
                      <span className="text-[10px] font-black uppercase tracking-widest block">
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
                {t("2. Digite o Valor")}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none text-white font-black text-xl">
                  R$
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-[24px] py-6 pl-16 pr-8 text-white text-2xl font-black focus:outline-none focus:border-blue-600 focus:bg-white/10 transition-all placeholder:text-slate-600 shadow-inner"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="p-8 rounded-[32px] bg-white/5 border border-white/5 space-y-4">
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                <span className="text-slate-500">
                  {t("Limite de Depósito")}
                </span>
                <span className="text-slate-200">R$10.00 - R$50,000.00</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                <span className="text-slate-500">{t("Taxa (0%)")}</span>
                <span className="text-emerald-500">R$0.00</span>
              </div>
              <div className="pt-4 mt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  {t("Você receberá")}
                </span>
                <span className="text-2xl font-black text-blue-500">
                  R${amount || "0,00"}
                </span>
              </div>
            </div>

            <button
              onClick={handleDeposit}
              disabled={loading || !amount}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 disabled:text-slate-600 disabled:cursor-not-allowed text-white py-6 rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  {t("Confirmar Depósito")}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">
              {t("Histórico Recente")}
            </h2>
            <Link
              href="/dashboard/transactions"
              className="text-[11px] font-black text-blue-500 uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              {t("Ver Tudo")}
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white/5 rounded-[40px] border border-white/5 overflow-hidden shadow-sm min-h-[400px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">
                      {t("Transação")}
                    </th>
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">
                      {t("Valor")}
                    </th>
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500 text-right">
                      {t("Status")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.length > 0 ? (
                    history.map((h) => (
                      <tr
                        key={h.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                              {h.methodCode === 1 ? (
                                <Zap className="w-4 h-4 text-amber-500" />
                              ) : h.methodCode === 201 ? (
                                <Wallet className="w-4 h-4 text-blue-500" />
                              ) : h.methodCode === 202 ? (
                                <CreditCard className="w-4 h-4 text-purple-500" />
                              ) : (
                                <CreditCard className="w-4 h-4 text-[#3b5bdb]" />
                              )}
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                {h.trx}
                              </p>
                              <p className="text-[13px] font-bold text-slate-300">
                                {new Date(h.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[15px] font-black text-white">
                            R${new Decimal(h.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span
                            className={cn(
                              "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                              h.status === 1
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : h.status === 2
                                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-500 border-rose-500/20",
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
                            {t("Nenhuma transação")}
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
