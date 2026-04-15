"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { BarChart3, TrendingUp, Users } from "lucide-react";
import { Decimal } from "decimal.js";

interface MarketCardProps {
  market: any;
}

function getImageUrl(image?: string | null): string {
  if (!image) return "/placeholder-market.png";
  // If it starts with /uploads, prepend the backend host
  if (image.startsWith("/uploads")) {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3301";
    // Remove /api suffix if present
    const base = backendUrl.replace(/\/api\/?$/, "");
    return `${base}${image}`;
  }
  // If it's already a full URL
  if (image.startsWith("http")) return image;
  return image;
}

export default function MarketCard({ market }: MarketCardProps) {
  const t = useTranslations();

  const yesShare = new Decimal(market.yesShare?.toString() || "50");
  const noShare = new Decimal(market.noShare?.toString() || "50");
  const volume = new Decimal(market.volume?.toString() || "0");

  return (
    <Link
      href={`/market/${market.slug}`}
      className="glass-card rounded-3xl overflow-hidden group hover:border-indigo-500/30 transition-all flex flex-col h-full bg-slate-900/40 border border-white/5"
    >
      {/* Market Image */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-800">
        <img
          src={getImageUrl(market.image)}
          alt={market.question}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-market.png";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-indigo-500/20 backdrop-blur-sm border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
          {market.category?.name || t("General")}
        </span>
      </div>

      <div className="p-6 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <BarChart3 className="w-3.5 h-3.5" />${volume.toFixed(2)} {t("Vol")}
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-6 line-clamp-2 min-h-[3.5rem] group-hover:text-indigo-400 transition-colors">
          {market.question}
        </h3>

        <div className="space-y-4">
          <div className="relative h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
              style={{ width: `${yesShare}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-1000"
              style={{ width: `${noShare}%` }}
            />
          </div>

          <div className="flex justify-between text-xs font-bold">
            <div className="flex flex-col items-start gap-1">
              <span className="text-emerald-400 uppercase tracking-tighter">
                {t("Yes")}
              </span>
              <span className="text-white text-base">
                {yesShare.toFixed(0)}%
              </span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-rose-400 uppercase tracking-tighter">
                {t("No")}
              </span>
              <span className="text-white text-base">
                {noShare.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-indigo-400" />
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {market._count?.purchases || 0} {t("trades")}
          </span>
        </div>
        <button className="text-indigo-400 text-xs font-bold flex items-center gap-1 group/btn">
          {t("Predict Now")}
          <TrendingUp className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </Link>
  );
}
