"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import {
  ArrowLeft,
  Save,
  TrendingUp,
  Calendar,
  Users,
  BarChart3,
  Activity,
  Clock,
  CheckCircle2,
  Ban,
  Archive,
  Lock,
  Unlock,
  XCircle,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/PremiumUI";
import { cn } from "@/lib/utils";

const statusMap: Record<number, { label: string; variant: string; icon: any }> = {
  0: { label: "Rascunho", variant: "default", icon: Archive },
  1: { label: "Ativo", variant: "success", icon: Activity },
  2: { label: "Pendente", variant: "warning", icon: Clock },
  3: { label: "Resolvido", variant: "info", icon: CheckCircle2 },
  4: { label: "Cancelado", variant: "danger", icon: Ban },
  9: { label: "Desativado", variant: "default", icon: Ban },
};

export default function MarketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [market, setMarket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ question: "", description: "", endDate: "" });

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) { router.push("/"); return; }
    fetchMarket();
  }, [id]);

  const fetchMarket = async () => {
    try {
      const res = await api.get(`/admin/markets/${id}`, { headers });
      const m = res.data;
      setMarket(m);
      setForm({
        question: m.question || "",
        description: m.description || "",
        endDate: m.endDate ? new Date(m.endDate).toISOString().slice(0, 16) : "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/markets/${id}`, form, { headers });
      await fetchMarket();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status: number) => {
    try {
      await api.patch(`/admin/markets/${id}/status`, { status }, { headers });
      await fetchMarket();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTrending = async () => {
    try {
      await api.post(`/admin/markets/${id}/trending`, {}, { headers });
      await fetchMarket();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleLock = async () => {
    try {
      await api.post(`/admin/markets/${id}/lock`, {}, { headers });
      await fetchMarket();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Tem certeza que deseja cancelar este mercado?")) return;
    try {
      await api.post(`/admin/markets/${id}/cancel`, {}, { headers });
      await fetchMarket();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="text-center py-32">
        <p className="text-slate-500">Mercado não encontrado</p>
        <button onClick={() => router.back()} className="mt-4 text-indigo-400 hover:underline">Voltar</button>
      </div>
    );
  }

  const s = statusMap[market.status] || statusMap[0];
  const StatusIcon = s.icon;
  const imgSrc = market.image?.startsWith("http")
    ? market.image
    : `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3302").replace(/\/api$/, "")}${market.image}`;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-11 h-11 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-white tracking-tight">Detalhes do Mercado</h1>
          <p className="text-slate-500 text-sm font-bold mt-1">#{market.id} &middot; {market.slug}</p>
        </div>
        <Badge variant={s.variant as any} className="px-4 py-2 rounded-xl flex items-center gap-2">
          <StatusIcon className="w-4 h-4" />
          <span className="text-xs font-black uppercase">{s.label}</span>
        </Badge>
      </div>

      {/* Market Image + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 p-0 overflow-hidden border-white/5 bg-[#141726]/40">
          {market.image ? (
            <img src={imgSrc} alt={market.question} className="w-full h-64 object-cover" />
          ) : (
            <div className="w-full h-64 bg-indigo-500/10 flex items-center justify-center">
              <BarChart3 className="w-16 h-16 text-indigo-400/30" />
            </div>
          )}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Volume</p>
                <p className="text-lg font-black text-white">R$ {Number(market.volume || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Apostas</p>
                <p className="text-lg font-black text-white">{market._count?.purchases || 0}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">SIM</p>
                <p className="text-lg font-black text-emerald-400">{market.yesShare}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">NÃO</p>
                <p className="text-lg font-black text-rose-400">{market.noShare}%</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Categoria</p>
              <p className="text-sm font-bold text-indigo-300">{market.category?.name || "—"}</p>
            </div>
          </div>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2 p-8 border-white/5 bg-[#141726]/40 space-y-6">
          <h2 className="text-xl font-black text-white">Editar Mercado</h2>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pergunta</label>
            <input
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              className="w-full bg-black/20 border border-white/5 rounded-2xl py-3.5 px-5 text-white text-sm focus:outline-none focus:border-indigo-500/40"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full bg-black/20 border border-white/5 rounded-2xl py-3.5 px-5 text-white text-sm focus:outline-none focus:border-indigo-500/40 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data de Encerramento</label>
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full bg-black/20 border border-white/5 rounded-2xl py-3.5 px-5 text-white text-sm focus:outline-none focus:border-indigo-500/40"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              icon={Save}
              className="rounded-2xl px-8 h-12 bg-indigo-600"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <Card className="p-8 border-white/5 bg-[#141726]/40">
        <h2 className="text-xl font-black text-white mb-6">Ações</h2>
        <div className="flex flex-wrap gap-3">
          {market.status !== 1 && (
            <Button variant="secondary" icon={Activity} className="rounded-2xl" onClick={() => handleStatusChange(1)}>
              Ativar
            </Button>
          )}
          {market.status === 1 && (
            <Button variant="secondary" icon={Clock} className="rounded-2xl" onClick={() => handleStatusChange(2)}>
              Encerrar Apostas
            </Button>
          )}
          <Button
            variant="secondary"
            icon={market.isTrending ? TrendingUp : TrendingUp}
            className={cn("rounded-2xl", market.isTrending && "border-amber-500/30 text-amber-400")}
            onClick={handleToggleTrending}
          >
            {market.isTrending ? "Remover Trending" : "Marcar Trending"}
          </Button>
          <Button
            variant="secondary"
            icon={market.isLocked ? Unlock : Lock}
            className="rounded-2xl"
            onClick={handleToggleLock}
          >
            {market.isLocked ? "Desbloquear" : "Bloquear"}
          </Button>
          {market.status !== 4 && (
            <Button variant="secondary" icon={XCircle} className="rounded-2xl text-rose-400 border-rose-500/20" onClick={handleCancel}>
              Cancelar Mercado
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
