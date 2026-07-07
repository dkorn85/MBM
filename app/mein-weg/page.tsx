import type { Metadata } from "next";
import { landkarte } from "@/lib/content";
import MeinWegInhalt, { type ModulInfo } from "@/components/MeinWegInhalt";

export const metadata: Metadata = {
  title: "Mein Weg — YipYip",
};

// Modul-Infos für „Mein Weg": id → Titel + Stations-Zugehörigkeit (als Chip).
const modulInfos: ModulInfo[] = landkarte.path.stations.flatMap((station) =>
  station.modules.map((m) => ({
    id: m.id,
    titel: m.title,
    thema: station.title,
  })),
);

export default function MeinWegPage() {
  return (
    <article className="space-y-12">
      <div className="space-y-6">
        <h1 className="text-3xl">Mein Weg</h1>
        <p>
          Hier sammelt sich, was du erlebt hast: abgeschlossene Module, deine
          Notizen, deine Experimente. Alles bleibt auf deinem Gerät.
        </p>
      </div>

      <MeinWegInhalt modulInfos={modulInfos} />
    </article>
  );
}
