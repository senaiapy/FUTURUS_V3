"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Link, useRouter } from "@/i18n/routing";
import { Users, ArrowLeft, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface GroupPreview {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  isPublic: boolean;
  currentLiquidity: number;
  targetLiquidity: number;
  minContribution: number;
  maxContribution: number | null;
  memberCount: number;
  market: { id: number; question: string; slug: string };
  creator: { id: number; username: string };
}

export default function JoinGroupByCodePage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [group, setGroup] = useState<GroupPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [memberChosenOutcome, setMemberChosenOutcome] = useState<"YES" | "NO" | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchGroupByCode();
  }, [params.code]);

  const fetchGroupByCode = async () => {
    try {
      const response = await api.get(`/groups/invite/${params.code}`);
      // The API returns { invitation, group } structure
      setGroup(response.data.group || response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || t("Código de convite inválido ou expirado"));
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async () => {
    if (!contributionAmount || !group || !memberChosenOutcome) return;
    setJoining(true);
    setError(null);
    try {
      // Use the invite accept endpoint for private groups with invite codes
      await api.post(`/groups/invite/${params.code}/accept`, {
        contributionAmount: parseFloat(contributionAmount),
        memberChosenOutcome,
      }, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });
      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/groups/${group.slug}`);
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || t("Falha ao entrar no grupo"));
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && !group) {
    return (
      <div className="max-w-md mx-auto mt-12 px-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">{t("Convite Inválido")}</h2>
          <p className="text-gray-400 mb-4 text-sm">{error}</p>
          <Link
            href="/dashboard/groups"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("Voltar para Grupos")}
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12 px-4">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">{t("Entrada Realizada!")}</h2>
          <p className="text-gray-400">{t("Redirecionando para a página do grupo...")}</p>
        </div>
      </div>
    );
  }

  if (!group) return null;

  const progress = (group.currentLiquidity / group.targetLiquidity) * 100;

  return (
    <div className="max-w-lg mx-auto mt-4 sm:mt-8 px-4 sm:px-0">
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-white truncate">{group.name}</h1>
              <p className="text-gray-400 text-sm">{t("Convite para Grupo Privado")}</p>
            </div>
          </div>
          {group.description && (
            <p className="text-gray-300 text-sm">{group.description}</p>
          )}
        </div>

        {/* Group Info */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Market */}
          <div>
            <p className="text-gray-400 text-sm mb-1">{t("Mercado")}</p>
            <p className="text-white text-sm">{group.market.question}</p>
          </div>

          {/* Manager */}
          <div>
            <p className="text-gray-400 text-sm mb-1">{t("Gerente")}</p>
            <p className="text-white">@{group.creator.username}</p>
          </div>

          {/* Liquidity Progress */}
          <div>
            <p className="text-gray-400 text-sm mb-2">{t("Progresso de Liquidez")}</p>
            <div className="flex justify-between mb-1">
              <span className="text-white text-sm">R${group.currentLiquidity.toLocaleString()}</span>
              <span className="text-gray-400 text-sm">R${group.targetLiquidity.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Members */}
          <div>
            <p className="text-gray-400 text-sm mb-1">{t("Membros Atuais")}</p>
            <p className="text-white">{group.memberCount}</p>
          </div>

          {/* Contribution Input */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              {t("Sua Contribuição")}
              <span className="text-gray-500 ml-2">
                ({t("Mín")}: R${group.minContribution}
                {group.maxContribution ? ` | ${t("Máx")}: R$${group.maxContribution}` : ""})
              </span>
            </label>
            <input
              type="number"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              placeholder={t("Digite o valor da contribuição")}
              min={group.minContribution}
              max={group.maxContribution || undefined}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Outcome Selection */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              {t("Sua Previsão")}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMemberChosenOutcome("YES")}
                className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  memberChosenOutcome === "YES"
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                    : "bg-slate-700 text-gray-400 hover:bg-slate-600"
                }`}
              >
                {t("SIM")}
              </button>
              <button
                type="button"
                onClick={() => setMemberChosenOutcome("NO")}
                className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  memberChosenOutcome === "NO"
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                    : "bg-slate-700 text-gray-400 hover:bg-slate-600"
                }`}
              >
                {t("NÃO")}
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              {t("Escolha se você acredita que o resultado será SIM ou NÃO")}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 sm:p-6 border-t border-slate-700 flex gap-3">
          <Link
            href="/dashboard/groups"
            className="flex-1 px-4 py-3 bg-slate-700 text-gray-400 rounded-xl text-center hover:text-white text-sm"
          >
            {t("Cancelar")}
          </Link>
          <button
            onClick={joinGroup}
            disabled={joining || !contributionAmount || !memberChosenOutcome}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-sm font-semibold"
          >
            {joining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("Entrando...")}
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                {t("Entrar no Grupo")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
