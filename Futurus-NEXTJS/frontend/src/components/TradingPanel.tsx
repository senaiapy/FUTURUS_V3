"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { Decimal } from "decimal.js";
import api from "@/lib/api";
import { useSession } from "next-auth/react";

interface TradingPanelProps {
  market: any;
  option: any;
}

export default function TradingPanel({ market, option }: TradingPanelProps) {
  const t = useTranslations();
  const { data: session } = useSession();
  const [type, setType] = useState<"yes" | "no">("yes");
  const [shares, setShares] = useState<string>("10");
  const [calcs, setCalcs] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalcs = async () => {
      if (!shares || parseFloat(shares) <= 0 || !option?.id) return;
      try {
        const res = await api.get(`/markets/calculations/${option.id}`, {
          params: { shares, type },
        });
        setCalcs(res.data);
      } catch (err) {
        console.error("Failed to fetch calculations", err);
      }
    };
    const timer = setTimeout(fetchCalcs, 300);
    return () => clearTimeout(timer);
  }, [shares, type, option?.id]);

  const handleTrade = async () => {
    if (!session) {
      setError(t("Please login to trade"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post(
        "/purchases",
        {
          optionId: option.id,
          type,
          shares: parseFloat(shares),
        },
        {
          headers: { Authorization: `Bearer ${(session as any).accessToken}` },
        },
      );
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t("Failed to place trade"));
    } finally {
      setLoading(false);
    }
  };

  // Guard against null option
  if (!option) {
    return (
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            {t("Trading not available for this market")}
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="glass-card p-8 rounded-3xl text-center flex flex-col items-center gap-4 bg-emerald-500/10 border-emerald-500/20">
        <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="text-white w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">
          {t("Purchase Successful!")}
        </h3>
        <p className="text-slate-400 text-sm">
          {t("Your shares have been added to your dashboard.")}
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 px-6 py-2 rounded-full bg-emerald-500 text-white font-bold text-sm"
        >
          {t("Done")}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40">
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setType("yes")}
          className={`flex-1 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all ${
            type === "yes"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
          }`}
        >
          {t("SIM")}
        </button>
        <button
          onClick={() => setType("no")}
          className={`flex-1 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all ${
            type === "no"
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
          }`}
        >
          {t("NÃO")}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">
            {t("Quantity of Shares")}
          </label>
          <div className="relative group">
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-[22px] py-5 px-7 text-[#1a1c2d] text-2xl font-black focus:outline-none focus:border-[#3b5bdb] transition-all shadow-inner"
              placeholder="0"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase tracking-widest">
              {t("Cotas")}
            </div>
          </div>
        </div>

        {calcs && (
          <div className="p-7 rounded-[28px] bg-slate-50 space-y-4 border border-slate-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">
                {t("Investimento Total")}
              </span>
              <span className="text-[#1a1c2d] font-black">
                R${new Decimal(calcs.totalAmount || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">
                {t("Preço da Cota")}
              </span>
              <span className="text-[#1a1c2d] font-black">
                R$
                {new Decimal(
                  (type === "yes" ? calcs.yesSharePrice : calcs.noSharePrice) ||
                    0,
                ).toFixed(4)}
              </span>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">
                {t("Retorno Potencial")}
              </span>
              <span
                className={`text-xl font-black ${type === "yes" ? "text-emerald-500" : "text-rose-500"}`}
              >
                R$
                {new Decimal(
                  (type === "yes"
                    ? calcs.yesPayoutIfWin
                    : calcs.noPayoutIfWin) || 0,
                ).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button
          onClick={handleTrade}
          disabled={loading || !shares || parseFloat(shares) <= 0}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl ${
            type === "yes"
              ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
              : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"
          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <TrendingUp className="w-5 h-5" />
              {t("Submit Prediction")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
