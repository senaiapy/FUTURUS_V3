import React from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  hover = true,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-[#141726]/40 border border-white/5 rounded-[32px] overflow-hidden transition-all shadow-2xl shadow-black/20",
        hover && "hover:border-white/10",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}) {
  const variants = {
    default: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    info: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  };

  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  icon: Icon,
  loading = false,
  ...props
}: any) {
  const variants = {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20",
    secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/5",
    success:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20",
  };

  return (
    <button
      disabled={loading}
      className={cn(
        "px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-xl",
        variants[variant as keyof typeof variants],
        className,
      )}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </>
      )}
    </button>
  );
}
