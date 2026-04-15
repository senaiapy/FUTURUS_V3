"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  Search,
  History,
  Activity,
  User,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Monitor,
  Globe,
  BarChart3,
} from "lucide-react";

export default function AdminReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("transactions");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetch = async () => {
      setLoading(true);
      try {
        const endpoint =
          activeTab === "transactions"
            ? "/admin/reports/transactions"
            : "/admin/reports/logins";
        const res = await api.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [router, activeTab]);

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
              <FileText className="w-5 h-5 text-indigo-400" /> System Reports
            </h1>
          </div>
          <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "transactions" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "text-slate-500 hover:text-white"}`}
            >
              <Activity className="w-4 h-4" /> Transactions
            </button>
            <button
              onClick={() => setActiveTab("logins")}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "logins" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "text-slate-500 hover:text-white"}`}
            >
              <Monitor className="w-4 h-4" /> Login History
            </button>
          </div>
        </div>
      </header>

      <main className="p-8">
        {activeTab === "transactions" ? (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-20 text-slate-500">
                Processing ledger...
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                No transactions recorded.
              </div>
            ) : (
              data.map((tr) => (
                <div
                  key={tr.id}
                  className="p-5 rounded-2xl border border-white/5 bg-slate-900/40 flex items-center justify-between hover:border-indigo-500/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${tr.type === "+" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}
                    >
                      {tr.type === "+" ? (
                        <ArrowDownLeft className="w-6 h-6" />
                      ) : (
                        <ArrowUpRight className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {tr.remark || "System Transaction"}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-2 font-medium">
                        <User className="w-3 h-3 text-slate-700" /> @
                        {tr.user?.username} •{" "}
                        <Clock className="w-3 h-3 text-slate-700" />{" "}
                        {new Date(tr.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-black ${tr.type === "+" ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {tr.type}
                      {Number(tr.amount).toFixed(2)} {tr.currency || "$"}
                    </p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                      Trx: {tr.trx || "N/A"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-20 text-slate-500">
                Retrieving access logs...
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                No login attempts recorded.
              </div>
            ) : (
              data.map((log) => (
                <div
                  key={log.id}
                  className="p-6 rounded-3xl border border-white/5 bg-slate-900/40 flex items-center justify-between hover:border-indigo-500/20 transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center">
                      {log.countryCode === "US" ? (
                        "🇺🇸"
                      ) : log.countryCode === "BR" ? (
                        "🇧🇷"
                      ) : (
                        <Globe className="w-6 h-6 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        @{log.user?.username}{" "}
                        <span className="text-slate-500 font-normal ml-2">
                          logged in from {log.city}, {log.country}
                        </span>
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Monitor className="w-3 h-3" /> {log.browser} on{" "}
                          {log.os}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                          IP: {log.userIp}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 mb-1">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
