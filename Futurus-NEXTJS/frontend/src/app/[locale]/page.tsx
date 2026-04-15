"use client";

import { useTranslations } from "next-intl";
import {
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Globe,
  Search,
  Filter,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import MarketCard from "@/components/MarketCard";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { features } from "@/lib/landing-data";
import { useSearchParams } from "next/navigation";

interface SiteSettings {
  siteName: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
}

export default function HomePage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const [markets, setMarkets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>({ siteName: "Futurus" });

  const fetchData = async (sortBy?: string) => {
    setLoading(true);
    try {
      const [marketsRes, categoriesRes] = await Promise.all([
        api.get("/markets", {
          params: {
            categoryId: selectedCategory || undefined,
            sortBy: sortBy,
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
    const filter = searchParams.get("filter");
    fetchData(filter || undefined);

    // Fetch site settings for contact info
    api.get("/settings/general")
      .then((res) => setSettings(res.data))
      .catch(() => {});
  }, [selectedCategory, searchParams]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header />

      <main className="flex-1 font-maven">
        {/* New Animated Hero Banner */}
        <Banner />

        {/* Markets Grid Section */}
        <section className="py-24 overflow-hidden relative">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] glow-orb -z-10" />

          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                <TrendingUp className="text-base w-8 h-8" />
                {t("Active Markets")}
              </h2>
              <div className="flex items-center gap-4">
                <button className="p-3 rounded-2xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-all hover:border-white/10">
                  <Search className="w-5 h-5" />
                </button>
                <button className="p-3 rounded-2xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-all hover:border-white/10">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-12 overflow-x-auto pb-4 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                  !selectedCategory
                    ? "bg-base text-white border-base shadow-[0_0_20px_rgba(var(--base),0.3)]"
                    : "bg-slate-900/50 text-slate-400 border-white/5 hover:border-white/10"
                }`}
              >
                {t("All")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                    Number(selectedCategory) === cat.id
                      ? "bg-base text-white border-base shadow-[0_0_20px_rgba(var(--base),0.3)]"
                      : "bg-slate-900/50 text-slate-400 border-white/5 hover:border-white/10"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-80 rounded-[2rem] bg-slate-900/50 animate-pulse border border-white/5"
                  />
                ))}
              </div>
            ) : markets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {markets.map((market) => (
                  <MarketCard key={market.id} market={market} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 glass-card rounded-[2rem] border border-dashed border-white/10">
                <p className="text-slate-500 text-lg">
                  {t("No active markets found.")}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-32 relative overflow-hidden bg-slate-900/20">
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] glow-orb -z-10" />

          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="glass-card p-10 rounded-[2rem] group hover:border-white/20 transition-all duration-500 hover:-translate-y-2"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl bg-${feature.color}-500/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-${feature.color}-500/20 transition-all duration-500`}
                  >
                    <feature.icon
                      className={`text-${feature.color}-400 w-8 h-8`}
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-24 bg-slate-950 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Partners Scroll */}
          <div className="mb-24">
            <h4 className="text-center text-slate-500 text-sm font-bold uppercase tracking-widest mb-12">
              {t("Trusted by Industry Leaders")}
            </h4>
            <div className="flex overflow-hidden group">
              <div className="flex gap-20 animate-scroll pause-on-hover py-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-20 items-center">
                    {[
                      "690f26b7318451762600631.png",
                      "690f26bd459f91762600637.png",
                      "690f26c37e4461762600643.png",
                      "690f26c94a5161762600649.png",
                      "690f26cd933321762600653.png",
                      "690f26d17a6f21762600657.png",
                      "690f26d85ac991762600664.png",
                    ].map((partner, idx) => (
                      <div
                        key={idx}
                        className="w-32 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                      >
                        <Image
                          src={`/images/frontend/partner/${partner}`}
                          alt="Partner"
                          width={128}
                          height={48}
                          className="object-contain"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 pb-20 border-b border-white/5">
            {/* Logo and About */}
            <div className="space-y-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                  <Image
                    src="/images/logo/logo.png"
                    alt="Futurus"
                    width={100}
                    height={30}
                    className="h-7 w-auto"
                  />
                </div>
              </Link>
              <p className="text-slate-400 text-base leading-relaxed">
                {t(
                  "A sua plataforma de referência para previsões de mercado, negociação de microações e análises sobre política, esportes, criptomoedas, finanças e eventos globais.",
                )}
              </p>
              <div className="flex flex-col gap-6">
                <h5 className="text-white font-semibold text-lg">
                  {t("Siga-nos Em:")}
                </h5>
                <div className="flex gap-4">
                  {[
                    { Icon: Facebook, color: "blue" },
                    { Icon: Twitter, color: "sky" },
                    { Icon: Instagram, color: "pink" },
                    { Icon: Linkedin, color: "blue" },
                  ].map(({ Icon, color }, idx) => (
                    <Link
                      key={idx}
                      href="#"
                      className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300 group"
                    >
                      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-8">
              <h5 className="text-white font-bold text-lg tracking-tight">
                {t("Link Útil")}
              </h5>
              <ul className="space-y-4">
                {[
                  { name: "Início", href: "/" },
                  { name: "Blog", href: "/blog" },
                  { name: "Game", href: "/central-de-games" },
                  { name: "Contato", href: "/contact" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-slate-400 hover:text-blue-400 transition-colors inline-block"
                    >
                      {t(item.name)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policy Links */}
            <div className="space-y-8">
              <h5 className="text-white font-bold text-lg tracking-tight">
                {t("Link de Política")}
              </h5>
              <ul className="space-y-4">
                {[
                  { name: "Política de Privacidade", href: "/privacy" },
                  { name: "Termos de Serviço", href: "/terms" },
                  { name: "Política de Segurança", href: "/security" },
                  { name: "Remover Conta", href: "/account-removal" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-slate-400 hover:text-blue-400 transition-colors inline-block"
                    >
                      {t(item.name)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info - Dynamic from API */}
            <div className="space-y-8">
              <h5 className="text-white font-bold text-lg tracking-tight">
                {t("Informação de Contato")}
              </h5>
              <ul className="space-y-6">
                {settings.contactEmail && (
                  <li className="flex items-start gap-4 text-slate-400">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                      <Mail className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <span className="block text-slate-500 text-xs uppercase font-bold mb-1">
                        Email
                      </span>
                      <a
                        href={`mailto:${settings.contactEmail}`}
                        className="hover:text-white transition-colors"
                      >
                        {settings.contactEmail}
                      </a>
                    </div>
                  </li>
                )}
                {settings.contactPhone && (
                  <li className="flex items-start gap-4 text-slate-400">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <Phone className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <span className="block text-slate-500 text-xs uppercase font-bold mb-1">
                        Telefone
                      </span>
                      <a
                        href={`tel:${settings.contactPhone.replace(/\D/g, "")}`}
                        className="hover:text-white transition-colors"
                      >
                        {settings.contactPhone}
                      </a>
                    </div>
                  </li>
                )}
                {settings.contactAddress && (
                  <li className="flex items-start gap-4 text-slate-400">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                      <MapPin className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <span className="block text-slate-500 text-xs uppercase font-bold mb-1">
                        Endereço
                      </span>
                      <span className="text-slate-300">
                        {settings.contactAddress}
                      </span>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-12 flex flex-col lg:flex-row justify-between items-center gap-12">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <span className="text-slate-500 text-sm font-semibold whitespace-nowrap">
                {t("Aceitamos:")}
              </span>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  "6911900d35e711762758669.png",
                  "691190a5a34aa1762758821.png",
                  "691190aa5774b1762758826.png",
                  "691190aed48411762758830.png",
                  "691190b2d6e981762758834.png",
                  "691190b893a2b1762758840.png",
                ].map((payment, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2.5 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Image
                      src={`/images/frontend/payments/${payment}`}
                      alt="Payment"
                      width={48}
                      height={24}
                      className="h-6 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-8">
              <p className="text-slate-500 text-sm font-medium">
                {t("Copyright")} &copy; PY Foundation 2026 version={process.env.NEXT_PUBLIC_APP_VERSION}{" "}
                {t("Todos os direitos reservados.")}
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-500 group"
              >
                <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
