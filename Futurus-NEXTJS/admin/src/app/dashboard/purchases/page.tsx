"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import {
  ShoppingCart,
  ArrowLeft,
  Search,
  TrendingUp,
  User,
  Calendar,
  Layers,
  DollarSign,
  BarChart3,
  ExternalLink,
} from "lucide-react";

export default function AdminPurchasesPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetch = async () => {
      try {
        const res = await api.get("/admin/reports/purchases", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPurchases(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [router]);

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
              <ShoppingCart className="w-5 h-5 text-emerald-400" /> Trade
              Reports
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                placeholder="Search trades..."
                className="bg-slate-900 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-64"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 text-sm">
                Loading purchase history...
              </p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-white/5 bg-slate-900/20">
              <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500">No purchase records found.</p>
            </div>
          ) : (
            purchases.map((p) => (
              <div
                key={p.id}
                className="p-6 rounded-3xl border border-white/5 bg-slate-900/20 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-500/20 transition-all group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                      {p.marketOption?.market?.question || "Unknown Market"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 uppercase tracking-widest font-black">
                      <span className="flex items-center gap-1 text-indigo-400">
                        <Layers className="w-3 h-3" /> {p.marketOption?.name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {p.user?.username}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{" "}
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">
                      Amount
                    </p>
                    <p className="text-xl font-black text-white">
                      ${Number(p.amount).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">
                      Quantity
                    </p>
                    <p className="text-xl font-black text-white">
                      {p.quantity}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/markets/${p.marketOption?.market?.id}`}
                    className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all border border-white/5"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
