"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TrendingUp, Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { getAppName, getFullLogoPath } from "@/lib/app-config";

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [show2fa, setShow2fa] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Get callback URL from search params, default to /dashboard
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Manually check login to see if 2FA is needed
      const res = await api.post("/auth/login", {
        username: data.username,
        password: data.password,
      });

      if (res.data.requires2fa) {
        setUserId(res.data.userId || res.data.adminId);
        setIsAdmin(!!res.data.adminId);
        setShow2fa(true);
        setLoading(false);
        return;
      }

      // 2. Normal login
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("Invalid credentials"));
      } else {
        // Redirect to the callback URL (original page user tried to access)
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || t("Invalid credentials"));
    } finally {
      setLoading(false);
    }
  };

  const onVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = isAdmin ? "/admin/2fa/verify-login" : "/auth/verify-2fa";
      const res = await api.post(endpoint, {
        adminId: isAdmin ? userId : undefined,
        userId: !isAdmin ? userId : undefined,
        code: twoFactorCode,
      });

      // verify-2fa returns the same as a successful login { user, access_token }
      const result = await signIn("credentials", {
        alreadyVerified: 'true',
        user: JSON.stringify(res.data),
        redirect: false,
      });

      if (result?.error) {
        setError(t("Invalid 2FA code"));
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || t("Invalid 2FA code"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-950">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6 group">
            <div className="h-16 w-auto group-hover:scale-105 transition-transform">
              <img src={getFullLogoPath()} alt={getAppName()} className="h-full w-auto object-contain" />
            </div>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            {t("Welcome Back")}
          </h1>
          <p className="text-slate-400">
            {t("Sign in to continue predicting and winning.")}
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl bg-white/5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center mb-6">
              {error}
            </div>
          )}

          {!show2fa ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">
                  {t("Username or Email")}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input
                    {...register("username")}
                    type="text"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
                    placeholder={t("Enter your username or email")}
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-red-400 ml-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-slate-300">
                    {t("Password")}
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    {t("Forgot password?")}
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400 ml-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group overflow-hidden relative"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {t("Sign In")}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={onVerify2fa} className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="text-center space-y-2 mb-4">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {t("Two-Factor Authentication")}
                </h3>
                <p className="text-sm text-slate-400">
                  {t("Enter the 6-digit code from your authenticator app.")}
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-5 text-center text-4xl font-black tracking-[0.4em] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all shadow-inner"
                  placeholder="000000"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || twoFactorCode.length !== 6}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    {t("Verify Code")}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShow2fa(false)}
                className="w-full text-slate-500 hover:text-slate-300 font-medium text-sm transition-colors py-2"
              >
                {t("Back to Login")}
              </button>
            </form>
          )}

          {/* OAuth Buttons - Enable by setting NEXT_PUBLIC_OAUTH_ENABLED=true */}
          {!show2fa && process.env.NEXT_PUBLIC_OAUTH_ENABLED === "true" && (
            <div className="mt-6 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-slate-900/50 px-3 text-slate-500 uppercase tracking-wider">
                    {t("Or continue with")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    // Pass callback URL to OAuth flow
                    const encodedCallback = encodeURIComponent(callbackUrl);
                    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?callbackUrl=${encodedCallback}`;
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl border border-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm">Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Pass callback URL to OAuth flow
                    const encodedCallback = encodeURIComponent(callbackUrl);
                    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook?callbackUrl=${encodedCallback}`;
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-sm">Facebook</span>
                </button>
              </div>
            </div>
          )}

          {!show2fa && (
            <div className="mt-8 text-center pt-8 border-t border-white/5">
              <p className="text-slate-400 text-sm">
                {t("Don't have an account?")}{" "}
                <Link
                  href={
                    callbackUrl !== "/dashboard"
                      ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
                      : "/register"
                  }
                  className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                >
                  {t("Create account")}
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
