"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  MessageSquare,
  Plus,
  ArrowRight,
  Send,
  Clock,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  History,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export default function SupportTicketsPage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    priority: 2,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    if (!session) return;
    try {
      const res = await api.get("/support/tickets", {
        headers: { Authorization: `Bearer ${(session as any).accessToken}` },
      });
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/support/tickets", formData, {
        headers: { Authorization: `Bearer ${(session as any).accessToken}` },
      });
      setFormData({ subject: "", message: "", priority: 2 });
      setIsCreating(false);
      fetchTickets();
    } catch (err) {
      console.error("Failed to create ticket", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#1a1c2d] tracking-tight">
            {t("Central de Suporte")}
          </h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            {t(
              "Precisa de ajuda? Abra um ticket e nossa equipe entrará em contato em breve.",
            )}
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-[#3b5bdb] hover:bg-[#2f49b5] text-white px-8 py-4 rounded-[20px] font-black text-[12px] tracking-[0.2em] uppercase transition-all shadow-xl shadow-[#3b5bdb]/20 flex items-center gap-3"
          >
            <Plus className="w-5 h-5 shadow-sm" />
            {t("Novo Ticket")}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {isCreating ? (
            <form
              onSubmit={handleSubmit}
              className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-[#1a1c2d] uppercase tracking-wider">
                  {t("Criar Novo Ticket")}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-slate-400 hover:text-rose-500 text-[11px] font-black uppercase tracking-widest transition-colors"
                >
                  {t("Cancelar")}
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    {t("Assunto")}
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-100 rounded-[20px] py-5 px-7 text-[#1a1c2d] font-bold focus:outline-none focus:border-[#3b5bdb] focus:bg-white transition-all placeholder:text-slate-300"
                    placeholder={t("Qual é o motivo do seu contato?")}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    {t("Prioridade")}
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, priority: p })
                        }
                        className={cn(
                          "py-4 rounded-[18px] border text-[11px] font-black uppercase tracking-widest transition-all",
                          formData.priority === p
                            ? "bg-[#3b5bdb] border-[#3b5bdb] text-white shadow-lg shadow-[#3b5bdb]/10"
                            : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200",
                        )}
                      >
                        {p === 1
                          ? t("Alta")
                          : p === 2
                            ? t("Média")
                            : t("Baixa")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    {t("Mensagem Detalhada")}
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 px-7 text-[#1a1c2d] font-bold focus:outline-none focus:border-[#3b5bdb] focus:bg-white transition-all h-48 resize-none shadow-inner placeholder:text-slate-300"
                    placeholder={t(
                      "Descreva seu problema ou dúvida em detalhes...",
                    )}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#3b5bdb] hover:bg-[#2f49b5] disabled:bg-slate-200 text-white py-6 rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-[#3b5bdb]/20 transition-all flex items-center justify-center gap-4 group"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {t("Enviar Ticket")}
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-white border border-slate-100 rounded-[30px] animate-pulse"
                  />
                ))
              ) : tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/dashboard/support/${ticket.ticket}`}
                    className="flex items-center justify-between p-7 rounded-[40px] bg-white border border-slate-100 hover:border-[#3b5bdb]/30 hover:shadow-lg hover:shadow-[#3b5bdb]/5 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#3b5bdb] transition-colors">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1a1c2d] text-[15px] group-hover:text-[#3b5bdb] transition-colors">
                          {ticket.subject}
                        </h3>
                        <div className="flex items-center gap-4 mt-1.5">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            #{ticket.ticket}
                          </p>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <span
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                          ticket.status === 0
                            ? "bg-amber-50 text-amber-600 border-amber-100"
                            : ticket.status === 1
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : ticket.status === 2
                                ? "bg-blue-50 text-blue-600 border-blue-100"
                                : "bg-slate-50 text-slate-400 border-slate-100",
                        )}
                      >
                        {ticket.status === 0
                          ? t("Aberto")
                          : ticket.status === 1
                            ? t("Respondido")
                            : ticket.status === 2
                              ? t("Réplica")
                              : t("Fechado")}
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#1a1c2d] group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-32 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                  <div className="flex flex-col items-center gap-4 opacity-30">
                    <History className="w-16 h-16 text-slate-300" />
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      {t("Você ainda não criou nenhum ticket.")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-[15px] font-black text-[#1a1c2d] uppercase tracking-wider">
              {t("Informações de Suporte")}
            </h3>
            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#3b5bdb] shrink-0 border border-slate-100">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-[#1a1c2d] uppercase tracking-widest mb-1">
                    {t("Tempo de Resposta")}
                  </p>
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                    {t("Normalmente respondemos em até 2-4 horas úteis.")}
                  </p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-100">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-[#1a1c2d] uppercase tracking-widest mb-1">
                    {t("Atendimento Expert")}
                  </p>
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                    {t(
                      "Ajuda especializada de analistas do mercado de previsões.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-8 rounded-[40px] border border-amber-100">
            <div className="flex items-center gap-3 mb-4 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <h4 className="text-[10px] font-black uppercase tracking-widest">
                {t("Dicas Úteis")}
              </h4>
            </div>
            <p className="text-[12px] text-amber-700/70 font-bold italic leading-relaxed">
              {t(
                "Forneça detalhes claros sobre o seu problema, incluindo nomes de mercado ou IDs de transação se aplicável, para que possamos ajudá-lo mais rápido.",
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
