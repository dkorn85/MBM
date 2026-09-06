import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Existing Lana Lutz kit, bundled locally; no font-provider request at build/runtime.
const cormorant=localFont({src:'./fonts/CormorantGaramond-VF.ttf',display:'swap',variable:'--font-cormorant'});
const dmSans=localFont({src:'./fonts/DMSans-VF.ttf',display:'swap',variable:'--font-dm-sans'});
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
    { media: "(prefers-color-scheme: light)", color: "#F6F6E9" },
    { media: "(prefers-color-scheme: dark)", color: "#12251D" },
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
      className={`${cormorant.variable} ${dmSans.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        {/* No-Flash: Das Onboarding-Modal wird server-seitig gerendert (im HTML,
            kein JS-Gating → guter LCP). Dieses Skript läuft synchron VOR dem
            ersten Paint und markiert <html>, damit CSS das Modal bei bereits
            gesehenem Disclaimer sofort ausblendet (kein Aufblitzen). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('mbm.v1.disclaimerGesehen')==='true')document.documentElement.dataset.disclaimer='seen'}catch(e){}",
          }}
        />
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
