"use client";

import { useTranslations } from "next-intl";
import {
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Globe,
} from "lucide-react";
import { useState } from "react";

export default function HowItWorksPage() {
  const t = useTranslations();
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "step1.title",
      icon: <Globe />,
      description: "step1.description",
    },
    {
      id: 2,
      title: "step2.title",
      icon: <TrendingUp />,
      description: "step2.description",
    },
    {
      id: 3,
      title: "step3.title",
      icon: <CheckCircle2 />,
      description: "step3.description",
    },
    {
      id: 4,
      title: "step4.title",
      icon: <Shield />,
      description: "step4.description",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <main className="flex-1 font-maven">
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {/* Header */}
              <div className="text-center mb-20">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  {t("How It Works")}
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  {t("Learn how to get started with prediction markets in just a few simple steps")}
                </p>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`glass-card rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:-translate-y-2 ${
                      activeStep === step.id ? "border-base ring-2 ring-base/30" : "border-white/5"
                    }`}
                  >
                    <div className={`flex items-center gap-6 mb-6 ${
                      activeStep === step.id ? "text-base" : "text-slate-600"
                    } transition-colors duration-300`}>
                      <div
                        className={`p-3 rounded-xl ${
                          activeStep === step.id
                            ? "bg-base text-white"
                            : "bg-blue-500/10"
                        } transition-colors duration-300`}
                      >
                        {step.icon}
                      </div>
                      <h3 className="text-2xl font-bold">{t(step.title)}</h3>
                    </div>
                    <p className="text-slate-400 text-base leading-relaxed">
                      {t(step.description)}
                    </p>
                    <div className="flex items-center gap-2 mt-6 text-base font-semibold">
                      <span>{t("Learn more")}</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Benefits */}
              <div className="glass-card rounded-2xl p-12 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-8">
                  {t("Why Choose Futurus?")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: <Zap />,
                      title: "Instant Execution",
                      description: "Trades execute immediately at current market prices",
                    },
                    {
                      icon: <Shield />,
                      title: "Secure",
                      description: "Your funds and data are always protected",
                    },
                    {
                      icon: <Globe />,
                      title: "24/7 Access",
                      description: "Trade anytime, anywhere from any device",
                    },
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center">
                      <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 mb-4">
                        {benefit.icon}
                      </div>
                      <h4 className="text-white font-semibold mb-2">
                        {t(benefit.title)}
                      </h4>
                      <p className="text-slate-400 text-sm">
                        {t(benefit.description)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="text-center mt-16">
                <p className="text-slate-400 mb-6">
                  {t("Ready to start trading?")}
                </p>
                <button className="px-8 py-4 bg-base text-white font-bold rounded-2xl hover:bg-blue-500 transition-colors duration-300">
                  {t("Get Started Now")}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
