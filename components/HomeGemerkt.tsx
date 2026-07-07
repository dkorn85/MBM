"use client";

import { storage } from "@/lib/storage";
import { useMbmWert } from "@/lib/use-mbm-storage";
import GemerktesExperiment from "./GemerktesExperiment";

/** Sektion über der Landkarte: gemerkte Experimente. Leer → nichts anzeigen. */
export default function HomeGemerkt() {
  const experimente = useMbmWert(() => storage.getExperimente(), [], []);

  if (experimente.length === 0) return null;

  const ueberschrift =
    experimente.length === 1 ? "Dein Experiment" : "Deine Experimente";

  return (
    <section className="space-y-4">
      <h2 className="text-2xl">{ueberschrift}</h2>
      <div className="space-y-6">
        {experimente.map((e) => (
          <GemerktesExperiment key={e.modulId} experiment={e} />
        ))}
      </div>
    </section>
  );
}
