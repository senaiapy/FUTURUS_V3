"use client";

import { useTranslations } from "next-intl";
import { TrendingUp, BarChart3, Search, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import MarketCard from "@/components/MarketCard";
import Header from "@/components/Header";

export default function MarketsPage() {
  const t = useTranslations();
  const [markets, setMarkets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [marketsRes, categoriesRes] = await Promise.all([
        api.get("/markets", {
          params: {
            categoryId: selectedCategory || undefined,
          },
        }),
        api.get("/categories"),
      ]);
      setMarkets(marketsRes.data.markets || []);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const filteredMarkets = markets.filter((m) =>
    m.question?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 font-maven bg-[#0f1117]">
        <section className="py-16">
          <div className="container mx-auto px-4">
            {/* Page Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
                <TrendingUp className="w-3.5 h-3.5" />
                {t("Active Markets")}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {t("Mercados")}
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                {t("Navegue e faça previsões em mercados que importam para você")}
              </p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder={t("Search markets...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-white/10 rounded-2xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                  !selectedCategory
                    ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20"
                    : "bg-slate-900/50 text-slate-400 border-white/5 hover:border-white/10"
                }`}
              >
                {t("All")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                    Number(selectedCategory) === cat.id
                      ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20"
                      : "bg-slate-900/50 text-slate-400 border-white/5 hover:border-white/10"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Markets Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-80 rounded-3xl bg-slate-900/50 animate-pulse border border-white/5"
                  />
                ))}
              </div>
            ) : filteredMarkets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMarkets.map((market) => (
                  <MarketCard key={market.id} market={market} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 glass-card rounded-3xl border border-dashed border-white/10">
                <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 text-lg font-medium">
                  {t("No active markets found.")}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
