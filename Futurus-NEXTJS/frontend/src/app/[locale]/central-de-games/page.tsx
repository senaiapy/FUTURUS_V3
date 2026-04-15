"use client";

import { useTranslations } from "next-intl";
import Header from "@/components/Header";
import { Link } from "@/i18n/routing";
import {
  Gamepad2,
  Coins,
  Trophy,
  Users,
  ArrowRight,
  Target,
  Zap,
  Gift,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useSession } from "next-auth/react";

export default function GamePage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    coins: 0,
    tasksDone: 0,
    referrals: 0,
  });

  useEffect(() => {
    if (session) {
      api
        .get("/game/progress/dashboard")
        .then((res) => {
          const data = res.data;
          setStats({
            coins: data.coinBalance,
            tasksDone: data.completedTasks,
            referrals: data.referralCount,
          });
        })
        .catch(() => {});
    }
  }, [session]);

  const features = [
    {
      title: t("Daily Tasks"),
      desc: t(
        "Complete daily challenges to earn massive rewards and level up your profile.",
      ),
      icon: Target,
      color: "blue",
      link: "#tasks",
    },
    {
      title: t("Refer & Earn"),
      desc: t(
        "Invite your friends to Futurus and earn a percentage of their winnings forever.",
      ),
      icon: Users,
      color: "purple",
      link: "/dashboard/referral",
    },
    {
      title: t("Leaderboard"),
      desc: t(
        "Compete with others to climb the ranks and win exclusive seasonal prizes.",
      ),
      icon: Trophy,
      color: "amber",
      link: "/leaderboard",
    },
  ];

  const tasks = [
    {
      id: "twitter_follow",
      name: t("Follow us on Twitter"),
      desc: t("Follow @FuturusMarkets to earn coins"),
      reward: 50,
      icon: "la la-twitter", // Simplified icons
      url: "https://twitter.com/futurus",
    },
    {
      id: "first_deposit",
      name: t("Make your first deposit"),
      desc: t("Deposit at least R$ 10 and get a bonus"),
      reward: 200,
      icon: "la la-wallet",
      url: "/dashboard/deposit",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header />

      <main className="flex-1 py-12 md:py-24 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -z-10" />

        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16 md:mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base/10 border border-base/20 text-base text-sm font-bold uppercase tracking-widest mb-6 animate-fade-in">
              <Gamepad2 className="w-4 h-4" />
              {t("Gamify Center")}
            </div>
            <h1 className="text-4xl md:text-6xl font-maven font-bold text-white mb-6 tracking-tight">
              {t("Play, Predict")}
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">
                {t("& Earn Rewards")}
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed italic">
              {t(
                "Experimente a próxima geração de mercados de previsão com nosso sistema integrado de gamificação. Complete tarefas, indique amigos e ganhe muito.",
              )}
            </p>
          </div>

          {/* Stats Section (If Logged In) */}
          {session && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
              <div className="glass-card p-8 rounded-4xl border border-white/5 flex items-center gap-6 group hover:border-blue-500/20 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Coins className="text-blue-400 w-8 h-8" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                    {t("Your Coins")}
                  </p>
                  <h3 className="text-4xl font-bold text-white">
                    {stats.coins}
                  </h3>
                </div>
              </div>
              <div className="glass-card p-8 rounded-4xl border border-white/5 flex items-center gap-6 group hover:border-purple-500/20 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="text-purple-400 w-8 h-8" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                    {t("Tasks Done")}
                  </p>
                  <h3 className="text-4xl font-bold text-white">
                    {stats.tasksDone}
                  </h3>
                </div>
              </div>
              <div className="glass-card p-8 rounded-4xl border border-white/5 flex items-center gap-6 group hover:border-amber-500/20 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="text-amber-400 w-8 h-8" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                    {t("Referrals")}
                  </p>
                  <h3 className="text-4xl font-bold text-white">
                    {stats.referrals}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {features.map((feature, idx) => (
              <Link
                key={idx}
                href={feature.link}
                className="glass-card p-10 rounded-[3rem] border border-white/5 group hover:border-white/10 transition-all relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-${feature.color}-500/5 rounded-full blur-3xl -mr-16 -mt-16`}
                />
                <div
                  className={`w-16 h-16 rounded-2xl bg-${feature.color}-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon
                    className={`text-${feature.color}-400 w-8 h-8`}
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  {feature.title}
                  <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-slate-400 leading-relaxed italic">
                  {feature.desc}
                </p>
              </Link>
            ))}
          </div>

          {/* Tasks Section */}
          <div id="tasks" className="mb-24 scroll-mt-24">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              {t("Available Tasks")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="glass-card p-8 rounded-4xl border border-white/5 group hover:border-blue-500/20 transition-all"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Zap className="text-blue-400 w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">
                        {task.name}
                      </h4>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                        +{task.reward} {t("Coins")}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed italic">
                    {task.desc}
                  </p>
                  <Link
                    href={task.url}
                    className="w-full inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold transition-all border border-white/5 hover:border-white/10 hover:bg-slate-800"
                  >
                    {t("Go to Task")}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="relative rounded-[3rem] overflow-hidden p-12 md:p-24 text-center">
            <div className="absolute inset-0 bg-linear-to-br from-blue-600/20 to-purple-600/20 -z-10" />
            <div className="absolute inset-0 backdrop-blur-3xl -z-20 bg-slate-900/50" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />

            <div className="max-w-3xl mx-auto space-y-8">
              <Gift className="w-16 h-16 text-base mx-auto animate-bounce" />
              <h2 className="text-3xl md:text-5xl font-maven font-bold text-white">
                {t("Pronto para começar a ganhar?")}
              </h2>
              <p className="text-slate-400 text-lg md:text-xl leading-relaxed italic">
                {t(
                  "Junte-se a milhares de jogadores e comece a ganhar recompensas hoje. Faça previsões em seus mercados favoritos e domine o ranking.",
                )}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {session ? (
                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto px-10 py-4 rounded-full bg-base text-white font-bold transition-all shadow-lg shadow-base/20 hover:scale-105"
                  >
                    {t("Go to Dashboard")}
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="w-full sm:w-auto px-10 py-4 rounded-full bg-base text-white font-bold transition-all shadow-lg shadow-base/20 hover:scale-105"
                  >
                    {t("Join Now")}
                  </Link>
                )}
                <Link
                  href="/market"
                  className="w-full sm:w-auto px-10 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold transition-all hover:bg-white/10"
                >
                  {t("Explore Markets")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Reusing Footer from HomePage or just adding a simple one */}
      <footer className="border-t border-white/5 py-12 bg-slate-950">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            &copy; PY Foundation 2026 version={process.env.NEXT_PUBLIC_APP_VERSION} {t("All rights reserved")}
          </p>
        </div>
      </footer>
    </div>
  );
}
