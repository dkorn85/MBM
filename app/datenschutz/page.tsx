import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz — YipYip",
};

const link =
  "text-salbei-tief underline underline-offset-4 transition-colors duration-200 ease-ruhig hover:text-akzent";

// HINWEIS (nicht sichtbar): ENTWURF — vor Veröffentlichung juristisch prüfen lassen
// und die [in eckigen Klammern] markierten Verantwortlichen-/Kontaktangaben ausfüllen.
export default function DatenschutzPage() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl">Datenschutz</h1>
      <p className="text-tinte-sanft">
        Kurz gesagt: YipYip ist bewusst datensparsam. Deine Eingaben bleiben
        standardmäßig <strong>auf deinem Gerät</strong>. Es gibt kein Nutzerkonto,
        kein Tracking, keine Werbung. Nur wenn du die optionale KI-Spiegelung
        ausdrücklich erlaubst, verlässt ein anonymer Ausschnitt einmalig dein Gerät.
      </p>

      <section className="space-y-2">
        <h2 className="text-xl">1 · Verantwortlicher</h2>
        <p>
          Dennis Korn · [Anschrift ergänzen] · [Kontakt-E-Mail ergänzen].
          <br />
          <span className="text-sm text-tinte-sanft">
            (Betreiber der Lern-App YipYip.)
          </span>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl">2 · Daten auf deinem Gerät (Standard)</h2>
        <p>
          Der Kern der App speichert alles ausschließlich lokal im{" "}
          <em>Speicher deines Browsers</em> (localStorage) — es wird dafür{" "}
          <strong>nichts an einen Server übertragen</strong>. Das betrifft: deinen
          Selbsttest, den täglichen Puls (Spür-Check, Glücksmoment, Anker), deine
          Journal-Notizen, gemerkte Experimente, deinen Modul-Fortschritt sowie
          kleine Merker (z. B. dass du den Hinweis beim Start gesehen hast).
        </p>
        <p className="text-sm text-tinte-sanft">
          Du kannst diese Daten jederzeit selbst löschen, indem du die
          Website-Daten in deinem Browser leerst.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl">3 · Optionale KI-Spiegelung</h2>
        <p>
          An einigen Stellen kannst du dir freiwillig eine persönliche Einladung von
          einer KI erzeugen lassen. Das passiert <strong>nur</strong>, wenn du es
          vorher ausdrücklich erlaubst (getrennte Einwilligung, jederzeit
          widerrufbar). Dann wird ein <strong>anonymer Zustand</strong> aus deinen
          bereits lokal vorhandenen Angaben (Selbsteinschätzung, kurze Notizen,
          welche Module du durchlaufen hast) einmalig an unseren Auftragsverarbeiter{" "}
          <strong>Mistral AI (Frankreich, EU)</strong> gesendet, um daraus{" "}
          <em>eine</em> Einladung zu formulieren.
        </p>
        <ul className="ml-5 list-disc space-y-1 text-sm text-tinte-sanft">
          <li>Verarbeitung ausschließlich in der EU, kein Drittland-Transfer.</li>
          <li>Mistral <strong>trainiert nicht</strong> mit deinen Daten.</li>
          <li>
            <strong>Zero Data Retention</strong> ist aktiv: es wird nichts über die
            Antwort hinaus gespeichert — weder bei uns (die Verarbeitung ist
            serverseitig zustandslos) noch bei Mistral.
          </li>
          <li>
            Ein Teil dieser Daten kann psychische Aspekte betreffen und gilt damit
            als Gesundheitsdatum. Rechtsgrundlage ist deine{" "}
            <strong>ausdrückliche Einwilligung</strong> (Art. 9 Abs. 2 lit. a DSGVO),
            die du hier oder in der App jederzeit widerrufen kannst.
          </li>
          <li>
            Zur Sicherheit prüft ein Klassifikator denselben Text auf Anzeichen einer
            akuten Krise, um dich dann auf Hilfsangebote hinzuweisen statt eine
            normale Einladung zu geben.
          </li>
          <li>Jede KI-Ausgabe ist als solche gekennzeichnet (kein Mensch, keine Diagnose).</li>
        </ul>
        <p className="text-sm text-tinte-sanft">
          Die App funktioniert vollständig auch ohne diese Funktion — sie ist reines
          Zusatz-Angebot und standardmäßig ausgeschaltet.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl">4 · Hosting &amp; Server-Protokolle</h2>
        <p>
          Die App wird bei <strong>Vercel</strong> gehostet. Beim Aufruf verarbeitet
          Vercel technisch notwendige Verbindungsdaten (u. a. IP-Adresse) in
          Server-Protokollen. Beim optionalen KI-Aufruf wird deine IP-Adresse kurz
          für einen Missbrauchs-/Kostenschutz (Anfrage-Begrenzung) im Arbeitsspeicher
          ausgewertet und <strong>nicht dauerhaft gespeichert</strong>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl">5 · Was wir NICHT tun</h2>
        <p>
          Keine Werbe-/Analyse-Cookies, kein Third-Party-Tracking, keine
          Weitergabe/Verkauf von Daten. Schriften sind selbst gehostet (keine
          externen Font-Dienste).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl">6 · Deine Rechte</h2>
        <p>
          Dir stehen Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch und
          Datenübertragbarkeit zu; eine erteilte Einwilligung kannst du jederzeit mit
          Wirkung für die Zukunft widerrufen. Da die Kern-Daten nur lokal liegen,
          löschst du sie unmittelbar durch Leeren der Website-Daten im Browser. Du
          kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl">7 · Änderungen</h2>
        <p className="text-sm text-tinte-sanft">
          Wir passen diese Erklärung an, wenn sich die Verarbeitung ändert. Stand:
          2026-07-09.
        </p>
      </section>

      <p>
        <a href="/hilfe" className={link}>
          Hilfe in Krisen
        </a>
      </p>
    </article>
  );
}
