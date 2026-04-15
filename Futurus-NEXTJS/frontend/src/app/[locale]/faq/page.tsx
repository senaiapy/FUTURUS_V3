"use client";

import { useTranslations } from "next-intl";
import { HelpCircle, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function FAQPage() {
  const t = useTranslations();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    api.get("/settings/faq").then((res) => {
      setFaqs(res.data || []);
    });
  }, []);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Header would go here */}
      <main className="flex-1 font-maven">
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  {t("Frequently Asked Questions")}
                </h1>
                <p className="text-slate-400 text-lg">
                  {t("Find answers to common questions about our platform")}
                </p>
              </div>

              {faqs.length > 0 ? (
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div
                      key={faq.id}
                      className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
                        openIndex === index ? "border-base" : "border-white/5"
                      }`}
                    >
                      <button
                        onClick={() => toggleAccordion(index)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                      >
                        <div className="flex-1">
                          <span className="text-lg font-semibold text-white">
                            {faq.question}
                          </span>
                          {faq.category && (
                            <span className="inline-block mt-2 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-blue-500/20 text-blue-400">
                              {faq.category}
                            </span>
                          )}
                        </div>
                        <ChevronRight
                          className={`text-slate-400 transition-transform duration-300 ${
                            openIndex === index ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          openIndex === index ? "max-h-96" : "max-h-0"
                        }`}
                      >
                        <div className="p-6 pt-0 text-slate-300 leading-relaxed">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-white/10">
                  <HelpCircle className="w-16 h-16 text-slate-600 mx-auto mb-6" />
                  <p className="text-slate-400 text-lg">
                    {t("FAQs are being loaded...")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
