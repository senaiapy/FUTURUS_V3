"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Wallet, Coins, ChevronDown, Check } from "lucide-react";

export type TradingMode = "CASH" | "SOLANA";

interface ModeSelectorProps {
  value: TradingMode;
  onChange: (mode: TradingMode) => void;
  disabled?: boolean;
  compact?: boolean;
}

export default function ModeSelector({
  value,
  onChange,
  disabled = false,
  compact = false,
}: ModeSelectorProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  const modes = [
    {
      id: "CASH" as TradingMode,
      label: t("Cash (BRL)"),
      description: t("Traditional trading with PIX/Card"),
      icon: Wallet,
      color: "emerald",
    },
    {
      id: "SOLANA" as TradingMode,
      label: t("Solana (FUT)"),
      description: t("On-chain trading with FUT tokens"),
      icon: Coins,
      color: "purple",
    },
  ];

  const selected = modes.find((m) => m.id === value) || modes[0];
  const Icon = selected.icon;

  if (compact) {
    return (
      <div className="flex gap-1 p-1 bg-slate-100 rounded-full">
        {modes.map((mode) => {
          const ModeIcon = mode.icon;
          const isSelected = value === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => !disabled && onChange(mode.id)}
              disabled={disabled}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                isSelected
                  ? mode.color === "emerald"
                    ? "bg-emerald-500 text-white shadow-lg"
                    : "bg-purple-500 text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-700"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <ModeIcon className="w-4 h-4" />
              {mode.id === "CASH" ? "BRL" : "FUT"}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-slate-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              selected.color === "emerald" ? "bg-emerald-100" : "bg-purple-100"
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                selected.color === "emerald"
                  ? "text-emerald-600"
                  : "text-purple-600"
              }`}
            />
          </div>
          <div className="text-left">
            <div className="font-bold text-slate-900">{selected.label}</div>
            <div className="text-xs text-slate-500">{selected.description}</div>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 w-full mt-2 py-2 bg-white border border-slate-200 rounded-2xl shadow-xl">
            {modes.map((mode) => {
              const ModeIcon = mode.icon;
              const isSelected = value === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    onChange(mode.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        mode.color === "emerald"
                          ? "bg-emerald-100"
                          : "bg-purple-100"
                      }`}
                    >
                      <ModeIcon
                        className={`w-5 h-5 ${
                          mode.color === "emerald"
                            ? "text-emerald-600"
                            : "text-purple-600"
                        }`}
                      />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-900">
                        {mode.label}
                      </div>
                      <div className="text-xs text-slate-500">
                        {mode.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <Check
                      className={`w-5 h-5 ${
                        mode.color === "emerald"
                          ? "text-emerald-500"
                          : "text-purple-500"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
