"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function LeadCapture() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;

    setStatus("loading");
    await new Promise((r) => setTimeout(r, 900));

    const msg = encodeURIComponent(
      `Olá! Tenho interesse no pré-registro do PREVEJO. E-mail: ${email || "(não informado)"}`
    );
    window.open(`https://wa.me/5511995009969?text=${msg}`, "_blank");
    setStatus("success");
  };

  return (
    <section
      id="pre-registro"
      className="relative overflow-hidden"
      style={{ background: "var(--surface-container-lowest)" }}
    >
      {/* Gold glow — top right */}
      <div
        className="glow-gold"
        style={{ width: 700, height: 700, top: -250, right: -250 }}
      />
      {/* Cyan glow — bottom left */}
      <div
        className="glow-cyan"
        style={{ width: 500, height: 500, bottom: -150, left: -150 }}
      />

      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-24 lg:py-36 relative z-10">
        <div className="max-w-2xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="stat-chip inline-flex">
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--tertiary)",
                  display: "inline-block",
                }}
              />
              VAGAS LIMITADAS · FASE BETA
            </div>
          </motion.div>

          {/* Headline — from Stitch HTML */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="headline-md text-gold-gradient"
            style={{ marginBottom: "1.25rem" }}
          >
            GARANTA SUA POSIÇÃO NO PRÉ-REGISTRO.
          </motion.h2>

          {/* Subheadline — from Stitch HTML */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1.0625rem",
              lineHeight: 1.75,
              color: "var(--on-surface-variant)",
              marginBottom: "2.5rem",
            }}
          >
            As vagas para a fase Beta são limitadas. Inscreva-se agora para
            receber o convite exclusivo e o{" "}
            <span style={{ color: "var(--primary)", fontWeight: 600 }}>
              Whitepaper técnico do PREVEJO.
            </span>
          </motion.p>

          {/* Exclusive access notice */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="label-mono mb-8"
            style={{ color: "var(--on-surface-variant)" }}
          >
            ACESSO ANTECIPADO EXCLUSIVO PARA INVESTIDORES QUALIFICADOS
          </motion.div>

          {/* Form — glass card treatment */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <form
              onSubmit={handleSubmit}
              className="glass-card"
              style={{ padding: "2rem", position: "relative", overflow: "hidden" }}
            >
              {/* Inner glow */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse at top, rgba(212, 175, 55, 0.07) 0%, transparent 60%)",
                  pointerEvents: "none",
                }}
              />

              <div className="relative flex flex-col sm:flex-row gap-3">
                {/* Email Input */}
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor="email-input"
                    className="label-mono"
                    style={{ display: "block", marginBottom: "0.5rem", textAlign: "left" }}
                  >
                    SEU E-MAIL
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    placeholder="investidor@prevejo.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status !== "idle"}
                    style={{
                      width: "100%",
                      background: "var(--surface-container-lowest)",
                      border: "none",
                      borderBottom: `2px solid ${
                        email
                          ? "var(--primary)"
                          : "var(--outline-variant)"
                      }`,
                      borderRadius: 0,
                      padding: "0.75rem 0",
                      color: "var(--on-background)",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.9375rem",
                      outline: "none",
                      transition: "border-color 0.3s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderBottomColor = "var(--primary)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderBottomColor = email
                        ? "var(--primary)"
                        : "var(--outline-variant)")
                    }
                  />
                </div>

                {/* Submit Button */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  <motion.button
                    type="submit"
                    disabled={status !== "idle"}
                    className="btn-primary"
                    whileHover={status === "idle" ? { scale: 1.02 } : {}}
                    whileTap={status === "idle" ? { scale: 0.98 } : {}}
                    style={{
                      minWidth: "160px",
                      opacity: status !== "idle" ? 0.7 : 1,
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    {status === "idle" && (
                      <>
                        <span>Inscrever-se</span>
                        <ArrowRight size={16} style={{ position: "relative", zIndex: 1 }} />
                      </>
                    )}
                    {status === "loading" && (
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          border: "2px solid rgba(60, 47, 0, 0.3)",
                          borderTop: "2px solid #3c2f00",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                    )}
                    {status === "success" && (
                      <>
                        <span>Registrado!</span>
                        <CheckCircle2 size={16} style={{ position: "relative", zIndex: 1 }} />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {status === "success" && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: "1.25rem",
                    fontFamily: "var(--font-label), monospace",
                    fontSize: "0.8125rem",
                    color: "var(--tertiary)",
                    letterSpacing: "0.1em",
                  }}
                >
                  ✓ Redirecionando para WhatsApp...
                </motion.p>
              )}
            </form>
          </motion.div>

          {/* Trust signal */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="label-mono mt-6"
            style={{ color: "rgba(208, 197, 175, 0.5)" }}
          >
            🔐 Seus dados são protegidos · Infraestrutura criptografada
          </motion.p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
