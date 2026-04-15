"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  ArrowLeft,
  Send,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";

export default function AdminTicketDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get(`/admin/support/view/${params.ticket}`);
      setTicket(res.data);
      // Assuming replies come with ticket or another endpoint
    } catch (err) {
      console.error("Failed to fetch ticket", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.ticket]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/admin/support/reply/${ticket.id}`, { message });
      setMessage("");
      fetchData();
    } catch (err) {
      console.error("Failed to reply", err);
    } finally {
      setSubmitting(false);
    }
  };

  const closeTicket = async () => {
    if (!confirm(t("Are you sure you want to close this ticket?"))) return;
    try {
      await api.post(`/admin/support/close/${ticket.id}`);
      fetchData();
    } catch (err) {
      console.error("Failed to close ticket", err);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-10 h-10 border-4 border-base border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-maven pb-20">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/admin/support"
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">
            {t("Back to Tickets")}
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {ticket.status !== 3 && (
            <button
              onClick={closeTicket}
              className="px-4 py-2 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              {t("Close Ticket")}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Ticket Card */}
          <div className="glass-card p-10 rounded-3xl bg-white/5 border border-white/5 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="bg-base/10 text-base px-2 py-0.5 rounded text-[10px] font-black uppercase">
                  #{ticket.ticket}
                </span>
                <h1 className="text-2xl font-black text-white">
                  {ticket.subject}
                </h1>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                {ticket.message}
              </p>
            </div>
          </div>

          {/* Conversation */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-4">
              {t("Conversation History")}
            </h3>
            <div className="space-y-4">
              {ticket.replies?.map((reply: any) => (
                <div
                  key={reply.id}
                  className={`p-6 rounded-3xl border ${reply.adminId ? "bg-base/5 border-base/20 ml-12" : "bg-white/5 border-white/5 mr-12"}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${reply.adminId ? "bg-base text-white" : "bg-white/10 text-slate-400"}`}
                      >
                        {reply.adminId ? "A" : "U"}
                      </div>
                      <p className="text-xs font-bold text-white">
                        {reply.adminId ? t("Support Agent") : t("User")}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold">
                      {new Date(reply.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {reply.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Reply Input */}
          {ticket.status !== 3 && (
            <form
              onSubmit={handleReply}
              className="glass-card p-8 rounded-3xl bg-white/5 border border-white/5 space-y-6"
            >
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("Type your response here...")}
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-base transition-all h-40 resize-none font-maven"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-base hover:opacity-90 disabled:bg-base/50 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-base/20"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {t("Send Response")}
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8 rounded-3xl bg-white/5 border border-white/5 space-y-6">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              {t("Ticket Info")}
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">{t("Status")}</span>
                <span>
                  {ticket.status === 0
                    ? "Open"
                    : ticket.status === 1
                      ? "Answered"
                      : ticket.status === 2
                        ? "Replied"
                        : "Closed"}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">{t("Priority")}</span>
                <span
                  className={
                    ticket.priority === 1 ? "text-rose-400" : "text-amber-400"
                  }
                >
                  {ticket.priority === 1 ? "High" : "Medium"}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">{t("Submitted")}</span>
                <span className="text-slate-300">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl bg-white/5 border border-white/5 space-y-6">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              {t("User Profile")}
            </h4>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-base/10 flex items-center justify-center text-xl font-black text-base uppercase">
                {ticket.user?.username[0]}
              </div>
              <div>
                <p className="text-lg font-black text-white">
                  @{ticket.user?.username}
                </p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">
                  {ticket.user?.email}
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/admin/users/${ticket.userId}`}
              className="w-full block py-3 rounded-xl bg-white/5 border border-white/5 text-center text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              {t("View User Profile")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
