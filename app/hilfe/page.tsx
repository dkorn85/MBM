import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hilfe in Krisen — Gebrauchsanweisung zum Menschsein",
};

const telLinkKlasse =
  "font-medium text-salbei-tief underline underline-offset-4 transition-colors duration-200 ease-out hover:text-akzent";

export default function HilfePage() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl">Hilfe in Krisen</h1>

      <p>
        Dieses Programm ist ein Bildungsangebot. Es ersetzt keine medizinische
        oder psychotherapeutische Behandlung und stellt keine Diagnosen.
      </p>
      <p>
        Wenn es dir gerade sehr schlecht geht, wenn du in einer Krise steckst
        oder Gedanken hast, dir etwas anzutun: Bitte hol dir Unterstützung. Du
        musst da nicht allein durch.
      </p>

      <ul className="space-y-3">
        <li className="rounded-2xl border border-linie bg-flaeche p-5">
          <strong>Telefonseelsorge (Deutschland):</strong>{" "}
          <a href="tel:08001110111" className={telLinkKlasse}>
            0800 111 0 111
          </a>{" "}
          oder{" "}
          <a href="tel:08001110222" className={telLinkKlasse}>
            0800 111 0 222
          </a>{" "}
          — kostenlos, rund um die Uhr, anonym. Auch per Chat und Mail:{" "}
          <a
            href="https://online.telefonseelsorge.de"
            className={telLinkKlasse}
            rel="noreferrer"
          >
            online.telefonseelsorge.de
          </a>
        </li>
        <li className="rounded-2xl border border-linie bg-flaeche p-5">
          <strong>Ärztlicher Bereitschaftsdienst (Deutschland):</strong>{" "}
          <a href="tel:116117" className={telLinkKlasse}>
            116 117
          </a>
        </li>
        <li className="rounded-2xl border border-linie bg-flaeche p-5">
          <strong>Österreich — Telefonseelsorge:</strong>{" "}
          <a href="tel:142" className={telLinkKlasse}>
            142
          </a>
        </li>
        <li className="rounded-2xl border border-linie bg-flaeche p-5">
          <strong>Schweiz — Die Dargebotene Hand:</strong>{" "}
          <a href="tel:143" className={telLinkKlasse}>
            143
          </a>
        </li>
        <li className="rounded-2xl border border-linie bg-flaeche p-5">
          <strong>Bei akuter Gefahr:</strong> Notruf{" "}
          <a href="tel:112" className={telLinkKlasse}>
            112
          </a>
        </li>
      </ul>

      <p>
        Und unabhängig von Krisen gilt: Wenn dich etwas in diesem Programm
        aufwühlt, darfst du jederzeit unterbrechen und dir Zeit lassen. Eine
        ärztliche oder psychotherapeutische Begleitung kann ein guter nächster
        Schritt sein — dieses Programm kann sie ergänzen, aber nie ersetzen.
      </p>
    </article>
  );
}
