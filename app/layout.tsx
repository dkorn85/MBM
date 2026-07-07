import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/source-sans-3";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OnboardingDisclaimer from "@/components/OnboardingDisclaimer";

export const metadata: Metadata = {
  title: "Gebrauchsanweisung zum Menschsein",
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
    <html lang="de">
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
      </body>
    </html>
  );
}
