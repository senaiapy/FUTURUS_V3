"use client";

import { useTranslations } from "next-intl";
import {
  Shield,
  Globe,
  Zap,
  Users,
  BarChart,
  Lock,
  ArrowRight,
  TrendingUp,
  Fingerprint,
} from "lucide-react";
import { Link } from "@/i18n/routing";

export default function AboutPage() {
  const t = useTranslations();

  return (
    <div className="font-maven text-slate-50">
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden border-b border-white/5">
        <div className="container mx-auto px-4 text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-base/5 border border-base/10 text-base text-[10px] font-black uppercase tracking-[0.2em]">
            <Globe className="w-3.5 h-3.5" />
            {t("Decentralized Futures")}
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">
            {t("Predicting the")} <br />
            <span className="text-base italic">{t("Next Big Move.")}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl leading-relaxed">
            {t("about.hero.description")}
          </p>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-base/5 rounded-full blur-[120px] -z-1" />
      </section>

      {/* Stats Section */}
      <section className="py-20 border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Traders", value: "250K+" },
              { label: "Volume Traded", value: "$4.2B" },
              { label: "Predict accuracy", value: "88.4%" },
              { label: "Markets Live", value: "1,200+" },
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <p className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  {t(stat.label)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-white leading-tight">
              {t("about.mission.title")}
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              {t("about.mission.description")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-base/10 flex items-center justify-center text-base border border-base/20">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-black text-white uppercase tracking-wider">
                  {t("Verified Data")}
                </h4>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  {t(
                    "Every market resolution is backed by multi-source oracles and community consensus.",
                  )}
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-black text-white uppercase tracking-wider">
                  {t("Deep Liquidity")}
                </h4>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  {t(
                    "Our automated market makers ensure you can enter and exit positions instantly.",
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="aspect-square bg-slate-900 rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl relative">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop"
                alt="Platform Mission"
                className="w-full h-full object-cover opacity-60 scale-105 group-hover:scale-100 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-base/10 mix-blend-overlay group-hover:opacity-0 transition-opacity" />
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-base/20 rounded-full blur-3xl -z-1 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 bg-base relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10 space-y-10">
          <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">
            {t("Ready to see the future?")}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/register"
              className="bg-white text-base px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
            >
              {t("Join 250k+ Traders")}
            </Link>
            <Link
              href="/"
              className="bg-black/20 text-white border border-white/20 px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-black/40 transition-all"
            >
              {t("Explore Markets")}
            </Link>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />
      </section>
    </div>
  );
}
