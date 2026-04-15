import Navbar from "@/components/layout/navbar";
import Hero from "@/components/sections/hero";
import Countdown from "@/components/ui/countdown";
import Features from "@/components/sections/features";
import LeadCapture from "@/components/sections/lead-capture";
import Image from "next/image";

// Footer links — from Stitch HTML
const footerLinks = {
  product: [
    { label: "Mercados", href: "#mercados" },
    { label: "Tecnologia", href: "#tecnologia" },
    { label: "IA", href: "#ia" },
    { label: "Sobre", href: "#sobre" },
  ],
  legal: [
    { label: "Termos de Uso", href: "#" },
    { label: "Privacidade", href: "#" },
    { label: "Contato", href: "#" },
    { label: "Documentação API", href: "#" },
  ],
};

function Footer() {
  return (
    <footer
      style={{
        background: "var(--surface-container-lowest)",
        borderTop: "1px solid rgba(77, 70, 53, 0.2)",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-16">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: "3rem",
          }}
          className="grid-cols-1 md:grid-cols-3"
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  position: "relative",
                  flexShrink: 0,
                }}
              >
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
                  fontSize: "1rem",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  color: "var(--on-background)",
                }}
              >
                PREVEJO
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-label), monospace",
                fontSize: "0.75rem",
                color: "rgba(208, 197, 175, 0.6)",
                letterSpacing: "0.05em",
                lineHeight: 1.8,
                maxWidth: "22rem",
              }}
            >
              O SOBERANO FUTURISTA
              <br />
              A primeira IA soberana para o mercado de futuros brasileiro.
            </p>
          </div>

          {/* Product links */}
          <div>
            <p
              style={{
                fontFamily: "var(--font-label), monospace",
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                color: "var(--on-surface-variant)",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              Produto
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="footer-link"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <p
              style={{
                fontFamily: "var(--font-label), monospace",
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                color: "var(--on-surface-variant)",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              Legal
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="footer-link"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            marginTop: "3rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid rgba(77, 70, 53, 0.2)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-label), monospace",
              fontSize: "0.6875rem",
              color: "rgba(208, 197, 175, 0.4)",
              letterSpacing: "0.08em",
            }}
          >
            © 2024 PREVEJO. O Soberano Futurista. Todos os direitos reservados.
          </p>
          <p
            style={{
              fontFamily: "var(--font-label), monospace",
              fontSize: "0.6875rem",
              color: "rgba(208, 197, 175, 0.3)",
              letterSpacing: "0.05em",
            }}
          >
            CNPJ: em registro · São Paulo, Brasil
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "var(--background)",
        color: "var(--on-background)",
      }}
    >
      {/* Premium grain texture */}
      <div className="grain-overlay" />

      {/* Navigation */}
      <Navbar />

      {/* Sections */}
      <Hero />
      <Countdown />
      <Features />
      <LeadCapture />
      <Footer />
    </main>
  );
}
