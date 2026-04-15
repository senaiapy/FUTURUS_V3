"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  TrendingUp,
  Globe,
  Calendar,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default function BlogsPage() {
  const t = useTranslations();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/settings/frontend-sections?key=blog");
        const items = res.data || [];
        setBlogs(
          items
            .filter((i: any) => i.dataValues)
            .map((item: any) => {
              try {
                return { ...item, data: JSON.parse(item.dataValues) };
              } catch {
                return item;
              }
            }),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-display font-bold text-white tracking-tight">
              Futurus
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link href="/" className="hover:text-indigo-400 transition-colors">
              {t("Markets")}
            </Link>
            <Link href="/blogs" className="text-indigo-400">
              {t("Blog")}
            </Link>
            <Link
              href="/contact"
              className="hover:text-indigo-400 transition-colors"
            >
              {t("Contact")}
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-white/5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <Link
                href="/"
                locale="pt"
                className="text-xs hover:text-indigo-400"
              >
                PT
              </Link>
              <span className="text-slate-700">|</span>
              <Link
                href="/"
                locale="en"
                className="text-xs hover:text-indigo-400"
              >
                EN
              </Link>
            </div>
            <Link
              href="/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
            >
              {t("LOGIN")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              {t("Blog")}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              {t("Latest News")}
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              {t(
                "Stay updated with the latest news and insights from Futurus.",
              )}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-3xl bg-slate-900/50 animate-pulse border border-white/5"
                />
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug || blog.id}`}
                  className="glass-card rounded-3xl overflow-hidden group hover:border-indigo-500/30 transition-all bg-slate-900/40 border border-white/5"
                >
                  <div className="h-48 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-indigo-400/40" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {blog.data?.title || "Blog Post"}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                      {blog.data?.description || ""}
                    </p>
                    <span className="text-indigo-400 text-xs font-bold flex items-center gap-1">
                      {t("Read More")}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass-card rounded-3xl border border-dashed border-white/10">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500">{t("No blog posts yet.")}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 bg-slate-950">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            &copy; PY Foundation 2026 version={process.env.NEXT_PUBLIC_APP_VERSION}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
