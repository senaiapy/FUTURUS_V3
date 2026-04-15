"use client";

import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  Zap,
  Users,
  TrendingUp,
  Lock,
  HeadphonesIcon,
  CheckCircle,
} from "lucide-react";

export default function WhyChooseUsPage() {
  const t = useTranslations();

  const features = [
    {
      icon: <ShieldCheck />,
      title: "features.security.title",
      description: "features.security.description",
    },
    {
      icon: <Zap />,
      title: "features.fast.title",
      description: "features.fast.description",
    },
    {
      icon: <TrendingUp />,
      title: "features.advanced.title",
      description: "features.advanced.description",
    },
    {
      icon: <Users />,
      title: "features.community.title",
      description: "features.community.description",
    },
    {
      icon: <Lock />,
      title: "features.privacy.title",
      description: "features.privacy.description",
    },
    {
      icon: <HeadphonesIcon />,
      title: "features.support.title",
      description: "features.support.description",
    },
  ];

  const stats = [
    { value: "500K+", label: "Active Users" },
    { value: "$10M+", label: "Trading Volume" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <main className="flex-1 font-maven">
        <section className="py-24">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-20">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t("Why Choose Futurus")}
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                {t("Discover the advantages that make us the leading prediction market platform")}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="glass-card rounded-2xl p-8 text-center border border-white/5"
                >
                  <div className="text-3xl md:text-4xl font-bold text-base mb-2">
                    {stat.value}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {t(stat.label)}
                  </div>
                </div>
              ))}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="glass-card rounded-2xl p-10 border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="p-4 rounded-xl bg-blue-500/10 text-blue-400 mb-6 inline-block">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    {t(feature.title)}
                  </h3>
                  <p className="text-slate-400 text-base leading-relaxed mb-6">
                    {t(feature.description)}
                  </p>
                  <div className="space-y-2">
                    {[
                      t("Benefit 1"),
                      t("Benefit 2"),
                      t("Benefit 3"),
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-slate-300">
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="glass-card rounded-2xl p-12 border border-white/10">
              <h2 className="text-2xl font-bold text-white text-center mb-10">
                {t("Trusted by Thousands of Users Worldwide")}
              </h2>
              <div className="flex flex-wrap justify-center items-center gap-12">
                {[
                  "Licensed & Regulated",
                  "Bank-Grade Security",
                  "Instant Withdrawals",
                  "Transparent Pricing",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold">{t(item)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-16">
              <p className="text-slate-400 mb-6">
                {t("Join thousands of satisfied users today")}
              </p>
              <button className="px-10 py-4 bg-base text-white font-bold rounded-2xl hover:bg-blue-500 transition-colors duration-300 text-lg">
                {t("Create Free Account")}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
