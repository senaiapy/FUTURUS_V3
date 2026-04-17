import { Inter, Outfit, Maven_Pro, Lora } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import AuthProvider from "@/components/AuthProvider";
import CookieConsent from "@/components/CookieConsent";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ThemeProvider } from "@/contexts/ThemeContext";
import api from "@/lib/api";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const mavenPro = Maven_Pro({ subsets: ["latin"], variable: "--font-maven" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

async function getSettings() {
  try {
    const res = await api.get("/settings/general");
    return res.data;
  } catch (_error) {
    return {
      siteName: "PYFoundationGroup",
      baseColor: "221 75% 60%",
      secondaryColor: "224 40% 27%",
    };
  }
}

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: settings.siteName + " ",
    description:
      "Predict the future and win on the most advanced prediction market platform.",
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const [messages, settings] = await Promise.all([
    getMessages(),
    getSettings(),
  ]);

  return (
    <html
      lang={locale}
      className="dark"
      suppressHydrationWarning
      style={{
        // @ts-expect-error - Dynamic CSS variables
        "--base": settings.baseColor,
        "--secondary": settings.secondaryColor,
      }}
    >
      <body
        className={`${inter.variable} ${outfit.variable} ${mavenPro.variable} ${lora.variable} font-sans bg-background text-foreground antialiased`}
      >
        <AuthProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider>
              {children}
              <CookieConsent />
              <WhatsAppButton />
            </ThemeProvider>
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
