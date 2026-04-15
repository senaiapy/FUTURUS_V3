"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";

const containerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants: Variants = {
  initial: { y: 40, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

// Animated ticker data items
const tickerItems = [
  { ticker: "WIN$", value: "+2.34%", color: "#f2ca50" },
  { ticker: "WDO$", value: "-0.87%", color: "var(--tertiary)" },
  { ticker: "IBOV", value: "+1.12%", color: "#f2ca50" },
  { ticker: "PTAX", value: "5.1042", color: "var(--on-surface-variant)" },
  { ticker: "B3:PETR4", value: "+3.21%", color: "#f2ca50" },
  { ticker: "WIN$", value: "+2.34%", color: "#f2ca50" },
  { ticker: "WDO$", value: "-0.87%", color: "var(--tertiary)" },
  { ticker: "IBOV", value: "+1.12%", color: "#f2ca50" },
];

function MarketTicker() {
  return (
    <div
      className="relative overflow-hidden w-full"
      style={{
        borderTop: "1px solid rgba(77, 70, 53, 0.25)",
        borderBottom: "1px solid rgba(77, 70, 53, 0.25)",
        background: "var(--surface-container-lowest)",
        padding: "0.5rem 0",
      }}
    >
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="flex gap-12 whitespace-nowrap"
        style={{ width: "max-content" }}
      >
        {[...tickerItems, ...tickerItems].map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-2"
            style={{
              fontFamily: "var(--font-space-grotesk), monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
            }}
          >
            <span style={{ color: "var(--on-surface-variant)" }}>
              {item.ticker}
            </span>
            <span style={{ color: item.color, fontWeight: 600 }}>
              {item.value}
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex flex-col overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Background image — integrated from user request */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/assets/prevejo_background.png"
          alt="PREVEJO Background"
          fill
          priority
          className="object-cover object-center opacity-[0.35]"
        />
        {/* Navy gradient mask for text readability and smooth blending */}
        <div 
          className="absolute inset-0" 
          style={{ 
            background: "linear-gradient(to bottom, var(--background) 0%, transparent 15%, transparent 85%, var(--background) 100%), radial-gradient(circle at center, transparent 30%, var(--background) 100%)" 
          }} 
        />
        {/* Grid pattern overlay (keep subtle) */}
        <div className="absolute inset-0 grid-pattern opacity-40" />
      </div>

      {/* Gold ambient glow — top right */}
      <div
        className="glow-gold"
        style={{ width: 700, height: 700, top: -200, right: -200 }}
      />

      {/* Cyan ambient glow — bottom left (complementing the background cyan) */}
      <div
        className="glow-cyan"
        style={{ width: 500, height: 500, bottom: -100, left: -100 }}
      />

      {/* Market Ticker */}
      <div className="relative z-10 mt-16">
        <MarketTicker />
      </div>

      {/* Hero Content */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 lg:px-12 py-16 lg:py-24 max-w-[1280px] mx-auto w-full"
      >
        {/* Status badge & Announcement */}
        <motion.div variants={itemVariants} className="mb-10 flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{ 
              fontFamily: "var(--font-headline)",
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              fontWeight: 800,
              color: "var(--primary)",
              textAlign: "center",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              textShadow: "0 0 20px rgba(242, 202, 80, 0.3)"
            }}
          >
            Parece Mentira... <br className="sm:hidden" />
            <span className="text-white">Mas não É !!!</span> <br />
            Lançamento em <span className="text-cyan-400">1 de Abril</span>
          </motion.div>

          <div 
            className="stat-chip inline-flex items-center gap-2"
            style={{ 
              fontSize: "0.75rem", 
              padding: "0.375rem 0.875rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              borderWidth: "1px",
            }}
          >
            <span 
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" 
            />
            SISTEMA EM PRÉ-LANÇAMENTO · ACESSO RESTRITO
          </div>
        </motion.div>

        {/* Main headline — from Stitch HTML */}
        <motion.div variants={itemVariants} className="text-center mb-6">
          <h1
            className="display-lg"
            style={{ marginBottom: "0.25rem" }}
          >
            O FUTURO DO MERCADO CHEGOU.
          </h1>
          <h1
            className="display-lg text-gold-gradient"
          >
            E ELE É PREVISÍVEL.
          </h1>
        </motion.div>

        {/* Subtitle — from Stitch HTML content */}
        <motion.div variants={itemVariants} className="text-center max-w-3xl mb-8">
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              lineHeight: 1.7,
              color: "var(--on-surface-variant)",
              fontWeight: 400,
            }}
          >
            A primeira inteligência artificial soberana focada exclusivamente na
            liquidez e volatilidade do mercado de futuros brasileiro. Decisões
            algorítmicas com{" "}
            <span style={{ color: "var(--primary)", fontWeight: 600 }}>
              precisão milimétrica.
            </span>
          </p>
        </motion.div>

        {/* CTA Row */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          <a href="#pre-registro">
            <button className="btn-primary">
              <span>Garantir Pré-Registro</span>
            </button>
          </a>
          <a href="#tecnologia" className="btn-ghost" style={{ textDecoration: "none" }}>
            <span>Ver Tecnologia</span>
            <span style={{ color: "var(--primary)" }}>→</span>
          </a>
        </motion.div>

        {/* Assertivity Stat — from Stitch "+98.4%" */}
        <motion.div
          variants={itemVariants}
          className="relative"
        >
          <div
            className="glass-card"
            style={{
              padding: "1.5rem 3rem",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Ambient inner glow */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse at center, rgba(242, 202, 80, 0.06) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div className="relative">
              <div
                style={{
                  fontFamily: "var(--font-space-grotesk), monospace",
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  fontWeight: 700,
                  color: "var(--primary)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                  marginBottom: "0.375rem",
                }}
              >
                +98.4%
              </div>
              <div className="label-mono">
                TAXA DE ASSERTIVIDADE (BACKTEST)
              </div>
            </div>
          </div>
        </motion.div>

        {/* Countdown label */}
        <motion.div
          variants={itemVariants}
          className="mt-12 text-center"
        >
          <p className="label-mono" style={{ marginBottom: "0.5rem" }}>
            O LANÇAMENTO HISTÓRICO EM:
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
