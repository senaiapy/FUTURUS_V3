"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "@/i18n/routing";
import UserSidebar from "@/components/dashboard/UserSidebar";
import UserHeader from "@/components/dashboard/UserHeader";
import api from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Preserve the current path as callback URL for redirect after login
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [status, router, pathname]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session) return;
      try {
        const res = await api.get("/users/profile", {
          headers: {
            Authorization: `Bearer ${(session as any).accessToken}`,
          },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex bg-slate-950 min-h-screen text-slate-50 font-maven overflow-x-hidden">
      <UserSidebar
        balance={profile?.balance || 0}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col h-screen overflow-y-auto w-full">
        <UserHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-10 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
