"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/routing";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Lock,
  Play,
  LogOut,
  Share2,
  Copy,
  CheckCircle,
  Clock,
} from "lucide-react";
import api from "@/lib/api";

interface Member {
  id: number;
  user: { id: number; username: string; firstname: string | null; image: string | null };
  contributionAmount: number;
  ownershipPercentage: number;
  memberChosenOutcome: 'YES' | 'NO' | null;
  joinedAt: string;
}

interface Group {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  statusCode: number;
  isPublic: boolean;
  inviteCode: string | null;
  currentLiquidity: number;
  targetLiquidity: number;
  minContribution: number;
  maxContribution: number | null;
  maxParticipants: number | null;
  managerFeePercent: number;
  adminApproved: boolean;
  outcomeSelected: string | null;
  decisionMethod: string;
  memberCount: number;
  creator: { id: number; username: string; firstname: string | null };
  market: { id: number; question: string; slug: string };
  isManager: boolean;
  isMember: boolean;
  userMembership?: {
    contributionAmount: number;
    ownershipPercentage: number;
    joinedAt: string;
  };
  createdAt: string;
}

export default function GroupDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");
  const [memberChosenOutcome, setMemberChosenOutcome] = useState<"YES" | "NO" | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${(session as any)?.accessToken}`,
    },
  };

  useEffect(() => {
    if (session) {
      fetchGroup();
    }
  }, [params.slug, session]);

  const fetchGroup = async () => {
    try {
      const response = await api.get(`/groups/${params.slug}`, authHeaders);
      setGroup(response.data);

      const membersResponse = await api.get(`/groups/${response.data.id}/members`, authHeaders);
      setMembers(membersResponse.data);
    } catch (error) {
      console.error("Failed to fetch group:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async () => {
    if (!contributionAmount || !group || !memberChosenOutcome) return;
    setJoining(true);
    try {
      await api.post(`/groups/${group.id}/join`, {
        contributionAmount: parseFloat(contributionAmount),
        memberChosenOutcome,
      }, authHeaders);
      setShowJoinModal(false);
      fetchGroup();
    } catch (error: any) {
      alert(error.response?.data?.message || t("Falha ao entrar no grupo"));
    } finally {
      setJoining(false);
    }
  };

  const leaveGroup = async () => {
    if (!group || !confirm(t("Tem certeza que deseja sair do grupo? Sua contribuição será reembolsada.")))
      return;
    try {
      await api.post(`/groups/${group.id}/leave`, {}, authHeaders);
      fetchGroup();
    } catch (error: any) {
      alert(error.response?.data?.message || t("Falha ao sair do grupo"));
    }
  };

  const submitForApproval = async () => {
    if (!group) return;
    try {
      await api.post(`/groups/${group.id}/submit-approval`, {}, authHeaders);
      fetchGroup();
    } catch (error: any) {
      alert(error.response?.data?.message || t("Falha ao enviar para aprovação"));
    }
  };

  const lockGroup = async () => {
    if (!group) return;
    try {
      await api.post(`/groups/${group.id}/lock`, {}, authHeaders);
      fetchGroup();
    } catch (error: any) {
      alert(error.response?.data?.message || t("Falha ao bloquear grupo"));
    }
  };

  const setOutcome = async (outcome: "YES" | "NO") => {
    if (!group) return;
    try {
      await api.post(`/groups/${group.id}/set-outcome`, { outcome }, authHeaders);
      fetchGroup();
    } catch (error: any) {
      alert(error.response?.data?.message || t("Falha ao definir resultado"));
    }
  };

  const executeBet = async () => {
    if (!group) return;
    try {
      await api.post(`/groups/${group.id}/execute`, {}, authHeaders);
      fetchGroup();
    } catch (error: any) {
      alert(error.response?.data?.message || t("Falha ao executar aposta"));
    }
  };

  const copyInviteLink = () => {
    if (!group) return;
    // Extract locale from current path (e.g., /pt/dashboard/... -> pt)
    const pathParts = window.location.pathname.split('/');
    const locale = pathParts[1] || 'pt';

    // For private groups, use invite code; for public groups, use direct group URL
    const link = group.isPublic
      ? `${window.location.origin}/${locale}/dashboard/groups/${group.slug}`
      : group.inviteCode
        ? `${window.location.origin}/${locale}/dashboard/groups/join/${group.inviteCode}`
        : null;
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      OPEN: t("Aberto"),
      LOCKED: t("Bloqueado"),
      EXECUTED: t("Executado"),
      RESOLVED: t("Resolvido"),
      PENDING_APPROVAL: t("Aguardando Aprovação"),
      AWAITING_RESULT_APPROVAL: t("Aguardando Aprovação do Resultado"),
      DRAFT: t("Rascunho"),
      REJECTED: t("Rejeitado"),
      CANCELLED: t("Cancelado"),
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">{t("Grupo não encontrado")}</p>
        <Link href="/dashboard/groups" className="text-indigo-400 mt-4 inline-block">
          {t("Voltar para Grupos")}
        </Link>
      </div>
    );
  }

  const progress = (group.currentLiquidity / group.targetLiquidity) * 100;

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/dashboard/groups"
          className="p-2 rounded-lg bg-slate-800 text-gray-400 hover:text-white shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{group.name}</h1>
          <p className="text-gray-400 text-sm">{group.isPublic ? t("Grupo Público") : t("Grupo Privado")}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
            group.status === "OPEN"
              ? "bg-emerald-500/20 text-emerald-400"
              : group.status === "PENDING_APPROVAL"
              ? "bg-amber-500/20 text-amber-400"
              : "bg-gray-500/20 text-gray-400"
          }`}
        >
          {getStatusLabel(group.status)}
        </span>
      </div>

      {/* Manager Actions */}
      {group.isManager && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
          <p className="text-indigo-400 font-medium mb-3">{t("Ações do Gerente")}</p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {group.status === "DRAFT" && (
              <button
                onClick={submitForApproval}
                className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                {t("Enviar para Aprovação")}
              </button>
            )}
            {group.status === "OPEN" && (
              <button
                onClick={lockGroup}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm"
              >
                <Lock className="w-4 h-4" />
                {t("Bloquear Grupo")}
              </button>
            )}
            {group.status === "LOCKED" && group.decisionMethod === "MANAGER" && !group.outcomeSelected && (
              <div className="flex flex-col gap-2">
                <p className="text-gray-400 text-sm">{t("Selecione o resultado e envie para aprovação do admin:")}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOutcome("YES")}
                    className="px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
                  >
                    {t("Declarar SIM")}
                  </button>
                  <button
                    onClick={() => setOutcome("NO")}
                    className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    {t("Declarar NÃO")}
                  </button>
                </div>
              </div>
            )}
            {group.status === "AWAITING_RESULT_APPROVAL" && (
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm">
                <Clock className="w-4 h-4" />
                {t("Resultado")} ({group.outcomeSelected}) - {t("Aguardando aprovação do administrador")}
              </div>
            )}
            {(group.isPublic || (!group.isPublic && group.inviteCode)) && group.status === "OPEN" && (
              <button
                onClick={copyInviteLink}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {copied ? t("Link Copiado!") : t("Compartilhar Link")}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Market */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <p className="text-gray-400 text-sm mb-2">{t("Mercado")}</p>
          <p className="text-white font-medium text-sm">{group.market.question}</p>
          <Link
            href={`/market/${group.market.slug}`}
            className="text-indigo-400 text-sm mt-2 inline-block hover:underline"
          >
            {t("Ver Mercado")}
          </Link>
        </div>

        {/* Manager */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <p className="text-gray-400 text-sm mb-2">{t("Gerente")}</p>
          <p className="text-white font-medium">@{group.creator.username}</p>
        </div>

        {/* Decision Method */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <p className="text-gray-400 text-sm mb-2">{t("Método de Decisão")}</p>
          <p className="text-white font-medium text-sm">
            {group.decisionMethod === "MANAGER" ? t("Gerente Decide") : t("Votação dos Membros")}
          </p>
          {group.outcomeSelected && (
            <p className="text-indigo-400 text-sm mt-1">{t("Resultado")}: {group.outcomeSelected}</p>
          )}
        </div>

        {/* Liquidity */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <p className="text-gray-400 text-sm mb-2">{t("Liquidez")}</p>
          <div className="flex justify-between mb-1">
            <span className="text-white font-medium">R${group.currentLiquidity.toLocaleString()}</span>
            <span className="text-gray-400 text-sm">R${group.targetLiquidity.toLocaleString()}</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Your Position */}
        {group.userMembership && (
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-gray-400 text-sm mb-2">{t("Sua Posição")}</p>
            <p className="text-white font-medium">
              R${group.userMembership.contributionAmount.toLocaleString()}
            </p>
            <p className="text-indigo-400 text-sm">
              {(group.userMembership.ownershipPercentage * 100).toFixed(2)}% {t("participação")}
            </p>
          </div>
        )}

        {/* Members */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <p className="text-gray-400 text-sm mb-2">{t("Membros")}</p>
          <p className="text-white font-medium">{group.memberCount}</p>
          {group.maxParticipants && (
            <p className="text-gray-400 text-sm">{t("Máx")}: {group.maxParticipants}</p>
          )}
        </div>
      </div>

      {/* Join/Leave Actions */}
      {!group.isManager && group.status === "OPEN" && group.adminApproved && (
        <div className="flex gap-3">
          {!group.isMember ? (
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-semibold"
            >
              <Users className="w-5 h-5" />
              {t("Entrar no Grupo")}
            </button>
          ) : (
            <button
              onClick={leaveGroup}
              className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-red-600/20 text-red-400 border border-red-600/30 rounded-xl hover:bg-red-600/30 text-sm font-semibold"
            >
              <LogOut className="w-5 h-5" />
              {t("Sair do Grupo")}
            </button>
          )}
        </div>
      )}

      {/* Members List */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t("Membros")} ({members.length})
          </h2>
        </div>
        {members.length === 0 ? (
          <div className="p-8 text-center text-gray-400">{t("Nenhum membro ainda")}</div>
        ) : (
          <div className="divide-y divide-slate-700">
            {members.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                    {member.user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">@{member.user.username}</p>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      {t("Entrou em")} {new Date(member.joinedAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 flex items-center gap-3">
                  {member.memberChosenOutcome && (
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        member.memberChosenOutcome === "YES"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {member.memberChosenOutcome === "YES" ? t("SIM") : t("NÃO")}
                    </span>
                  )}
                  <div>
                    <p className="text-white font-medium text-sm">
                      R${member.contributionAmount.toLocaleString()}
                    </p>
                    <p className="text-indigo-400 text-xs sm:text-sm">{member.ownershipPercentage.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">{t("Entrar em")} {group.name}</h3>
            <p className="text-gray-400 mb-4 text-sm">
              {t("Mín")}: R${group.minContribution} | {t("Máx")}:{" "}
              {group.maxContribution ? `R$${group.maxContribution}` : t("Sem limite")}
            </p>
            <input
              type="number"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              placeholder={t("Digite o valor da contribuição")}
              min={group.minContribution}
              max={group.maxContribution || undefined}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white mb-4 text-sm"
            />
            {/* Outcome Selection */}
            <div className="mb-4">
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
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-700 text-gray-400 rounded-xl hover:text-white text-sm"
              >
                {t("Cancelar")}
              </button>
              <button
                onClick={joinGroup}
                disabled={joining || !contributionAmount || !memberChosenOutcome}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-sm font-semibold"
              >
                {joining ? t("Entrando...") : t("Entrar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
