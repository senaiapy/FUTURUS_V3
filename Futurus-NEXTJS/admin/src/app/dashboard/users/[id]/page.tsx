"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Smartphone,
  MapPin,
  CreditCard,
  History,
  ShieldCheck,
  Ban,
  Bell,
  Plus,
  Minus,
  Save,
  CheckCircle2,
  XCircle,
  Activity,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Layers,
  ShoppingBag,
  ExternalLink,
  MessageSquare,
  Lock,
  Unlock,
  AlertTriangle,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/PremiumUI";
import { cn } from "@/lib/utils";

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceRemark, setBalanceRemark] = useState("");
  const [activeTab, setActiveTab] = useState("transactions");

  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await api.get(`/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, router]);

  const handleUpdateBalance = async (type: "add" | "sub") => {
    if (!balanceAmount || !balanceRemark) return;
    const token = localStorage.getItem("admin_token");
    try {
      await api.post(
        `/admin/users/${id}/balance`,
        {
          amount: parseFloat(balanceAmount),
          type,
          remark: balanceRemark,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // Refresh
      const res = await api.get(`/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setBalanceAmount("");
      setBalanceRemark("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleImpersonate = async () => {
    const token = localStorage.getItem("admin_token");
    try {
      const res = await api.post(
        `/admin/users/${id}/impersonate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.success && res.data.loginUrl) {
        // Open in new tab
        window.open(res.data.loginUrl, '_blank');
        alert(`✅ Token de login gerado! Válido por ${res.data.expiresIn / 60} minutos.`);
      }
    } catch (err: any) {
      alert('❌ Erro ao gerar token de impersonação: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  const handleUpdateStatus = async (status: number) => {
    const token = localStorage.getItem("admin_token");
    try {
      await api.patch(
        `/admin/users/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUser({ ...user, status });
    } catch (err) {
      console.error(err);
    }
  };

  const handleKYCAction = async (action: 'approve' | 'reject') => {
    const token = localStorage.getItem("admin_token");
    try {
      if (action === 'reject') {
        const reason = prompt("Motivo da rejeição:");
        if (!reason) return;
        await api.post(`/admin/users/${id}/kyc-reject`, { reason }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('KYC Rejeitado.');
      } else {
        await api.post(`/admin/users/${id}/kyc-approve`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('KYC Aprovado com Sucesso!');
      }
      // Refresh user
      const res = await api.get(`/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error(err);
      alert('Erro ao processar KYC');
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0b14] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin shadow-2xl shadow-indigo-500/20" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
          Carregando Perfil
        </span>
      </div>
    );

  if (!user)
    return (
      <div className="p-12 text-center space-y-4">
        <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto opacity-20" />
        <h2 className="text-xl font-black text-white uppercase tracking-tight">
          Usuário não encontrado
        </h2>
        <Button
          variant="secondary"
          onClick={() => router.push("/dashboard/users")}
        >
          Voltar para Lista
        </Button>
      </div>
    );

  return (
    <div className="space-y-10 pb-16">
      {/* Premium Sub-Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Link
            href="/dashboard/users"
            className="w-12 h-12 rounded-2xl bg-[#141726]/40 border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                Perfil do Usuário
              </h1>
              <Badge
                variant={user.status === 1 ? "success" : "danger"}
                className="px-3 py-1 rounded-lg"
              >
                {user.status === 1 ? "ATIVO" : "BANIDO"}
              </Badge>
            </div>
            <p className="text-slate-500 font-bold mt-1">
              Gerindo conta de{" "}
              <span className="text-indigo-400">@{user.username}</span> • ID: #
              {user.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={Mail} className="rounded-2xl h-11">
            Enviar E-mail
          </Button>
          <Button variant="secondary" icon={Bell} className="rounded-2xl h-11">
            Notificar
          </Button>
          <Button
            variant="primary"
            icon={ExternalLink}
            className="rounded-2xl h-11"
            onClick={handleImpersonate}
          >
            Entrar como Usuário
          </Button>
          {user.status === 1 ? (
            <Button
              variant="danger"
              icon={Lock}
              className="rounded-2xl h-11"
              onClick={() => handleUpdateStatus(0)}
            >
              Banir Conta
            </Button>
          ) : (
            <Button
              variant="success"
              icon={Unlock}
              className="rounded-2xl h-11"
              onClick={() => handleUpdateStatus(1)}
            >
              Desbanir
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT SIDEBAR: PROFILE SUMMARY */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="p-10 border-white/5 bg-[#141726]/40 shadow-2xl relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-br from-indigo-600/20 to-purple-600/20 opacity-50" />

            <div className="relative z-10">
              <div className="w-32 h-32 rounded-[40px] bg-linear-to-br from-indigo-500 to-purple-600 p-1 flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-6">
                <div className="w-full h-full rounded-[38px] bg-slate-900 flex items-center justify-center overflow-hidden border-4 border-slate-900">
                  {user.image ? (
                    <img
                      src={user.image}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-black text-white">
                      {user.firstname?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center relative z-10 w-full">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {user.firstname} {user.lastname}
              </h2>
              <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] mt-2">
                Nível de Verificação: {user.kv === 1 ? "Ouro (Full)" : "Bronze"}
              </p>

              <div className="grid grid-cols-2 gap-4 w-full mt-10">
                <div className="bg-white/5 border border-white/5 p-4 rounded-3xl text-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Desde
                  </p>
                  <p className="text-sm font-black text-white">
                    {new Date(user.createdAt).getFullYear()}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/5 p-4 rounded-3xl text-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    País
                  </p>
                  <p className="text-sm font-black text-white truncate px-1">
                    Brasil
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-white/5 bg-[#141726]/40 shadow-xl space-y-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />{" "}
              Detalhes de Contato
            </h3>

            <div className="space-y-6">
              {[
                {
                  label: "Endereço de E-mail",
                  value: user.email,
                  icon: Mail,
                  color: "text-indigo-400",
                  bg: "bg-indigo-500/10",
                },
                {
                  label: "Número de Telefone",
                  value: user.mobile || "Não informado",
                  icon: Smartphone,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                },
                {
                  label: "Localização",
                  value: `${user.city || "—"}, ${user.country_name || "Brasil"}`,
                  icon: MapPin,
                  color: "text-amber-400",
                  bg: "bg-amber-500/10",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-5 group">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-2xl flex items-center justify-center border border-white/5 shrink-0",
                      item.bg,
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", item.color)} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest leading-none mb-1.5">
                      {item.label}
                    </p>
                    <p className="text-sm font-black text-white tracking-tight truncate group-hover:text-white transition-colors">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-6 border-t border-white/5 grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                className="w-full h-10 text-[10px] rounded-xl font-black"
              >
                Histórico de Login
              </Button>
              <Button
                variant="secondary"
                className="w-full h-10 text-[10px] rounded-xl font-black"
              >
                Editar Perfil
              </Button>
            </div>
          </Card>
        </div>

        {/* RIGHT CONTENT: FINANCIAL & ACTIONS */}
        <div className="lg:col-span-8 space-y-10">
          {/* Financial Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-8 border-indigo-500/20 bg-linear-to-br from-indigo-600/10 to-transparent relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <Wallet className="w-8 h-8 text-indigo-400 opacity-60" />
                  <Badge
                    variant="info"
                    className="px-3! py-1! rounded-lg! text-[9px] font-black"
                  >
                    LIQUIDEZ
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Saldo Disponível
                  </p>
                  <p className="text-3xl font-black text-white tracking-tighter mt-1">
                    R${Number(user.balance).toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </div>
              <CreditCard className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-[0.03] group-hover:scale-110 transition-transform" />
            </Card>

            <Card className="p-8 border-white/5 bg-[#141726]/40 relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <ArrowDownLeft className="w-8 h-8 text-emerald-400 opacity-60" />
                  <Badge
                    variant="success"
                    className="px-3! py-1! rounded-lg! text-[9px] font-black"
                  >
                    ENTRADAS
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Total Depositado
                  </p>
                  <p className="text-2xl font-black text-white tracking-tighter mt-1">
                    R$
                    {Number(user.total_deposit || 0)
                      .toFixed(2)
                      .replace(".", ",")}
                  </p>
                </div>
              </div>
              <ShoppingBag className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-[0.03] group-hover:scale-110 transition-transform" />
            </Card>

            <Card className="p-8 border-white/5 bg-[#141726]/40 relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <ArrowUpRight className="w-8 h-8 text-rose-400 opacity-60" />
                  <Badge
                    variant="danger"
                    className="px-3! py-1! rounded-lg! text-[9px] font-black"
                  >
                    SAÍDAS
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Total Sacado
                  </p>
                  <p className="text-2xl font-black text-white tracking-tighter mt-1">
                    R$
                    {Number(user.total_withdrawal || 0)
                      .toFixed(2)
                      .replace(".", ",")}
                  </p>
                </div>
              </div>
              <History className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-[0.03] group-hover:scale-110 transition-transform" />
            </Card>
          </div>

          {/* Quick Actions & Tabbed Info */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {/* Balance Management Form */}
            <Card className="p-10 border-white/5 bg-[#141726]/40 shadow-2xl">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    Gerenciar Saldo
                  </h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">
                    Ações financeiras diretas
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                    Quantia em BRL (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 font-black text-sm">
                      R$
                    </span>
                    <input
                      type="number"
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 pl-14 pr-6 text-white font-black text-lg focus:outline-none focus:border-indigo-500/40 transition-all placeholder:text-slate-700"
                      placeholder="0,00"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                    Observação Administrativa
                  </label>
                  <textarea
                    value={balanceRemark}
                    onChange={(e) => setBalanceRemark(e.target.value)}
                    rows={2}
                    className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-white font-bold text-sm focus:outline-none focus:border-indigo-500/40 transition-all placeholder:text-slate-700 resize-none"
                    placeholder="Descreva o motivo deste ajuste..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button
                    variant="success"
                    icon={Plus}
                    className="h-16 rounded-[32px] text-xs font-black shadow-xl shadow-emerald-600/10"
                    onClick={() => handleUpdateBalance("add")}
                  >
                    ADICIONAR
                  </Button>
                  <Button
                    variant="danger"
                    icon={Minus}
                    className="h-16 rounded-[32px] text-xs font-black shadow-xl shadow-rose-600/10"
                    onClick={() => handleUpdateBalance("sub")}
                  >
                    SUBTRAIR
                  </Button>
                </div>
              </div>
            </Card>

            {/* Status Toggles & Verifications */}
            <Card className="p-10 border-white/5 bg-[#141726]/40 shadow-2xl">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    Status e Segurança
                  </h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">
                    Controle de acesso e verificação
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {[
                  {
                    label: "Verificação de E-mail",
                    status: user.ev,
                    icon: Mail,
                  },
                  {
                    label: "Verificação de SMS",
                    status: user.sv,
                    icon: Smartphone,
                  },
                  {
                    label: "KYC (Identidade)",
                    status: user.kv === 1,
                    icon: User,
                  },
                  { label: "2FA (Google Auth)", status: user.ts, icon: Lock },
                ].map((v, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-5 rounded-[28px] bg-black/30 border border-white/5 group hover:border-indigo-500/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center border",
                          v.status
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-white/5 border-white/5 text-slate-700",
                        )}
                      >
                        <v.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider">
                        {v.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={v.status ? "success" : "danger"}
                        className="px-3! py-1! rounded-lg"
                      >
                        {v.status ? "OK" : "PENDENTE"}
                      </Badge>
                      <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* KYC Review Documents (Conditional) */}
            {user.kv === 2 && user.kycData && (
              <Card className="col-span-full xl:col-span-2 p-10 border-indigo-500/20 bg-indigo-500/5 shadow-2xl mt-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <User className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                      Revisão de KYC Pendente
                    </h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">
                      Documentos eviados pelo usuário
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {(() => {
                    let parsedKycData = [];
                    try {
                      // Attempt to parse stringified JSON or use raw if already object
                      parsedKycData = typeof user.kycData === 'string' ? JSON.parse(user.kycData) : user.kycData;
                    } catch (e) {
                      console.error("Failed to parse KYC Data:", e);
                    }
                    return parsedKycData?.map((doc: any, i: number) => {
                      if (doc.type === 'file') {
                        return (
                          <div key={i} className="flex flex-col gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.name}</span>
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/50 flex flex-col justify-center items-center group">
                                <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/verify/${doc.value}`} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center">
                                  <img 
                                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/verify/${doc.value}`} 
                                    className="max-h-full max-w-full object-contain p-2 group-hover:scale-105 transition-transform"
                                    alt={doc.name} 
                                  />
                                </a>
                            </div>
                          </div>
                        );
                      }
                      return (
                         <div key={i} className="flex flex-col gap-2 p-4 bg-white/5 rounded-xl border border-white/10">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.name}</span>
                            <span className="text-sm font-bold text-white uppercase">{doc.value}</span>
                         </div>
                      );
                    });
                  })()}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                  <Button
                    variant="success"
                    icon={CheckCircle2}
                    className="flex-1 h-12 rounded-xl text-xs font-black shadow-xl"
                    onClick={() => handleKYCAction("approve")}
                  >
                    APROVAR DOCUMENTOS
                  </Button>
                  <Button
                    variant="danger"
                    icon={XCircle}
                    className="flex-1 h-12 rounded-xl text-xs font-black shadow-xl"
                    onClick={() => handleKYCAction("reject")}
                  >
                    REJEITAR & SOLICITAR NOVO
                  </Button>
                </div>
              </Card>
            )}

          </div>

          {/* User History Tabs */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 bg-black/40 p-2 rounded-[32px] border border-white/5 overflow-x-auto scrollbar-hide">
              {[
                { id: "transactions", label: "Transações", icon: Layers },
                { id: "purchases", label: "Apostas", icon: ShoppingBag },
                { id: "deposits", label: "Depósitos", icon: Wallet },
                { id: "withdrawals", label: "Saques", icon: History },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 px-8 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/5",
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <Card className="min-h-[400px] border-white/5 bg-[#141726]/40 shadow-2xl overflow-hidden rounded-[40px]">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/2 border-b border-white/5">
                      <th className="px-10 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        Informação / TRX
                      </th>
                      <th className="px-10 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        Montante
                      </th>
                      <th className="px-10 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        Data / Hora
                      </th>
                      <th className="px-10 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/2">
                    {user[activeTab]?.length > 0 ? (
                      user[activeTab].map((item: any, i: number) => (
                        <tr
                          key={i}
                          className="hover:bg-white/1 transition-all group"
                        >
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-indigo-500/20 transition-all">
                                <Activity className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-white group-hover:text-indigo-100 transition-colors">
                                  {item.details ||
                                    item.market?.question ||
                                    `Transação #${item.trx || item.id}`}
                                </p>
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight mt-1">
                                  {item.trx || "#" + item.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <span
                              className={cn(
                                "text-sm font-black",
                                item.trxType === "+" || item.status === 1
                                  ? "text-emerald-400"
                                  : "text-rose-400",
                              )}
                            >
                              {item.trxType || (item.amount > 0 ? "+" : "")} R$
                              {Number(Math.abs(item.amount)).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white tracking-tight">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                              <span className="text-[10px] text-slate-600 font-bold uppercase">
                                {new Date(item.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <Badge
                              variant={
                                item.status === 1
                                  ? "success"
                                  : item.status === 2
                                    ? "warning"
                                    : item.status === 0
                                      ? "default"
                                      : "danger"
                              }
                            >
                              {item.status === 1
                                ? "Sucesso"
                                : item.status === 2
                                  ? "Pendente"
                                  : "Cancelado"}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-10 py-32 text-center">
                          <div className="opacity-20 flex flex-col items-center gap-4">
                            <Layers className="w-16 h-16 text-slate-500" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                              Nenhum registro nesta categoria
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {user[activeTab]?.length > 0 && (
                <div className="p-8 border-t border-white/5 flex justify-center">
                  <Button
                    variant="secondary"
                    className="px-12 text-[10px] font-black h-12 rounded-2xl"
                  >
                    VER RELATÓRIO COMPLETO
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
