"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  BookOpen,
  Calendar,
  User,
  ArrowRight,
  TrendingUp,
  Search,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import Header from "@/components/Header";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/api$/, "");

export default function BlogsPage() {
  const t = useTranslations();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get("/blogs");
        const data = res.data?.data || res.data || [];
        setBlogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch blogs", err);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const getImageUrl = (image?: string) => {
    if (!image) return "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop";
    if (image.startsWith("http")) return image;
    return `${API_BASE}${image}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header />
      <main className="container mx-auto px-4 py-20 font-maven text-slate-50">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-base/10 border border-base/20 text-base text-[10px] font-black uppercase tracking-[0.2em]">
            <BookOpen className="w-3.5 h-3.5" />
            {t("Análises & Novidades")}
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
            O Jornal <span className="text-base italic">Futurus</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            {t("Análises especializadas, atualizações de mercado e estratégias de previsão da nossa equipe global de pesquisa.")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-[16/10] bg-white/5 rounded-3xl" />
                <div className="h-6 bg-white/5 rounded-full w-3/4" />
                <div className="h-4 bg-white/5 rounded-full w-1/2" />
              </div>
            ))
          ) : blogs.length > 0 ? (
            blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="group block space-y-6"
              >
                <div className="aspect-[16/10] bg-slate-900 rounded-3xl border border-white/5 overflow-hidden relative">
                  <img
                    src={getImageUrl(blog.image)}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg bg-base text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-base/20">
                      {blog.category || "Mercados"}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 px-2">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />{" "}
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="flex items-center gap-1.5">
                      <User className="w-3 h-3" /> {blog.author || "Admin"}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white group-hover:text-base transition-colors leading-tight">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {blog.description ||
                      "Descubra as últimas tendências em mercados de previsão e como maximizar seus retornos potenciais."}
                  </p>
                  <div className="pt-4 flex items-center gap-2 text-base font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                    {t("Ler Artigo")}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-3xl">
              <p className="text-slate-500 font-black uppercase tracking-[0.3em]">
                {t("Nenhum artigo disponível ainda.")}
              </p>
            </div>
          )}
        </div>
      </div>
      </main>
    </div>
  );
}
