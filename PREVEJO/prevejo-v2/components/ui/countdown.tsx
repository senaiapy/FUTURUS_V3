"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TimeLeft {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

// Target: April 1, 2026 at midnight (Brazil time, UTC-3)
const TARGET_DATE = new Date("2026-04-01T00:00:00-03:00").getTime();

function calculateTimeLeft(): TimeLeft {
  const now = new Date().getTime();
  const diff = TARGET_DATE - now;

  if (diff <= 0) {
    return { days: "000", hours: "00", minutes: "00", seconds: "00" };
  }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    days:    days.toString().padStart(3, "0"),
    hours:   hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
  };
}

function TimerUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="timer-chip">
      {/* Chip box */}
      <div
        className="timer-value"
        style={{
          width: "clamp(4rem, 10vw, 7rem)",
          height: "clamp(4.5rem, 11vw, 8rem)",
          fontSize: "clamp(1.5rem, 4vw, 3rem)",
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
            style={{
              fontFamily: "var(--font-space-grotesk), monospace",
              fontWeight: 700,
              color: "var(--primary)",
              display: "block",
              letterSpacing: "-0.01em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
        {/* Shine line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "40%",
            background: "linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)",
            pointerEvents: "none",
          }}
        />
      </div>
      {/* Label */}
      <span className="label-mono" style={{ marginTop: "0.25rem" }}>
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "clamp(4.5rem, 11vw, 8rem)",
        padding: "0 0.25rem",
        fontFamily: "var(--font-space-grotesk), monospace",
        fontSize: "clamp(1.5rem, 4vw, 3rem)",
        fontWeight: 700,
        color: "rgba(242, 202, 80, 0.4)",
        userSelect: "none",
      }}
    >
      :
    </div>
  );
}

export default function Countdown() {
  const initial = useMemo(() => calculateTimeLeft(), []);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(initial);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="countdown"
      className="relative py-16 lg:py-20 overflow-hidden flex flex-col items-center"
      style={{ background: "var(--surface-container-lowest)" }}
    >
      {/* Gold glow center */}
      <div
        className="glow-gold"
        style={{
          width: 600,
          height: 300,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Timer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 px-6"
      >
        <TimerUnit value={timeLeft.days}    label="Dias" />
        <Separator />
        <TimerUnit value={timeLeft.hours}   label="Horas" />
        <Separator />
        <TimerUnit value={timeLeft.minutes} label="Minutos" />
        <Separator />
        <TimerUnit value={timeLeft.seconds} label="Segundos" />
      </motion.div>

      {/* Launch date */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="label-mono"
        style={{ marginTop: "2rem", color: "var(--on-surface-variant)" }}
      >
        LANÇAMENTO: 01 DE ABRIL DE 2026
      </motion.p>
    </section>
  );
}
