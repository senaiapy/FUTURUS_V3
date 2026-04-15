"use client";

import { useTranslations } from "next-intl";
import {
  Cookie as CookieIcon,
  Check,
  X,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

export default function CookiePage() {
  const t = useTranslations();
  const [showDetails, setShowDetails] = useState(false);

  const cookies = [
    {
      id: "essential",
      name: "cookies.essential.name",
      description: "cookies.essential.description",
      required: true,
      duration: "Session",
    },
    {
      id: "functional",
      name: "cookies.functional.name",
      description: "cookies.functional.description",
      required: false,
      duration: "1 Year",
    },
    {
      id: "analytics",
      name: "cookies.analytics.name",
      description: "cookies.analytics.description",
      required: false,
      duration: "2 Years",
    },
    {
      id: "marketing",
      name: "cookies.marketing.name",
      description: "cookies.marketing.description",
      required: false,
      duration: "1 Year",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <main className="flex-1 font-maven">
        <section className="py-24">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-16">
              <CookieIcon className="w-20 h-20 text-base mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t("Cookie Policy")}
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                {t("Learn about how we use cookies and your options")}
              </p>
            </div>

            {/* Cookie Info */}
            <div className="max-w-4xl mx-auto glass-card rounded-2xl p-10 mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">
                {t("What Are Cookies?")}
              </h2>
              <p className="text-slate-300 leading-relaxed mb-8">
                {t("cookies.info.description")}
              </p>

              <div className="flex items-start gap-4 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <Shield className="w-6 h-6 text-blue-400 mt-1 shrink-0" />
                <div className="text-slate-300">
                  <p className="font-semibold text-white mb-2">
                    {t("cookies.security.title")}
                  </p>
                  <p className="text-sm">{t("cookies.security.description")}</p>
                </div>
              </div>
            </div>

            {/* Cookie Types */}
            <h2 className="text-2xl font-bold text-white text-center mb-10">
              {t("Types of Cookies We Use")}
            </h2>
            <div className="max-w-4xl mx-auto space-y-4 mb-12">
              {cookies.map((cookie) => (
                <div
                  key={cookie.id}
                  className="glass-card rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-semibold text-white">
                          {t(cookie.name)}
                        </h3>
                        {cookie.required && (
                          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-red-500/20 text-red-400">
                            {t("Required")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>
                          {t("Duration")}: {cookie.duration}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed mt-3">
                        {t(cookie.description)}
                      </p>
                    </div>
                    <div className="ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={cookie.required}
                          disabled={cookie.required}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-8 bg-white/10 rounded-full peer peer-checked:bg-base peer-focus:ring-2 peer-focus:ring-base/30 transition-all duration-300">
                          <div className="absolute left-1 top-1 w-6 h-6 bg-slate-600 rounded-full transition-all duration-300 peer-checked:translate-x-6 peer-checked:bg-white"></div>
                        </div>
                        {cookie.required ? (
                          <Check className="w-4 h-4 text-slate-600 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2" />
                        ) : (
                          <X className="w-4 h-4 text-white absolute right-1 top-1/2 -translate-y-1/2" />
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* More Details Toggle */}
            <div className="max-w-4xl mx-auto mb-12">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-center gap-3 p-4 glass-card rounded-xl text-slate-300 hover:text-white transition-all"
              >
                {showDetails ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
                <span className="font-semibold">
                  {showDetails ? t("Hide Details") : t("Show Details")}
                </span>
              </button>
            </div>

            {/* Detailed Cookie Information */}
            {showDetails && (
              <div className="max-w-4xl mx-auto glass-card rounded-2xl p-10 border border-white/10 animate-in">
                <h3 className="text-xl font-bold text-white mb-6">
                  {t("Detailed Cookie Information")}
                </h3>
                <div className="space-y-6 text-slate-300">
                  <div>
                    <h4 className="font-semibold text-white mb-2">
                      {t("Local Storage")}
                    </h4>
                    <p className="text-sm leading-relaxed">
                      {t("cookies.details.local_storage")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">
                      {t("Session Cookies")}
                    </h4>
                    <p className="text-sm leading-relaxed">
                      {t("cookies.details.session_cookies")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">
                      {t("Analytics Cookies")}
                    </h4>
                    <p className="text-sm leading-relaxed">
                      {t("cookies.details.analytics_cookies")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">
                      {t("Third-Party Cookies")}
                    </h4>
                    <p className="text-sm leading-relaxed">
                      {t("cookies.details.third_party")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Your Rights */}
            <div className="max-w-4xl mx-auto glass-card rounded-2xl p-10 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">
                {t("Your Cookie Rights")}
              </h2>
              <ul className="space-y-4 text-slate-300">
                {[
                  t("cookies.rights.accept"),
                  t("cookies.rights.reject"),
                  t("cookies.rights.withdraw"),
                  t("cookies.rights.settings"),
                  t("cookies.rights.info"),
                ].map((right, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{right}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="max-w-4xl mx-auto text-center mt-12">
              <p className="text-slate-400 mb-6">
                {t("Questions about our cookie policy?")}
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-base text-white font-bold rounded-2xl hover:bg-blue-500 transition-colors"
              >
                {t("Contact Us")}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
