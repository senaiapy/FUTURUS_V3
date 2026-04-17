"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TrendingUp, Mail, ArrowLeft, Send } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { getAppName, getFullLogoPath } from "@/lib/app-config";

const resetSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

type ResetForm = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/users/password/email", { email: data.email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t("Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-950">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6 group">
            <div className="h-16 w-auto group-hover:scale-105 transition-transform">
              <img src={getFullLogoPath()} alt={getAppName()} className="h-full w-auto object-contain" />
            </div>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            {t("Reset Password")}
          </h1>
          <p className="text-slate-400">
            {t("Enter your email to reset your password.")}
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl bg-white/5">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Send className="text-emerald-400 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {t("Code Sent!")}
              </h3>
              <p className="text-slate-400 text-sm">
                {t("Check your email for the reset code.")}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">
                  {t("Email")}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                    placeholder={t("Enter your email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400 ml-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>{t("Send Reset Code")}</>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <Link
              href="/login"
              className="text-indigo-400 text-sm font-bold flex items-center justify-center gap-2 hover:text-indigo-300"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("Back to Login")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
