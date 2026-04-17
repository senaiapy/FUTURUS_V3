"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { landingSlides } from "@/lib/landing-data";
import { useTranslations } from "next-intl";

export default function Banner() {
  const t = useTranslations();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % landingSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[600px] md:h-[800px] overflow-hidden bg-slate-950">
      {landingSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Layer */}
          <div className="absolute inset-0 transition-transform duration-[10000ms] ease-linear scale-110 group-active:scale-100">
            <Image
              src={slide.bgImage}
              alt="Background"
              fill
              className="object-cover opacity-40"
              priority
            />
          </div>

          <div className="container mx-auto px-4 h-full relative z-20">
            <div className="flex flex-col lg:flex-row items-center justify-between h-full pt-20 lg:pt-0 gap-12">
              {/* Content Box */}
              <div className="flex-1 text-center lg:text-left animate-fade-in-up">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                  {t(slide.titleKey)}
                </h1>
                <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed drop-shadow-md">
                  {t(slide.descriptionKey)}
                </p>
                <div className="flex justify-center lg:justify-start">
                  <Link
                    href={slide.buttonLink}
                    className="group relative px-8 py-4 bg-base text-white rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(var(--base),0.3)] hover:shadow-[0_0_30px_rgba(var(--base),0.5)]"
                  >
                    <span className="relative z-10">{t(slide.buttonTextKey)}</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Link>
                </div>
              </div>

              {/* Image Box with Animations */}
              <div className="flex-1 relative w-full h-[400px] lg:h-[600px] hidden md:block">
                {/* Main Floating Image */}
                <div className="absolute inset-0 flex items-center justify-center animate-float pointer-events-none">
                  <Image
                    src={slide.imageOne}
                    alt="Main"
                    width={600}
                    height={700}
                    className="object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] transition-all duration-700"
                  />
                </div>

                {/* Floating Card 1 */}
                <div className="absolute top-1/4 right-0 lg:right-[-5%] w-48 lg:w-64 animate-float-delayed glass-card p-2 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl pointer-events-none">
                  <Image
                    src={slide.imageTwo}
                    alt="Feature 1"
                    width={250}
                    height={150}
                    className="rounded-xl object-cover"
                  />
                </div>

                {/* Floating Card 2 */}
                <div className="absolute bottom-1/4 left-0 lg:left-[-5%] w-40 lg:w-56 animate-float glass-card p-2 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl pointer-events-none">
                  <Image
                    src={slide.imageThree}
                    alt="Feature 2"
                    width={200}
                    height={120}
                    className="rounded-xl object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {landingSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-1 transition-all duration-300 rounded-full ${
              i === currentSlide
                ? "w-8 bg-base"
                : "w-4 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
