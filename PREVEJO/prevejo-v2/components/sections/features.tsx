"use client";

import { motion } from "framer-motion";

// ==== Data from Stitch HTML content ====
const mainFeatures = [
  {
    id: "mercados",
    badge: "MOTOR PREDITIVO",
    title: "Arquitetura Preditiva Neural",
    body: "Nossos modelos não seguem tendências. Eles calculam o fluxo de ordens institucional milissegundos antes da execução, identificando padrões de reversão no Mini Índice e Mini Dólar.",
    accent: "primary",
    side: "left",
  },
  {
    id: "ia",
    badge: "VANTAGEM COMPETITIVA",
    title: "Data-Driven Alpha",
    body: "Acesso exclusivo a metadados de mercado que players convencionais não enxergam. Sinais derivados de fluxo de ordem, book de ofertas e correlações cross-asset em tempo real.",
    accent: "tertiary",
    side: "right",
  },
];

const featureCards = [
  {
    icon: "🔐",
    title: "Soberania de Dados",
    body: "Infraestrutura proprietária. Seus dados nunca saem da nossa rede criptografada.",
    accent: "primary",
  },
  {
    icon: "⚡",
    title: "Execução Instantânea",
    body: "Conectividade direta com a B3 via DMA2, garantindo o melhor fill rate possível.",
    accent: "tertiary",
  },
  {
    icon: "📊",
    title: "Análise de Sentimento",
    body: "IA que interpreta fluxo, notícias e redes sociais para antecipar movimentos do mercado.",
    accent: "primary",
  },
];

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  initial: { y: 32, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Features() {
  return (
    <>
      {/* ============================================
          SECTION 1: Two main feature blocks
          ============================================ */}
      <section
        id="tecnologia"
        className="relative overflow-hidden"
        style={{ background: "var(--surface-container-low)" }}
      >
        {/* Decorative cyan glow right */}
        <div
          className="glow-cyan"
          style={{ width: 600, height: 600, top: 0, right: -200 }}
        />

        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-20 lg:py-32">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 lg:mb-24"
          >
            <span className="label-mono">TECNOLOGIA DE PONTA</span>
            <div
              style={{
                marginTop: "0.5rem",
                width: "3rem",
                height: "2px",
                background: "var(--primary)",
              }}
            />
          </motion.div>

          {/* Feature blocks */}
          <div className="flex flex-col gap-24 lg:gap-32">
            {mainFeatures.map((feat, idx) => (
              <motion.div
                key={feat.id}
                id={feat.id}
                initial={{ opacity: 0, x: feat.side === "left" ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  feat.side === "right" ? "lg:grid-flow-row-dense" : ""
                }`}
              >
                {/* Text side */}
                <div
                  className={
                    feat.side === "right" ? "lg:col-start-2" : ""
                  }
                >
                  <div
                    className="stat-chip mb-6"
                    style={
                      feat.accent === "tertiary"
                        ? {
                            background: "rgba(0, 227, 253, 0.08)",
                            borderColor: "rgba(0, 227, 253, 0.2)",
                            color: "var(--tertiary)",
                          }
                        : {}
                    }
                  >
                    {feat.badge}
                  </div>
                  <h2 className="headline-md" style={{ marginBottom: "1.25rem" }}>
                    {feat.title}
                  </h2>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "1.0625rem",
                      lineHeight: 1.75,
                      color: "var(--on-surface-variant)",
                      maxWidth: "28rem",
                    }}
                  >
                    {feat.body}
                  </p>
                </div>

                {/* Visual side — abstract data card */}
                <div
                  className={
                    feat.side === "right" ? "lg:col-start-1 lg:row-start-1" : ""
                  }
                >
                  <div
                    className="glass-card"
                    style={{
                      padding: "2rem",
                      position: "relative",
                      overflow: "hidden",
                      minHeight: "240px",
                    }}
                  >
                    {/* Chart simulation */}
                    <svg
                      viewBox="0 0 400 160"
                      className="w-full"
                      style={{ display: "block" }}
                    >
                      <defs>
                        <linearGradient
                          id={`chartGrad${idx}`}
                          x1="0" y1="0" x2="0" y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={
                              feat.accent === "primary" ? "#f2ca50" : "#00e3fd"
                            }
                            stopOpacity="0.2"
                          />
                          <stop
                            offset="100%"
                            stopColor={
                              feat.accent === "primary" ? "#f2ca50" : "#00e3fd"
                            }
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                      {/* Area fill */}
                      <path
                        d={
                          idx === 0
                            ? "M0,120 L60,95 L120,105 L180,60 L240,75 L300,40 L360,55 L400,30 L400,160 L0,160 Z"
                            : "M0,110 L60,100 L120,80 L180,90 L240,50 L300,65 L360,30 L400,45 L400,160 L0,160 Z"
                        }
                        fill={`url(#chartGrad${idx})`}
                      />
                      {/* Line */}
                      <path
                        d={
                          idx === 0
                            ? "M0,120 L60,95 L120,105 L180,60 L240,75 L300,40 L360,55 L400,30"
                            : "M0,110 L60,100 L120,80 L180,90 L240,50 L300,65 L360,30 L400,45"
                        }
                        fill="none"
                        stroke={feat.accent === "primary" ? "#f2ca50" : "#00e3fd"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Data dots */}
                      {(idx === 0
                        ? [[0,120],[60,95],[120,105],[180,60],[240,75],[300,40],[360,55],[400,30]]
                        : [[0,110],[60,100],[120,80],[180,90],[240,50],[300,65],[360,30],[400,45]]
                      ).map(([x, y], di) => (
                        <circle
                          key={di}
                          cx={x}
                          cy={y}
                          r="3"
                          fill={feat.accent === "primary" ? "#f2ca50" : "#00e3fd"}
                          opacity="0.8"
                        />
                      ))}
                    </svg>

                    {/* Data labels */}
                    <div
                      className="flex items-center justify-between mt-4"
                      style={{ marginTop: "1rem" }}
                    >
                      <span className="label-mono">MINI ÍNDICE · WIN</span>
                      <span
                        style={{
                          fontFamily: "var(--font-space-grotesk), monospace",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: feat.accent === "primary" ? "var(--primary)" : "var(--tertiary)",
                        }}
                      >
                        {feat.accent === "primary" ? "+2.34%" : "+1.87%"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 2: Feature cards grid
          ============================================ */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--surface-container)" }}
      >
        {/* Gold glow left */}
        <div
          className="glow-gold"
          style={{ width: 500, height: 500, bottom: -100, left: -100 }}
        />

        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <motion.div
            variants={containerVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {featureCards.map((card) => (
              <motion.div
                key={card.title}
                variants={itemVariants}
                className="glass-card group"
                style={{
                  padding: "2rem",
                  cursor: "default",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                whileHover={{
                  y: -4,
                  boxShadow:
                    card.accent === "primary"
                      ? "0 12px 40px rgba(242, 202, 80, 0.12)"
                      : "0 12px 40px rgba(0, 227, 253, 0.10)",
                  transition: { duration: 0.25 },
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    fontSize: "1.75rem",
                    marginBottom: "1.25rem",
                    display: "block",
                  }}
                >
                  {card.icon}
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: "var(--font-headline), sans-serif",
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "var(--on-background)",
                    marginBottom: "0.75rem",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {card.title}
                </h3>

                {/* Body */}
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9375rem",
                    lineHeight: 1.7,
                    color: "var(--on-surface-variant)",
                  }}
                >
                  {card.body}
                </p>

                {/* Bottom accent line */}
                <div
                  style={{
                    marginTop: "1.5rem",
                    height: "1px",
                    background:
                      card.accent === "primary"
                        ? "linear-gradient(to right, var(--primary-container), transparent)"
                        : "linear-gradient(to right, var(--tertiary-container), transparent)",
                    opacity: 0.4,
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
