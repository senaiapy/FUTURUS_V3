"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Wallet, RefreshCw, Copy, Check, ExternalLink } from "lucide-react";
import { blockchainApi, SolanaWallet } from "@/lib/blockchain/api";

interface WalletBalanceProps {
  onBalanceChange?: (balance: { sol: number; fut: number }) => void;
  compact?: boolean;
}

export default function WalletBalance({
  onBalanceChange,
  compact = false,
}: WalletBalanceProps) {
  const t = useTranslations();
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<(SolanaWallet & { hasWallet: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    if (!session) return;
    try {
      setLoading(true);
      const data = await blockchainApi.getWallet((session as any).accessToken);
      setWallet(data as any);
      if (data.hasWallet && onBalanceChange) {
        onBalanceChange({
          sol: data.solBalance || 0,
          fut: data.futBalance || 0,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t("Failed to load wallet"));
    } finally {
      setLoading(false);
    }
  }, [session, onBalanceChange, t]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const syncBalances = async () => {
    if (!session) return;
    try {
      setSyncing(true);
      const data = await blockchainApi.syncBalances((session as any).accessToken);
      setWallet((prev) =>
        prev
          ? { ...prev, solBalance: data.solBalance, futBalance: data.futBalance }
          : null
      );
      if (onBalanceChange) {
        onBalanceChange({ sol: data.solBalance, fut: data.futBalance });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t("Failed to sync balances"));
    } finally {
      setSyncing(false);
    }
  };

  const copyAddress = () => {
    if (wallet?.publicKey) {
      navigator.clipboard.writeText(wallet.publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const createWallet = async () => {
    if (!session) return;
    try {
      setLoading(true);
      await blockchainApi.createWallet((session as any).accessToken);
      await fetchWallet();
    } catch (err: any) {
      setError(err.response?.data?.message || t("Failed to create wallet"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-slate-100 ${compact ? "p-3" : "p-6"}`}>
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-purple-500 rounded-full animate-spin" />
          {!compact && <span>{t("Loading wallet...")}</span>}
        </div>
      </div>
    );
  }

  if (!wallet?.hasWallet) {
    return (
      <div className={`bg-white rounded-2xl border border-slate-100 ${compact ? "p-3" : "p-6"}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">{t("No Solana Wallet")}</h3>
          <p className="text-sm text-slate-500 mb-4">
            {t("Create a wallet to start trading with FUT tokens on Solana.")}
          </p>
          <button
            onClick={createWallet}
            className="px-6 py-3 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600 transition-colors"
          >
            {t("Create Wallet")}
          </button>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">F</span>
          </div>
          <span className="font-bold text-purple-700">
            {(wallet.futBalance || 0).toFixed(2)} FUT
          </span>
        </div>
        <div className="w-px h-4 bg-slate-300" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="font-bold text-slate-700">
            {(wallet.solBalance || 0).toFixed(4)} SOL
          </span>
        </div>
        <button
          onClick={syncBalances}
          disabled={syncing}
          className="ml-auto p-1 hover:bg-white/50 rounded-full transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-purple-600 ${syncing ? "animate-spin" : ""}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{t("Solana Wallet")}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">
                {wallet.publicKey?.slice(0, 6)}...{wallet.publicKey?.slice(-4)}
              </span>
              <button onClick={copyAddress} className="hover:text-purple-600 transition-colors">
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>
              <a
                href={`https://explorer.solana.com/address/${wallet.publicKey}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-600 transition-colors"
              >
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
        <button
          onClick={syncBalances}
          disabled={syncing}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-slate-600 ${syncing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">F</span>
            </div>
            <span className="text-xs font-bold text-purple-600 uppercase">FUT Token</span>
          </div>
          <div className="text-2xl font-black text-purple-700">
            {(wallet.futBalance || 0).toFixed(2)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-xs font-bold text-blue-600 uppercase">SOL</span>
          </div>
          <div className="text-2xl font-black text-blue-700">
            {(wallet.solBalance || 0).toFixed(4)}
          </div>
        </div>
      </div>

      {wallet.isCustodial && (
        <div className="text-xs text-slate-500 text-center">
          {t("This is a custodial wallet managed by Futurus")}
        </div>
      )}

      {error && (
        <div className="text-xs text-rose-500 text-center bg-rose-50 p-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
