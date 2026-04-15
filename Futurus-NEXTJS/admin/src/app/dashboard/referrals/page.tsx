"use client";

import { Users, Gift, TrendingUp, Save, Copy, Info } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";

const t = (s: string) => s;

export default function ReferralsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"settings" | "register">(
    "settings",
  );

  useEffect(() => {
    api
      .get("/referrals/admin/settings")
      .then((res) => {
        setSettings(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      const data = {
        type: "commission",
        commission: JSON.stringify({
          level1: settings?.commission?.level1 || 5,
          level2: settings?.commission?.level2 || 2,
          level3: settings?.commission?.level3 || 1,
        }),
        status: settings?.status || 0,
      };
      await api.patch("/referrals/admin/settings", data);
      alert(t("Settings saved successfully"));
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert(t("Failed to save settings"));
    }
  };

  const toggleRegisterBonus = () => {
    const newValue = !settings?.registerBonus;
    setSettings({ ...settings, registerBonus: newValue });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <main className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t("Referral Settings")}
          </h1>
          <p className="text-slate-400">
            {t("Configure referral program and bonuses")}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "settings"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {t("Commission Settings")}
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "register"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {t("Register Bonus")}
          </button>
        </div>

        {loading ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-slate-400 mt-4">{t("Loading...")}</p>
          </div>
        ) : (
          settings && (
            <div className="max-w-4xl mx-auto">
              {activeTab === "settings" ? (
                <div className="glass-card rounded-2xl p-8">
                  {/* Status Toggle */}
                  <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/10">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {t("Referral Program Status")}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {t("Enable or disable the referral program")}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setSettings({
                          ...settings,
                          status: settings.status === 1 ? 0 : 1,
                        })
                      }
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        settings.status === 1
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {settings.status === 1 ? t("Enabled") : t("Disabled")}
                    </button>
                  </div>

                  {/* Commission Levels */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white mb-6">
                      {t("Commission Structure")}
                    </h3>

                    {[
                      {
                        key: "level1",
                        label: "Level 1",
                        bonus: "Level 1 users",
                      },
                      {
                        key: "level2",
                        label: "Level 2",
                        bonus: "Level 2 users",
                      },
                      {
                        key: "level3",
                        label: "Level 3",
                        bonus: "Level 3 users",
                      },
                    ].map((level) => (
                      <div
                        key={level.key}
                        className="bg-slate-800 rounded-xl p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                              <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="text-lg font-bold text-white">
                              {level.label}
                            </span>
                          </div>
                          <span className="text-slate-400 text-sm">
                            {level.bonus}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-slate-700 px-4 py-2 rounded-lg">
                            <span className="text-white font-semibold">
                              {settings?.commission?.[level.key] || 5}%
                            </span>
                            <span className="text-slate-400 text-sm">
                              {t("Commission")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-6 border-t border-white/10">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      <span>{t("Save Settings")}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/10">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {t("Registration Bonus")}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {t(
                          "Give new users a bonus when they register with a referral code",
                        )}
                      </p>
                    </div>
                    <button
                      onClick={toggleRegisterBonus}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        settings?.registerBonus
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {settings?.registerBonus ? t("Enabled") : t("Disabled")}
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Bonus Amount */}
                    <div>
                      <label className="text-sm text-slate-400 block mb-3">
                        {t("Bonus Amount")}
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Gift className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-lg flex-1">
                          <span className="text-white font-semibold">
                            R$ 50
                          </span>
                          <Info className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    {/* Bonus Type */}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { key: "balance", label: "Add to Balance" },
                        { key: "shares", label: "Give Bonus Shares" },
                      ].map((type) => (
                        <div
                          key={type.key}
                          className="bg-slate-800 rounded-xl p-6 cursor-pointer border border-white/5 hover:border-white/10 transition-all"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                            <span className="text-white font-semibold">
                              {t(type.label)}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm">
                            {t(
                              type.key === "balance"
                                ? "Deposit to user balance"
                                : "Award as tradable shares",
                            )}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Referral Link Preview */}
                    <div className="bg-slate-800 rounded-xl p-6">
                      <h4 className="text-white font-semibold mb-3">
                        {t("Referral Link")}
                      </h4>
                      <div className="flex items-center gap-3 bg-slate-700 px-4 py-3 rounded-lg">
                        <code className="flex-1 text-blue-400">
                          https://futurus.com.br/ref/FUTURUS123
                        </code>
                        <button className="p-2 text-slate-400 hover:text-white transition-colors">
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </main>
    </div>
  );
}
