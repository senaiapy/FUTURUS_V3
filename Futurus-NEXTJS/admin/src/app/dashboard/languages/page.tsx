"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import {
  Globe,
  ArrowLeft,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileCode,
} from "lucide-react";

export default function AdminLanguagesPage() {
  const router = useRouter();
  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetch = async () => {
      try {
        const res = await api.get("/settings/languages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLanguages(res.data);
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
              <Globe className="w-5 h-5 text-cyan-400" /> Language Management
            </h1>
          </div>
          <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
            <Plus className="w-4 h-4" /> Add Language
          </button>
        </div>
      </header>

      <main className="p-8 max-w-5xl mx-auto">
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl mb-8 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-400 mb-1">
              Localization System
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Adding a new language will generate a base translation set. You
              will need to provide translations for all UI keys to ensure a
              complete experience for your users.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full py-20 text-center text-slate-500">
              Syncing language packs...
            </div>
          ) : (
            languages.map((lang) => (
              <div
                key={lang.id}
                className="p-6 rounded-3xl border border-white/5 bg-slate-900/40 flex items-center justify-between hover:border-cyan-500/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl">
                    {lang.code === "en"
                      ? "🇺🇸"
                      : lang.code === "pt"
                        ? "🇧🇷"
                        : "🌐"}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">
                      {lang.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-white/5">
                        {lang.code}
                      </span>
                      {lang.isDefault && (
                        <span className="text-[10px] font-black uppercase text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Default
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors border border-white/5">
                    <FileCode className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors border border-white/5">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
