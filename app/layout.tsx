import type { Metadata, Viewport } from "next";
import { Fraunces, JetBrains_Mono, Newsreader } from "next/font/google";
import "./globals.css";

// Self-hosted über next/font: inline eingebunden + vorgeladen + font-display:swap,
// damit die Fonts nicht mehr hinter dem CSS im kritischen Pfad hängen (LCP).
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OnboardingDisclaimer from "@/components/OnboardingDisclaimer";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "YipYip — Gebrauchsanweisung zum Menschsein",
  description:
    "Ein ruhiges Selbstlernprogramm der Mind-Body-Medizin: verstehen, erleben, in den Alltag bringen.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF6EF" },
    { media: "(prefers-color-scheme: dark)", color: "#221F1A" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      className={`${fraunces.variable} ${newsreader.variable} ${jetbrainsMono.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-flaeche focus:px-4 focus:py-3 focus:text-tinte focus:shadow"
        >
          Zum Inhalt springen
        </a>
        <Header />
        <main id="inhalt" className="mx-auto w-full max-w-2xl flex-1 px-5 py-8 sm:px-6">
          {children}
        </main>
        <Footer />
        <OnboardingDisclaimer />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
