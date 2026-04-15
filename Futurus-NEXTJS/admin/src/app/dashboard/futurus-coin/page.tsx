"use client";

import { CircleDollarSign, ArrowLeftRight, Gift, TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FuturusCoinPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-2xl">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.15),transparent_50%)]" />
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
          </div>

          <div className="relative z-10 p-8 md:p-12 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center border-4 border-white/50 shadow-2xl animate-pulse">
                  <CircleDollarSign className="w-14 h-14 text-white" />
                </div>
                {/* Floating coins */}
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-yellow-400 rounded-full animate-bounce flex items-center justify-center shadow-lg" style={{ animationDelay: '0s' }}>
                  <span className="text-amber-800 text-xs font-black">$</span>
                </div>
                <div className="absolute -bottom-2 -left-4 w-5 h-5 bg-yellow-300 rounded-full animate-bounce flex items-center justify-center shadow-lg" style={{ animationDelay: '0.5s' }}>
                  <span className="text-amber-800 text-[10px] font-black">$</span>
                </div>
                <div className="absolute top-1/2 -right-5 w-4 h-4 bg-yellow-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '1s' }} />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Futurus Coin
            </h1>

            {/* Badge */}
            <div className="inline-block mb-6">
              <span className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full text-amber-900 font-bold text-sm uppercase tracking-widest shadow-lg">
                Em Breve
              </span>
            </div>

            {/* Description */}
            <p className="text-white/95 text-lg md:text-xl leading-relaxed mb-8 max-w-md mx-auto">
              A moeda do futuro esta chegando! Prepare-se para uma nova era de transacoes, recompensas e muito mais com a Futurus Coin.
            </p>

            {/* Features Preview */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:bg-white/25 transition-all hover:-translate-y-1">
                <ArrowLeftRight className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
                <span className="text-white/90 text-xs font-bold block">Transacoes</span>
              </div>
              <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:bg-white/25 transition-all hover:-translate-y-1">
                <Gift className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
                <span className="text-white/90 text-xs font-bold block">Recompensas</span>
              </div>
              <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:bg-white/25 transition-all hover:-translate-y-1">
                <TrendingUp className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
                <span className="text-white/90 text-xs font-bold block">Staking</span>
              </div>
            </div>

            {/* Stats Preview */}
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-4 mb-8 border border-white/10">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <span className="text-2xl font-black text-yellow-300 block">0.00</span>
                  <span className="text-white/60 text-xs font-bold uppercase">Preco</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-black text-yellow-300 block">---</span>
                  <span className="text-white/60 text-xs font-bold uppercase">Supply</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-black text-yellow-300 block">---</span>
                  <span className="text-white/60 text-xs font-bold uppercase">Holders</span>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-400 text-amber-900 rounded-2xl font-bold text-sm hover:from-yellow-300 hover:to-amber-300 transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
