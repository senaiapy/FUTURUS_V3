"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/routing";
import { Plus, Users, TrendingUp, Clock } from "lucide-react";
import api from "@/lib/api";

interface Group {
  id: number;
  name: string;
  slug: string;
  status: string;
  isPublic: boolean;
  currentLiquidity: number;
  targetLiquidity: number;
  memberCount: number;
  ownershipPercentage?: number;
  contributionAmount?: number;
  market: { question: string; slug: string };
  isManager: boolean;
}

export default function GroupsPage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [groups, setGroups] = useState<{ created: Group[]; joined: Group[] }>({
    created: [],
    joined: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"created" | "joined">("joined");

  useEffect(() => {
    if (session) {
      fetchGroups();
    }
  }, [session]);

  const fetchGroups = async () => {
    try {
      const response = await api.get("/groups/my-groups", {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });
      setGroups(response.data);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "text-emerald-400 bg-emerald-500/20";
      case "LOCKED":
        return "text-amber-400 bg-amber-500/20";
      case "EXECUTED":
        return "text-blue-400 bg-blue-500/20";
      case "RESOLVED":
        return "text-purple-400 bg-purple-500/20";
      case "PENDING_APPROVAL":
        return "text-yellow-400 bg-yellow-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      OPEN: t("Aberto"),
      LOCKED: t("Bloqueado"),
      EXECUTED: t("Executado"),
      RESOLVED: t("Resolvido"),
      PENDING_APPROVAL: t("Aguardando Aprovação"),
      DRAFT: t("Rascunho"),
      REJECTED: t("Rejeitado"),
      CANCELLED: t("Cancelado"),
    };
    return labels[status] || status;
  };

  const currentGroups = activeTab === "created" ? groups.created : groups.joined;

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{t("Meus Grupos")}</h1>
          <p className="text-gray-400 text-sm sm:text-base">{t("Gerencie seus grupos de apostas")}</p>
        </div>
        <Link
          href="/dashboard/groups/create"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold"
        >
          <Plus className="w-5 h-5" />
          {t("Criar Grupo")}
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-700 overflow-x-auto">
        <button
          onClick={() => setActiveTab("joined")}
          className={`pb-3 px-1 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === "joined"
              ? "text-indigo-400 border-b-2 border-indigo-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {t("Grupos Participando")} ({groups.joined.length})
        </button>
        <button
          onClick={() => setActiveTab("created")}
          className={`pb-3 px-1 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === "created"
              ? "text-indigo-400 border-b-2 border-indigo-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {t("Meus Grupos")} ({groups.created.length})
        </button>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
        </div>
      ) : currentGroups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">
            {activeTab === "created"
              ? t("Você ainda não criou nenhum grupo")
              : t("Você ainda não participa de nenhum grupo")}
          </p>
          <Link
            href="/market"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
          >
            {t("Explorar Mercados")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentGroups.map((group) => (
            <Link
              key={group.id}
              href={`/dashboard/groups/${group.slug}`}
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-indigo-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{group.name}</h3>
                  <p className="text-sm text-gray-400 truncate">
                    {group.market.question}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ml-2 ${getStatusColor(group.status)}`}
                >
                  {getStatusLabel(group.status)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{t("Progresso")}</span>
                  <span className="text-white">
                    {((group.currentLiquidity / group.targetLiquidity) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{
                      width: `${Math.min(
                        (group.currentLiquidity / group.targetLiquidity) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{group.memberCount}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>R${group.currentLiquidity.toLocaleString()}</span>
                </div>
                {group.ownershipPercentage !== undefined && (
                  <div className="flex items-center gap-1 text-indigo-400">
                    <span>{(group.ownershipPercentage * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
