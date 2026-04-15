"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  LifeBuoy,
  Send,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Paperclip,
  Download,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/PremiumUI";

export default function SupportTicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchDetail = async () => {
      try {
        const res = await api.get(`/admin/ticket/view/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTicket(res.data.ticket);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;

    const token = localStorage.getItem("admin_token");
    try {
      const res = await api.post(
        `/admin/ticket/reply/${ticket.id}`,
        { message: reply },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages([...messages, res.data.message]);
      setReply("");
    } catch (err) {
      console.error(err);
    }
  };

  const closeTicket = async () => {
    const token = localStorage.getItem("admin_token");
    try {
      await api.post(
        `/admin/ticket/close/${ticket.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setTicket({ ...ticket, status: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
          Carregando Atendimento...
        </p>
      </div>
    );

  if (!ticket)
    return <div className="p-8 text-white">Ticket não encontrado</div>;

  const statusMap: any = {
    1: { label: "Aberto", variant: "info" as const },
    2: { label: "Respondido", variant: "warning" as const },
    3: { label: "Respondido (Admin)", variant: "success" as const },
    0: { label: "Fechado", variant: "default" as const },
  };

  const s = statusMap[ticket.status] || statusMap[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[24px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-mono text-indigo-400 uppercase tracking-widest">
                #{ticket.ticket}
              </span>
              <Badge variant={s.variant}>{s.label}</Badge>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {ticket.subject}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {ticket.status !== 0 && (
            <Button
              variant="danger"
              icon={XCircle}
              onClick={closeTicket}
              className="rounded-2xl"
            >
              Fechar Ticket
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - User Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
              Informações do Usuário
            </h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                <User className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white truncate">
                  @{ticket.user?.username || "Guest"}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {ticket.user?.email || "No email"}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-black text-slate-600 uppercase mb-1">
                  Prioridade
                </p>
                <p className="text-xs font-bold text-white uppercase tracking-tighter">
                  {ticket.priority === 3
                    ? "Alta"
                    : ticket.priority === 2
                      ? "Média"
                      : "Baixa"}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-600 uppercase mb-1">
                  Data de Criação
                </p>
                <p className="text-xs font-bold text-slate-400">
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Chat */}
        <div className="lg:col-span-3 flex flex-col h-[700px]">
          <Card className="flex-1 overflow-hidden flex flex-col relative">
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            >
              {messages.map((m) => {
                const isAdmin = m.admin_id !== null;
                return (
                  <div
                    key={m.id}
                    className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${isAdmin ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" : "bg-white/5 text-slate-300 border border-white/5"}`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          {isAdmin
                            ? "Equipe de Suporte"
                            : `@${ticket.user?.username || "Usuário"}`}
                        </span>
                        <span className="text-[9px] opacity-40">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {m.message}
                      </p>
                      {m.attachments?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                          {m.attachments.map((a: any, idx: number) => (
                            <a
                              key={idx}
                              href={`#`}
                              className="flex items-center gap-2 text-[10px] font-bold text-indigo-200 hover:text-white transition-colors"
                            >
                              <Paperclip className="w-3 h-3" /> Anexo {idx + 1}{" "}
                              <Download className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Form */}
            {ticket.status !== 0 ? (
              <div className="p-6 border-t border-white/5 bg-[#141726]/80 backdrop-blur-md">
                <form onSubmit={handleReply} className="flex gap-4">
                  <div className="relative flex-1">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Digite sua resposta aqui..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder:text-slate-600 transition-all font-bold min-h-[56px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleReply(e as any);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </div>
                  <Button
                    type="submit"
                    icon={Send}
                    className="w-14 h-14 rounded-2xl p-0 flex items-center justify-center shrink-0"
                  >
                    <span className="sr-only">Enviar</span>
                  </Button>
                </form>
              </div>
            ) : (
              <div className="p-8 text-center bg-white/2 border-t border-white/5">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Este ticket está fechado e não aceita mais respostas.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
