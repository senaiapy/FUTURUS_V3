"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import {
  MessageSquare,
  ArrowLeft,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  User,
  Clock,
  ThumbsUp,
  Flag,
} from "lucide-react";

export default function AdminCommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetch = async () => {
      try {
        const res = await api.get("/admin/comments/reported", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [router]);

  const toggleStatus = async (id: number) => {
    const token = localStorage.getItem("admin_token");
    try {
      await api.patch(
        `/admin/comments/${id}/status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setComments(
        comments.map((c) =>
          c.id === id ? { ...c, status: c.status === 1 ? 0 : 1 } : c,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-400" /> Reported
              Comments
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-4 py-1.5 rounded-full">
            <Flag className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
              {comments.length} Reports
            </span>
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 text-sm">
                Auditing community content...
              </p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-white/5 bg-slate-900/20">
              <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
              <p className="text-slate-500">
                All clear! No reported comments found.
              </p>
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="p-8 rounded-3xl border border-white/5 bg-slate-900/20 hover:border-rose-500/20 transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50" />

                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          @{c.user?.username}
                        </p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1.5 uppercase font-black tracking-tighter">
                          <Clock className="w-3 h-3" />{" "}
                          {new Date(c.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 mb-4 italic text-slate-300 relative">
                      <MessageSquare className="w-4 h-4 text-slate-700 absolute -top-2 -left-2" />
                      "{c.content}"
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">
                          {c.likesCount || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">
                          {c.reportsCount || 0} reports
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        On Market:{" "}
                        <span className="text-indigo-400/70">
                          #{c.marketId}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <button
                      onClick={() => toggleStatus(c.id)}
                      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${c.status === 1 ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"}`}
                    >
                      {c.status === 1 ? (
                        <Trash2 className="w-4 h-4" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      {c.status === 1 ? "Ban Comment" : "Restore"}
                    </button>
                    <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition-all border border-white/5">
                      Dismiss Report
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
