"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [requires2fa, setRequires2fa] = useState(false);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First, try to login as super admin
      const res = await api.post("/admin/login", { username, password });

      if (res.data.requires2fa) {
        setRequires2fa(true);
        setAdminId(res.data.adminId);
        setLoading(false);
        return;
      }

      // Store admin data
      localStorage.setItem("admin_token", res.data.access_token);
      localStorage.setItem("admin_user", JSON.stringify(res.data.admin));
      localStorage.setItem("admin_role", res.data.role || "admin");

      // Super admin - no permissions restrictions
      localStorage.removeItem("admin_permissions");

      router.push("/dashboard");
    } catch (adminErr: any) {
      // If admin login fails, try user login (staff with permissions)
      try {
        const userRes = await api.post("/admin/login-user", { username, password });

        // Check if user has access
        if (userRes.data.role !== "user_admin") {
          throw new Error("Access denied");
        }

        // Store user admin data
        localStorage.setItem("admin_token", userRes.data.access_token);
        localStorage.setItem("admin_user", JSON.stringify(userRes.data.admin));
        localStorage.setItem("admin_role", userRes.data.role);

        // Store permissions for user_admin
        if (userRes.data.permissions) {
          localStorage.setItem("admin_permissions", JSON.stringify(userRes.data.permissions));
        }

        router.push("/dashboard");
      } catch (userErr: any) {
        // Both logins failed
        const userMessage = userErr.response?.data?.message || "";

        // Check if it's an access denied error
        if (userMessage.includes("Access Denied") || userMessage.includes("not part of the admin group")) {
          setError(userMessage);
        } else {
          // Generic invalid credentials
          setError(adminErr.response?.data?.message || "Invalid credentials");
        }
      }
    } finally {
      if (!requires2fa) setLoading(false);
    }
  };

  const handle2faVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/admin/2fa/verify-login", {
        adminId: adminId?.toString(),
        code: twoFactorCode
      });

      localStorage.setItem("admin_token", res.data.access_token);
      localStorage.setItem("admin_user", JSON.stringify(res.data.admin));
      localStorage.setItem("admin_role", res.data.role || "admin");
      localStorage.removeItem("admin_permissions");

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid 2FA code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-slate-500">Futurus Administration</p>
        </div>

        <div className="p-8 rounded-3xl border border-white/10 shadow-2xl bg-white/5 backdrop-blur-xl">
          {!requires2fa ? (
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                    {error}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                    className="w-full text-xs text-slate-500 hover:text-indigo-400 font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    Limpar Sessão e Cache
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                  placeholder="admin"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 px-4 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handle2faVerify} className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Two-Factor Authentication</h3>
                <p className="text-slate-500 text-sm">Enter the code from your authenticator app</p>
              </div>

              {error && (
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                    {error}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                    className="w-full text-xs text-slate-500 hover:text-indigo-400 font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    Limpar Sessão e Cache
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-4 text-white text-center text-2xl font-black tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                  placeholder="000000"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || twoFactorCode.length !== 6}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  "Verify & Login"
                )}
              </button>

              <button
                type="button"
                onClick={() => setRequires2fa(false)}
                className="w-full text-slate-500 hover:text-white text-sm font-medium transition-colors"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-slate-600 text-xs">
          PY Foundation 2026 version={process.env.NEXT_PUBLIC_APP_VERSION} Futurus Administration. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
