"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Search,
  MoreVertical,
  User,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  ArrowUpRight,
  Eye,
  Settings,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Decimal } from "decimal.js";

export default function AdminUsersPage() {
  const t = useTranslations();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users", {
        params: { search: searchTerm || undefined },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  return (
    <div className="space-y-8 font-maven">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">
            {t("User Management")}
          </h1>
          <p className="text-slate-400 mt-2">
            Monitor user activity, manage balances and account status.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:row gap-4 items-center justify-between bg-white/5 border border-white/5 p-4 rounded-3xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={t("Search by name, email or username...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-base transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase text-slate-400">
            {users.length} {t("Users Found")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 rounded-3xl bg-white/5 animate-pulse border border-white/5"
            />
          ))
        ) : users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id}
              className="glass-card p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-base/30 transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-base/10 border border-base/20 flex items-center justify-center text-base font-black text-xl">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-base transition-colors">
                      {user.firstname} {user.lastname}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                      @{user.username}
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-white transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-6 relative z-10">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-slate-600" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Wallet className="w-3.5 h-3.5 text-slate-600" />
                  <span className="font-bold text-white">
                    ${new Decimal(user.balance || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${user.status === 1 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}
                >
                  {user.status === 1 ? (
                    <ShieldCheck className="w-3 h-3" />
                  ) : (
                    <ShieldAlert className="w-3 h-3" />
                  )}
                  {user.status === 1 ? t("Active") : t("Banned")}
                </div>

                <Link
                  href={`/dashboard/admin/users/${user.id}`}
                  className="text-[10px] font-black uppercase tracking-widest text-base hover:opacity-80 flex items-center gap-1"
                >
                  {t("View Profile")}
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Design element */}
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-base/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center glass-card rounded-3xl border border-dashed border-white/10">
            <p className="text-slate-500">{t("No users found.")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
