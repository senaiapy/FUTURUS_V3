import type { Metadata } from "next";
import { Inter, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PREVEJO | O Soberano Futurista — Mercado de Futuros Preditivo",
  description:
    "A primeira inteligência artificial soberana focada exclusivamente na liquidez e volatilidade do mercado de futuros brasileiro. Decisões algorítmicas com precisão milimétrica.",
  keywords: [
    "futuros",
    "preditivo",
    "IA",
    "mercado financeiro",
    "trading",
    "PREVEJO",
    "B3",
    "Mini Índice",
    "Mini Dólar",
    "algoritmo",
  ],
  authors: [{ name: "PREVEJO" }],
  openGraph: {
    title: "PREVEJO | O Soberano Futurista",
    description:
      "A primeira IA soberana para o mercado de futuros brasileiro.",
    siteName: "PREVEJO",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${manrope.variable} ${spaceGrotesk.variable} scroll-smooth`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
