"use client";

import { useRouter } from "next/navigation";
import { Lock, LogOut, ArrowLeft } from "lucide-react";

interface AccessDeniedProps {
  message?: string;
  showLogout?: boolean;
  showBack?: boolean;
}

export default function AccessDenied({
  message = "You are not part of the admin group",
  showLogout = true,
  showBack = false,
}: AccessDeniedProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_role");
    localStorage.removeItem("admin_permissions");
    router.push("/");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/5 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-md text-center">
        {/* Lock Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 mb-8">
          <Lock className="w-12 h-12 text-red-500" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>

        {/* Message */}
        <p className="text-slate-400 text-lg mb-8">{message}</p>

        {/* Info Box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <p className="text-sm text-slate-500">
            You do not have permission to access this area. If you believe this is an error,
            please contact the system administrator.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {showBack && (
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          )}

          {showLogout && (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
