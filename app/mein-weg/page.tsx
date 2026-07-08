import type { Metadata } from "next";
import { getModul, landkarte } from "@/lib/content";
import type { Interaktion } from "@/lib/module-schema";
import MeinWegInhalt, {
  type BaselineAchse,
  type ModulInfo,
} from "@/components/MeinWegInhalt";

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

// Achsen des Baseline-Selbsttests (aus Modul „Wo du gerade stehst") — für die
// Beschriftung von „Dein Ausgangspunkt". Werte selbst liegen lokal im Browser.
const baselineAchsen: BaselineAchse[] =
  getModul("wo-du-stehst")
    ?.schritte.flatMap((s) => s.interaktionen ?? [])
    .find(
      (i): i is Extract<Interaktion, { art: "selbsttest" }> =>
        i.art === "selbsttest",
    )?.achsen ?? [];

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

      <MeinWegInhalt modulInfos={modulInfos} baselineAchsen={baselineAchsen} />
    </article>
  );
}
