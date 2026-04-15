"use client";

import { Bot, Brain, Cog, BarChart3, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function IAControlPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-2xl">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
          {/* Animated Background - Neural Network Effect */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,255,0.1),transparent_50%)]" />
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(138,43,226,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2300ffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
          </div>

          {/* Floating nodes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute top-20 right-20 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDuration: '2.5s' }} />
            <div className="absolute bottom-20 left-20 w-2 h-2 bg-cyan-300 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute bottom-10 right-10 w-2 h-2 bg-purple-300 rounded-full animate-ping" style={{ animationDuration: '2.2s' }} />
          </div>

          <div className="relative z-10 p-8 md:p-12 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-400 via-cyan-500 to-purple-500 flex items-center justify-center border-2 border-cyan-400/50 shadow-[0_0_60px_rgba(0,255,255,0.4)] animate-pulse">
                  <Bot className="w-14 h-14 text-slate-900" />
                </div>
                {/* Neural nodes */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(0,255,255,0.8)]" style={{ animationDelay: '0s' }} />
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-purple-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(138,43,226,0.8)]" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-1/2 -right-4 w-2 h-2 bg-cyan-300 rounded-full animate-bounce shadow-[0_0_10px_rgba(0,255,255,0.6)]" style={{ animationDelay: '1s' }} />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              IA Control
            </h1>

            {/* Badge */}
            <div className="inline-block mb-6">
              <span className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full text-slate-900 font-bold text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,255,0.4)]">
                Em Breve
              </span>
            </div>

            {/* Description */}
            <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-8 max-w-md mx-auto">
              O futuro da inteligencia artificial esta chegando! Em breve voce tera controle total sobre modelos de IA, automacoes inteligentes e muito mais.
            </p>

            {/* Features Preview */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-cyan-500/10 backdrop-blur-xl rounded-2xl p-4 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                <Brain className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <span className="text-white/90 text-xs font-bold block">Modelos IA</span>
              </div>
              <div className="bg-cyan-500/10 backdrop-blur-xl rounded-2xl p-4 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                <Cog className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <span className="text-white/90 text-xs font-bold block">Automacao</span>
              </div>
              <div className="bg-cyan-500/10 backdrop-blur-xl rounded-2xl p-4 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                <BarChart3 className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <span className="text-white/90 text-xs font-bold block">Analytics</span>
              </div>
            </div>

            {/* Stats Preview */}
            <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-4 mb-8 border border-cyan-500/10">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <span className="text-2xl font-black text-cyan-400 font-mono block">---</span>
                  <span className="text-white/60 text-xs font-bold uppercase">Modelos</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-black text-cyan-400 font-mono block">---</span>
                  <span className="text-white/60 text-xs font-bold uppercase">Automacoes</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-black text-cyan-400 font-mono block">---</span>
                  <span className="text-white/60 text-xs font-bold uppercase">Requisicoes</span>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-900 rounded-2xl font-bold text-sm hover:from-cyan-300 hover:to-cyan-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,255,255,0.3)]"
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
