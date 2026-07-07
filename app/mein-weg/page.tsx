import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mein Weg — Gebrauchsanweisung zum Menschsein",
};

export default function MeinWegPage() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl">Mein Weg</h1>

      <p>
        Hier sammelt sich, was du erlebt hast: abgeschlossene Module, deine
        Notizen, deine Experimente. Alles bleibt auf deinem Gerät.
      </p>

      <div className="rounded-2xl border border-linie bg-flaeche p-6 text-tinte-sanft">
        <p>Noch ist hier nichts — und das ist völlig in Ordnung.</p>
      </div>
    </article>
  );
}
