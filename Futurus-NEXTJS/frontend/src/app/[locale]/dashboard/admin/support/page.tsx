"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  MessageSquare,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  MoreVertical,
  LifeBuoy,
} from "lucide-react";
import { Link } from "@/i18n/routing";

export default function AdminSupportPage() {
  const t = useTranslations();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/support", {
        params: {
          search: searchTerm || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
      });
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to fetch admin tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [searchTerm, statusFilter]);

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">
            Open
          </span>
        );
      case 1:
        return (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">
            Answered
          </span>
        );
      case 2:
        return (
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">
            Replied
          </span>
        );
      case 3:
        return (
          <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 font-maven">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-base/10 border border-base/20 flex items-center justify-center text-base">
            <LifeBuoy className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">
              {t("Support Tickets")}
            </h1>
            <p className="text-slate-400 mt-1">
              Manage and respond to user inquiries and technical issues.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:row gap-4 items-center justify-between bg-white/5 border border-white/5 p-4 rounded-3xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={t("Search by subject or ticket ID...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-base transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {["all", "open", "answered", "replied", "closed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${statusFilter === s ? "bg-base text-white border-base shadow-lg shadow-base/20" : "bg-white/5 text-slate-500 border-white/5 hover:border-white/10"}`}
            >
              {t(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {t("Ticket / Subject")}
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {t("User")}
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {t("Priority")}
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                  {t("Status")}
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">
                  {t("Last Update")}
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8">
                      <div className="h-4 bg-white/5 rounded-full w-full" />
                    </td>
                  </tr>
                ))
              ) : tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-white/[0.04] transition-colors group"
                  >
                    <td className="px-6 py-6">
                      <p className="text-sm font-bold text-white mb-1">
                        {ticket.subject}
                      </p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                        #{ticket.ticket}
                      </p>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-base/10 flex items-center justify-center text-[10px] font-black text-base uppercase">
                          {ticket.user?.username[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            @{ticket.user?.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-maven">
                      {ticket.priority === 1 ? (
                        <span className="text-rose-400 text-[10px] font-black uppercase flex items-center gap-1.5">
                          <AlertCircle className="w-3 h-3" /> {t("High")}
                        </span>
                      ) : ticket.priority === 2 ? (
                        <span className="text-amber-400 text-[10px] font-black uppercase flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> {t("Medium")}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-black uppercase flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> {t("Low")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-6 text-center">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">
                        {new Date(ticket.updatedAt).toLocaleTimeString()}
                      </p>
                      <p className="text-[9px] text-slate-600 font-bold mt-0.5">
                        {new Date(ticket.updatedAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-6">
                      <Link
                        href={`/dashboard/admin/support/${ticket.ticket}`}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:border-base/50 transition-all flex items-center justify-center"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                      {t("No tickets found matching your filters")}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
