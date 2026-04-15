"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Wallet,
  ExternalLink,
} from "lucide-react";
import { Decimal } from "decimal.js";
import { blockchainApi } from "@/lib/blockchain/api";
import WalletBalance from "./WalletBalance";

interface BlockchainTradingPanelProps {
  market: any;
  option: any;
}

export default function BlockchainTradingPanel({
  market,
  option,
}: BlockchainTradingPanelProps) {
  const t = useTranslations();
  const { data: session } = useSession();
  const [type, setType] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState<string>("10");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeployed, setIsDeployed] = useState(false);
  const [futBalance, setFutBalance] = useState(0);

  useEffect(() => {
    // Check if market is deployed on blockchain
    const checkDeployment = async () => {
      try {
        const res = await blockchainApi.getBlockchainMarket(market.id);
        setIsDeployed(res.isDeployed);
      } catch {
        setIsDeployed(false);
      }
    };
    if (market?.id) {
      checkDeployment();
    }
  }, [market?.id]);

  const handleTrade = async () => {
    if (!session) {
      setError(t("Please login to trade"));
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      setError(t("Invalid amount"));
      return;
    }

    if (amountNum > futBalance) {
      setError(t("Insufficient FUT balance"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await blockchainApi.placeBet((session as any).accessToken, {
        marketId: market.id,
        isYes: type === "yes",
        amount: amountNum,
      });

      setTxHash(res.txHash);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message || t("Failed to place trade on blockchain")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!option) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-[40px] border border-purple-100">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-purple-300 mx-auto mb-4" />
          <p className="text-purple-500 font-medium">
            {t("Trading not available for this market")}
          </p>
        </div>
      </div>
    );
  }

  if (!isDeployed) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-[40px] border border-purple-100">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-purple-900 mb-2">
            {t("Blockchain Not Available")}
          </h3>
          <p className="text-purple-600 text-sm">
            {t("This market is not yet deployed on Solana blockchain.")}
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-8 rounded-[40px] border border-purple-200 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center shadow-xl shadow-purple-500/20">
          <CheckCircle2 className="text-white w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-purple-900">
          {t("On-Chain Trade Confirmed!")}
        </h3>
        <p className="text-purple-600 text-sm">
          {t("Your position has been recorded on the Solana blockchain.")}
        </p>
        {txHash && (
          <a
            href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-purple-500 hover:text-purple-700 text-sm font-medium"
          >
            {t("View on Solana Explorer")}
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        <button
          onClick={() => {
            setSuccess(false);
            setTxHash(null);
          }}
          className="mt-4 px-6 py-2 rounded-full bg-purple-500 text-white font-bold text-sm"
        >
          {t("Done")}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-[40px] border border-purple-100">
      {/* Wallet Balance */}
      <div className="mb-6">
        <WalletBalance
          compact
          onBalanceChange={(b) => setFutBalance(b.fut)}
        />
      </div>

      {/* YES/NO Selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setType("yes")}
          className={`flex-1 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all ${
            type === "yes"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              : "bg-white/50 text-slate-400 hover:bg-white"
          }`}
        >
          {t("SIM")}
        </button>
        <button
          onClick={() => setType("no")}
          className={`flex-1 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all ${
            type === "no"
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
              : "bg-white/50 text-slate-400 hover:bg-white"
          }`}
        >
          {t("NÃO")}
        </button>
      </div>

      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="text-xs font-bold text-purple-600 uppercase tracking-widest ml-1 mb-2 block">
            {t("FUT Amount")}
          </label>
          <div className="relative group">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white border border-purple-100 rounded-[22px] py-5 px-7 text-[#1a1c2d] text-2xl font-black focus:outline-none focus:border-purple-400 transition-all shadow-inner"
              placeholder="0"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-purple-400 font-bold text-xs uppercase tracking-widest">
              FUT
            </div>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex gap-2">
          {[10, 50, 100, 500].map((val) => (
            <button
              key={val}
              onClick={() => setAmount(val.toString())}
              className="flex-1 py-2 rounded-xl bg-white border border-purple-100 text-purple-600 font-bold text-sm hover:bg-purple-50 transition-colors"
            >
              {val}
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div className="p-5 rounded-[20px] bg-white/80 space-y-3 border border-purple-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-purple-400 font-medium">{t("Network")}</span>
            <span className="text-purple-900 font-bold">Solana (Devnet)</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-purple-400 font-medium">{t("Token")}</span>
            <span className="text-purple-900 font-bold">FUT (Futurus Coin)</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-purple-400 font-medium">
              {t("Available Balance")}
            </span>
            <span className="text-purple-900 font-bold">
              {futBalance.toFixed(2)} FUT
            </span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-rose-500 text-xs bg-rose-50 p-3 rounded-xl border border-rose-200">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button
          onClick={handleTrade}
          disabled={loading || !amount || parseFloat(amount) <= 0}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl ${
            type === "yes"
              ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-emerald-500/20"
              : "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-rose-500/20"
          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <TrendingUp className="w-5 h-5" />
              {t("Trade on Solana")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
