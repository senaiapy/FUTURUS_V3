"use client";

import React, { useState } from "react";
import { X, Copy, Zap, Settings, Calendar, CheckCircle2 } from "lucide-react";

interface CronModalProps {
  isOpen: boolean;
  onClose: () => void;
  cronCommand?: string;
  lastExecution?: string;
}

export default function CronModal({
  isOpen,
  onClose,
  cronCommand = "curl -s http://localhost:3001/api/cron",
  lastExecution = "há 3 meses",
}: CronModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(cronCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="p-8 pb-6 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Por favor, configure a Tarefa Cron
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Uma vez a cada 5-10 minutos é o ideal, enquanto uma vez a cada
                minuto é a melhor opção
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 mb-6">
          <div className="h-px bg-slate-100 w-full" />
        </div>

        {/* Content Section */}
        <div className="px-8 pb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-900">
              Comando do Cron
            </span>
            <span className="text-sm italic font-bold text-slate-900">
              Última Execução do Cron:{" "}
              <span className="font-black text-slate-800">{lastExecution}</span>
            </span>
          </div>

          <div className="relative group">
            <div className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 pr-24 font-mono text-[13px] text-slate-700">
              {cronCommand}
            </div>
            <button
              onClick={handleCopy}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-100 text-indigo-600 hover:bg-slate-50 transition-all font-bold text-xs shadow-sm"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* Bottom Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 border-indigo-600/10 hover:border-indigo-600/20 text-indigo-600 font-bold transition-all bg-white group shadow-sm active:scale-95">
              <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
              Configuração da Tarefa Cron
            </button>
            <button className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 border-orange-100 hover:border-orange-200 text-orange-600/80 font-bold transition-all bg-white group shadow-sm active:scale-95">
              <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Executar Manualmente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
