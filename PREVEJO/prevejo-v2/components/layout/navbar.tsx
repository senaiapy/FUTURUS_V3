"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Mercados", href: "#mercados" },
  { label: "Tecnologia", href: "#tecnologia" },
  { label: "IA", href: "#ia" },
  { label: "Sobre", href: "#sobre" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? "rgba(10, 14, 20, 0.92)"
            : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(77, 70, 53, 0.25)"
            : "none",
        }}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
            {/* Brand/Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src="/assets/logo.png"
                  alt="PREVEJO Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontSize: "1.125rem",
                  fontWeight: 800,
                  letterSpacing: "0.12rem",
                  color: "var(--on-background)",
                }}
              >
                PREVEJO
              </span>
            </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="btn-ghost text-sm"
                style={{
                  fontFamily: "var(--font-space-grotesk), monospace",
                  fontSize: "0.8125rem",
                  letterSpacing: "0.1em",
                  color: "var(--on-surface-variant)",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--on-surface-variant)")
                }
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:block">
            <a href="#pre-registro">
              <button className="btn-primary">
                <span>Pré-Registro</span>
              </button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ color: "var(--on-background)", background: "none", border: "none", cursor: "pointer" }}
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 right-0 z-40 glass-card"
            style={{
              background: "rgba(10, 14, 20, 0.97)",
              borderTop: "1px solid rgba(77, 70, 53, 0.3)",
            }}
          >
            <nav className="max-w-[1280px] mx-auto px-6 py-6 flex flex-col gap-5">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontFamily: "var(--font-space-grotesk), monospace",
                    fontSize: "1rem",
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    color: "var(--on-surface-variant)",
                    textDecoration: "none",
                  }}
                >
                  {link.label}
                </a>
              ))}
              <a href="#pre-registro" onClick={() => setMobileOpen(false)}>
                <button className="btn-primary w-full mt-2">
                  <span>Pré-Registro</span>
                </button>
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
