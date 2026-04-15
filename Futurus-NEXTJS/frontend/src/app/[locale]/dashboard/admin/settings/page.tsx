"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Palette,
  Settings,
  Save,
  CheckCircle2,
  ShieldCheck,
  Languages,
  Globe,
  Mail,
  Zap,
  Info,
} from "lucide-react";

interface GeneralSettings {
  siteName: string;
  curText: string;
  curSym: string;
  baseColor: string;
  secondaryColor: string;
  registration: number;
  ev: number;
  sv: number;
}

export default function AdminSettingsPage() {
  const t = useTranslations();
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/admin/settings/general");
        setSettings(res.data);
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSuccess(false);
    try {
      await api.patch("/admin/settings/general", settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update settings", err);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (
    field: keyof GeneralSettings,
    value: string | number,
  ) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="w-10 h-10 border-4 border-base/20 border-t-base rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 font-maven">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-base" />
            {t("General Settings")}
          </h1>
          <p className="text-slate-400 mt-2">
            Manage your platform identity and core behavior.
          </p>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-4 h-4" />
            {t("Settings updated successfully")}
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Brand Identity */}
        <section className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-base/20 border border-base/30">
              <Globe className="w-5 h-5 text-base" />
            </div>
            <h2 className="text-xl font-bold text-white">{t("Identity")}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none pl-1">
                {t("Site Name")}
              </label>
              <input
                type="text"
                value={settings?.siteName}
                onChange={(e) => updateField("siteName", e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3 px-5 text-sm text-white focus:outline-none focus:border-base transition-all"
                placeholder="e.g. Futurus Prediction"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none pl-1">
                  {t("Currency Code")}
                </label>
                <input
                  type="text"
                  value={settings?.curText}
                  onChange={(e) => updateField("curText", e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3 px-5 text-sm text-white focus:outline-none focus:border-base transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none pl-1">
                  {t("Currency Symbol")}
                </label>
                <input
                  type="text"
                  value={settings?.curSym}
                  onChange={(e) => updateField("curSym", e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3 px-5 text-sm text-white focus:outline-none focus:border-base transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Visual Strategy */}
        <section className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
              <Palette className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {t("Platform Theming")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none pl-1">
                  {t("Primary Base Color")}
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={settings?.baseColor}
                      onChange={(e) => updateField("baseColor", e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3 px-5 text-sm text-white font-mono focus:outline-none focus:border-base transition-all"
                      placeholder="e.g. 221 75% 60%"
                    />
                  </div>
                  <div
                    className="w-12 h-12 rounded-2xl border border-white/10 shadow-lg flex-shrink-0"
                    style={{ backgroundColor: `hsl(${settings?.baseColor})` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 pl-1 leading-relaxed">
                  Format: HSL values separated by space (e.g. 221 75% 60%)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none pl-1">
                  {t("Secondary Accent Color")}
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={settings?.secondaryColor}
                      onChange={(e) =>
                        updateField("secondaryColor", e.target.value)
                      }
                      className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3 px-5 text-sm text-white font-mono focus:outline-none focus:border-base transition-all"
                      placeholder="e.g. 224 40% 27%"
                    />
                  </div>
                  <div
                    className="w-12 h-12 rounded-2xl border border-white/10 shadow-lg flex-shrink-0"
                    style={{
                      backgroundColor: `hsl(${settings?.secondaryColor})`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* System Policies */}
        <section className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {t("Security & Users")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ToggleCard
              title={t("User Registration")}
              desc={t("Allow new accounts")}
              active={settings?.registration === 1}
              onClick={() =>
                updateField(
                  "registration",
                  settings?.registration === 1 ? 0 : 1,
                )
              }
            />
            <ToggleCard
              title={t("Email Verification")}
              desc={t("Require valid email")}
              active={settings?.ev === 1}
              onClick={() => updateField("ev", settings?.ev === 1 ? 0 : 1)}
            />
            <ToggleCard
              title={t("Mobile Verification")}
              desc={t("Require phone verification")}
              active={settings?.sv === 1}
              onClick={() => updateField("sv", settings?.sv === 1 ? 0 : 1)}
            />
          </div>
        </section>

        <div className="flex items-center gap-6 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-base hover:opacity-90 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-xl shadow-base/20 flex items-center gap-3"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? t("SAVE CHANGES...") : t("UPDATE SETTINGS")}
          </button>

          <div className="flex items-center gap-2 text-slate-500">
            <Info className="w-4 h-4" />
            <p className="text-xs font-medium">
              Changes apply immediately to all client interfaces.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

function ToggleCard({
  title,
  desc,
  active,
  onClick,
}: {
  title: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-6 rounded-3xl border text-left transition-all group ${
        active
          ? "bg-base/10 border-base/30 text-white"
          : "bg-slate-900/50 border-white/5 text-slate-500 hover:border-white/10"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-black uppercase tracking-widest">{title}</p>
        <div
          className={`w-10 h-6 rounded-full relative transition-colors ${active ? "bg-base" : "bg-slate-800"}`}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? "left-5" : "left-1"}`}
          />
        </div>
      </div>
      <p className={`text-[10px] ${active ? "text-base" : "text-slate-600"}`}>
        {desc}
      </p>
    </button>
  );
}
