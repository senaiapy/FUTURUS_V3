"use client";

import { useTranslations } from "next-intl";
import { Star, Quote, ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";

export default function TestimonialsPage() {
  const t = useTranslations();
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Ricardo Silva",
      location: "São Paulo, Brazil",
      avatar: "RS",
      rating: 5,
      text: "testimonials.user1.text",
      result: "user1.result",
    },
    {
      id: 2,
      name: "Maria Santos",
      location: "Rio de Janeiro, Brazil",
      avatar: "MS",
      rating: 5,
      text: "testimonials.user2.text",
      result: "user2.result",
    },
    {
      id: 3,
      name: "João Oliveira",
      location: "Belo Horizonte, Brazil",
      avatar: "JO",
      rating: 4,
      text: "testimonials.user3.text",
      result: "user3.result",
    },
    {
      id: 4,
      name: "Ana Costa",
      location: "Brasília, Brazil",
      avatar: "AC",
      rating: 5,
      text: "testimonials.user4.text",
      result: "user4.result",
    },
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <main className="flex-1 font-maven">
        <section className="py-24">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-16">
              <Quote className="w-16 h-16 text-base mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t("What Our Users Say")}
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                {t("Read testimonials from our community of traders")}
              </p>
            </div>

            {/* Featured Testimonial */}
            <div className="max-w-4xl mx-auto mb-16">
              <div className="glass-card rounded-2xl p-12 border border-white/10 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

                <div className="relative z-10">
                  {/* Quote icon */}
                  <div className="flex justify-center mb-8">
                    <div className="p-4 rounded-full bg-blue-500/10">
                      <Quote className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>

                  {/* Testimonial content */}
                  <blockquote className="text-2xl text-white text-center font-medium leading-relaxed mb-10">
                    <span className="text-base/80">"</span>
                    {t(currentTestimonial.text)}
                    <span className="text-base/80">"</span>
                  </blockquote>

                  {/* Author info */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mb-4">
                      {currentTestimonial.avatar}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {currentTestimonial.name}
                    </h3>
                    <p className="text-slate-400 mb-3">
                      {currentTestimonial.location}
                    </p>
                    <div className="flex items-center gap-2 mb-6">
                      {[...Array(currentTestimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <span className="font-semibold">
                        {t(currentTestimonial.result)}
                      </span>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-center gap-4 mt-10">
                    <button
                      onClick={prevTestimonial}
                      className="p-3 rounded-full bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex gap-1">
                      {testimonials.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            currentIndex === idx ? "bg-base" : "bg-white/20"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={nextTestimonial}
                      className="p-3 rounded-full bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* More Testimonials Grid */}
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-white text-center mb-10">
                {t("More Success Stories")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {testimonials.map((testimonial, idx) => (
                  <div
                    key={testimonial.id}
                    className={`glass-card rounded-xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                      currentIndex === idx ? "border-base ring-2 ring-base/30" : "border-white/5"
                    }`}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold mb-3 mx-auto">
                        {testimonial.avatar}
                      </div>
                      <h4 className="text-white font-semibold mb-1 truncate">
                        {testimonial.name}
                      </h4>
                      <div className="flex items-center justify-center gap-1 mb-3">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
