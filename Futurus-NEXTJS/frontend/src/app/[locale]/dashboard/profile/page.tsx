"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useSession } from "next-auth/react";
import {
  User,
  Phone,
  Save,
  Lock,
  Shield,
  MapPin,
  ChevronRight,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export default function ProfileSettingsPage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session) return;
      try {
        const res = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${(session as any).accessToken}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await api.patch("/users/profile", profile, {
        headers: { Authorization: `Bearer ${(session as any).accessToken}` },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#1a1c2d] tracking-tight">
            {t("Configurações de Perfil")}
          </h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            {t(
              "Gerencie suas informações pessoais e mantenha sua conta atualizada.",
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-10"
          >
            {success && (
              <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-[24px] flex items-center gap-4 animate-in fade-in duration-500">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-emerald-700">
                    {t("Perfil atualizado com sucesso!")}
                  </p>
                  <p className="text-[12px] text-emerald-600/70 font-medium">
                    {t("Suas alterações foram salvas em nossa base de dados.")}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    {t("Nome")}
                  </label>
                  <input
                    value={profile?.firstname || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, firstname: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 px-7 text-[#1a1c2d] font-bold focus:outline-none focus:border-[#3b5bdb] focus:bg-white transition-all placeholder:text-slate-300 shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    {t("Sobrenome")}
                  </label>
                  <input
                    value={profile?.lastname || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, lastname: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 px-7 text-[#1a1c2d] font-bold focus:outline-none focus:border-[#3b5bdb] focus:bg-white transition-all placeholder:text-slate-300 shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  {t("Telefone")}
                </label>
                <div className="relative">
                  <Phone className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    value={profile?.mobile || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, mobile: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 pl-16 pr-7 text-[#1a1c2d] font-bold focus:outline-none focus:border-[#3b5bdb] focus:bg-white transition-all placeholder:text-slate-300 shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    {t("Cidade")}
                  </label>
                  <input
                    value={profile?.city || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, city: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 px-7 text-[#1a1c2d] font-bold focus:outline-none focus:border-[#3b5bdb] focus:bg-white transition-all placeholder:text-slate-300 shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    {t("Estado")}
                  </label>
                  <input
                    value={profile?.state || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, state: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 px-7 text-[#1a1c2d] font-bold focus:outline-none focus:border-[#3b5bdb] focus:bg-white transition-all placeholder:text-slate-300 shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  {t("Endereço")}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-7 top-[22px] w-5 h-5 text-slate-400" />
                  <textarea
                    value={profile?.address || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-100 rounded-[32px] py-5 pl-16 pr-7 text-[#1a1c2d] font-bold focus:outline-none focus:border-[#3b5bdb] focus:bg-white transition-all placeholder:text-slate-300 shadow-inner resize-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#3b5bdb] hover:bg-[#2f49b5] disabled:bg-slate-200 text-white py-6 rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-[#3b5bdb]/20 transition-all flex items-center justify-center gap-4 group"
            >
              {saving ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {t("Salvar Alterações")}
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-[15px] font-black text-[#1a1c2d] uppercase tracking-wider">
              {t("Ações Rápidas")}
            </h3>
            <div className="space-y-4">
              <Link
                href="/dashboard/change-password"
                className="flex items-center gap-5 p-5 rounded-[24px] border border-slate-100 hover:border-[#3b5bdb]/30 hover:bg-slate-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-[#1a1c2d] group-hover:text-[#3b5bdb] transition-colors">
                    {t("Alterar Senha")}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {t("Mantenha sua conta segura")}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#1a1c2d] transition-colors" />
              </Link>

              <Link
                href="/dashboard/transactions"
                className="flex items-center gap-5 p-5 rounded-[24px] border border-slate-100 hover:border-[#3b5bdb]/30 hover:bg-slate-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-[#1a1c2d] group-hover:text-[#3b5bdb] transition-colors">
                    {t("Histórico")}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {t("Ver todas as transações")}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#1a1c2d] transition-colors" />
              </Link>
            </div>
          </div>

          {/* Protection Info */}
          <div className="bg-[#1a1c2d] p-10 rounded-[40px] text-white shadow-xl space-y-6 relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-[16px] font-black uppercase tracking-wider mb-3">
                {t("Dados Protegidos")}
              </h4>
              <p className="text-[13px] font-medium text-slate-400 leading-relaxed mb-6">
                {t(
                  "Suas informações são criptografadas e armazenadas de forma segura de acordo com nossa Política de Privacidade.",
                )}
              </p>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  SSL Encrypted
                </span>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
