"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import {
  BookOpen,
  Calendar,
  User,
  ArrowLeft,
  Eye,
  Share2,
  Clock,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import Header from "@/components/Header";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/api$/, "");

interface Blog {
  id: number;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  image?: string;
  category?: string;
  author?: string;
  status: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export default function BlogDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const slug = params?.slug as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) return;
      try {
        const res = await api.get(`/blogs/${slug}`);
        const data = res.data?.data || res.data;
        setBlog(data);
      } catch (err) {
        console.error("Failed to fetch blog", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  const getImageUrl = (image?: string) => {
    if (!image) return "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop";
    if (image.startsWith("http")) return image;
    return `${API_BASE}${image}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const estimateReadTime = (content?: string) => {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  // Simple markdown to HTML converter for basic formatting
  const renderContent = (content?: string) => {
    if (!content) return null;

    // Convert markdown-style formatting to HTML
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-white mt-8 mb-4">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-white mt-10 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-black text-white mt-10 mb-6">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Unordered lists
      .replace(/^- (.*$)/gim, '<li class="ml-6 mb-2 list-disc text-slate-300">$1</li>')
      // Ordered lists
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 mb-2 list-decimal text-slate-300">$1</li>')
      // Horizontal rule
      .replace(/^---$/gim, '<hr class="my-8 border-white/10" />')
      // Paragraphs (double newlines)
      .replace(/\n\n/g, '</p><p class="text-slate-300 leading-relaxed mb-4">')
      // Single newlines within paragraphs
      .replace(/\n/g, '<br />');

    // Wrap in paragraph tags
    html = `<p class="text-slate-300 leading-relaxed mb-4">${html}</p>`;

    return html;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-white/5 rounded-full w-32" />
              <div className="aspect-[16/9] bg-white/5 rounded-3xl" />
              <div className="h-12 bg-white/5 rounded-full w-3/4" />
              <div className="space-y-3">
                <div className="h-4 bg-white/5 rounded-full" />
                <div className="h-4 bg-white/5 rounded-full w-5/6" />
                <div className="h-4 bg-white/5 rounded-full w-4/6" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center py-24">
            <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-6" />
            <h1 className="text-3xl font-black text-white mb-4">
              Artigo nao encontrado
            </h1>
            <p className="text-slate-500 mb-8">
              O artigo que voce esta procurando nao existe ou foi removido.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Blog
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header />
      <main className="container mx-auto px-4 py-20 font-maven text-slate-50">
        <article className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-sm font-bold uppercase tracking-widest mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Blog
          </Link>

          {/* Hero Image */}
          <div className="aspect-[16/9] bg-slate-900 rounded-3xl border border-white/5 overflow-hidden mb-10 relative">
            <img
              src={getImageUrl(blog.image)}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

            {/* Category Badge */}
            <div className="absolute bottom-6 left-6">
              <span className="px-4 py-2 rounded-xl bg-base text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-base/20">
                {blog.category || "Mercados"}
              </span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-500 mb-6">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(blog.createdAt)}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {blog.author || "Admin"}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {estimateReadTime(blog.content)} min de leitura
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {blog.views} visualizacoes
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            {blog.title}
          </h1>

          {/* Description */}
          {blog.description && (
            <p className="text-xl text-slate-400 leading-relaxed mb-10 pb-10 border-b border-white/5">
              {blog.description}
            </p>
          )}

          {/* Content */}
          <div
            className="prose prose-invert prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: renderContent(blog.content) || "" }}
          />

          {/* Share Section */}
          <div className="mt-16 pt-8 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Gostou do artigo?</p>
                <p className="text-white font-bold">Compartilhe com seus amigos!</p>
              </div>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: blog.title,
                      text: blog.description,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copiado!");
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 rounded-2xl transition-all font-bold"
              >
                <Share2 className="w-5 h-5" />
                Compartilhar
              </button>
            </div>
          </div>

          {/* Back to Blog */}
          <div className="mt-16 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
            >
              <ArrowLeft className="w-5 h-5" />
              Ver todos os artigos
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
