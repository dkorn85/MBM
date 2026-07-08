import Link from "next/link";
import { getModul, landkarte } from "@/lib/content";
import type {
  ModulStatus2,
  Seitenpfad,
  Station,
  StationId,
  StationModulRef,
} from "@/lib/module-schema";
import AbgeschlossenChip from "@/components/AbgeschlossenChip";
import HomeEinstieg from "@/components/HomeEinstieg";
import HomeGemerkt from "@/components/HomeGemerkt";
import LoopPuls from "@/components/LoopPuls";

// Status jedes Moduls (aus den Stationen) — für die Needs-Chips (nur „written"
// ist anklickbar).
const modulStatus = new Map<string, ModulStatus2>();
landkarte.path.stations.forEach((s) =>
  s.modules.forEach((m) => modulStatus.set(m.id, m.status)),
);

// Signaturbild eines Moduls (für die Karten-Thumbnails) — aus dem Modul selbst.
function bildFuer(id: string): string | null {
  const m = getModul(id);
  return m?.bild ?? m?.schritte.find((s) => s.bild)?.bild ?? null;
}

// Kleines Element-Symbol je Station (dekorativ, warm).
const STATION_ELEMENT: Record<StationId, string> = {
  ankommen: "/deko/element-erde.svg",
  runterkommen: "/deko/element-wasser.svg",
  wahrnehmen: "/deko/element-luft.svg",
  "weit-werden": "/deko/element-feuer.svg",
};

// Stations-Tönung je Station — trägt die „Bewegung nach innen" als Farbe
// (kühl/dicht oben → warm/licht unten). Volle Klassennamen, damit Tailwind sie
// findet.
const STATION_PANEL: Record<StationId, string> = {
  ankommen: "bg-panel-ankommen",
  runterkommen: "bg-panel-runterkommen",
  wahrnehmen: "bg-panel-wahrnehmen",
  "weit-werden": "bg-panel-weit",
};

// ── Needs-Einstieg ────────────────────────────────────────────────────
function NeedsEinstieg() {
  const { eyebrow, chips } = landkarte.needsEntry;
  return (
    <section className="space-y-3">
      <p className="font-label text-xs uppercase tracking-[0.16em] text-salbei-tief">
        Ganz nach Gefühl
      </p>
      <p className="text-lg text-tinte">{eyebrow}</p>
      <ul className="flex flex-wrap gap-2 pt-1">
        {chips.map((chip) => {
          const klickbar = modulStatus.get(chip.targetModule) === "written";
          if (klickbar) {
            return (
              <li key={chip.targetModule}>
                <Link
                  href={`/modul/${chip.targetModule}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-linie bg-grund px-4 py-2 text-tinte shadow-sm transition duration-200 ease-ruhig hover:border-salbei hover:text-salbei-tief active:scale-[0.97]"
                >
                  {chip.label}
                </Link>
              </li>
            );
          }
          // Ziel-Modul noch nicht geschrieben → dezent, nicht klickbar.
          return (
            <li key={chip.targetModule}>
              <span className="inline-flex min-h-11 items-center rounded-full border border-dashed border-linie px-4 py-2 text-tinte-sanft/70">
                {chip.label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ── Modul-Karten ──────────────────────────────────────────────────────
function ModulKarte({ modul }: { modul: StationModulRef }) {
  const bild = bildFuer(modul.id);
  return (
    <Link
      href={`/modul/${modul.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-linie bg-grund p-5 shadow-sm transition duration-300 ease-ruhig hover:-translate-y-0.5 hover:border-salbei hover:shadow-md active:scale-[0.98] active:duration-150"
    >
      {bild ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bild}
          alt=""
          aria-hidden="true"
          className="mbm-deko-piktogramm h-16 w-16 shrink-0 select-none transition-transform duration-500 ease-ruhig group-hover:-rotate-2 group-hover:scale-[1.04] sm:h-20 sm:w-20"
        />
      ) : null}
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl">{modul.title}</h3>
          <AbgeschlossenChip modulId={modul.id} />
        </div>
        {typeof modul.durationMin === "number" ? (
          <p className="font-label text-xs uppercase tracking-[0.12em] text-tinte-sanft">
            ca. {modul.durationMin} Min
          </p>
        ) : null}
        <p className="text-salbei-tief transition-colors duration-200 ease-ruhig group-hover:text-akzent">
          Modul beginnen{" "}
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-300 ease-ruhig group-hover:translate-x-1.5"
          >
            →
          </span>
        </p>
      </div>
    </Link>
  );
}

function GeplanteKarte({ modul }: { modul: StationModulRef }) {
  return (
    <div className="rounded-2xl border border-dashed border-linie bg-grund/40 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl text-tinte-sanft">{modul.title}</h3>
        <span className="font-label inline-flex items-center rounded-full bg-sand/40 px-3 py-1 text-xs uppercase tracking-[0.1em] text-etikett">
          auf dem Weg
        </span>
      </div>
    </div>
  );
}

// Seitenpfad „Begegnen" — gegatet, klar als späterer Nebenweg markiert.
function BranchTeaser({ branch }: { branch: Seitenpfad }) {
  return (
    <div className="rounded-2xl border border-dashed border-linie bg-grund/40 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl text-tinte-sanft">{branch.title}</h3>
        <span className="font-label inline-flex items-center rounded-full bg-sand/40 px-3 py-1 text-xs uppercase tracking-[0.1em] text-etikett">
          {branch.tag}
        </span>
      </div>
      <p className="mt-2 text-sm text-tinte-sanft">{branch.gateCopy}</p>
    </div>
  );
}

// Dezenter Verbinder zwischen zwei Stationen — der Weg als ein Fluss, ruhig.
function Verbinder() {
  return (
    <div aria-hidden="true" className="flex flex-col items-center gap-1 py-3">
      <span className="h-6 w-px bg-gradient-to-b from-linie to-transparent" />
      <span className="h-1.5 w-1.5 rounded-full bg-salbei/60" />
      <span className="h-6 w-px bg-gradient-to-b from-transparent to-linie" />
    </div>
  );
}

// ── Eine Station auf dem Weg (als farbiges Panel) ─────────────────────
function StationAbschnitt({ station }: { station: Station }) {
  return (
    <section
      className={`rounded-3xl ${STATION_PANEL[station.id]} p-6 shadow-sm sm:p-8`}
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={STATION_ELEMENT[station.id]}
              alt=""
              aria-hidden="true"
              className="mbm-deko-piktogramm h-10 w-10 shrink-0 select-none sm:h-12 sm:w-12"
            />
            <p className="font-label text-xs uppercase tracking-[0.18em] text-salbei-tief">
              Station {station.number} · {station.tag}
            </p>
          </div>
          <h2 className="text-2xl sm:text-3xl">{station.title}</h2>
          {/* Shift-Satz — das Herzstück der Station */}
          <p className="max-w-[60ch] text-lg italic text-tinte">
            „{station.shift}“
          </p>
        </div>

        <div className="space-y-3">
          {station.modules.map((modul) =>
            modul.status === "written" ? (
              <ModulKarte key={modul.id} modul={modul} />
            ) : (
              <GeplanteKarte key={modul.id} modul={modul} />
            ),
          )}
          {station.branch ? <BranchTeaser branch={station.branch} /> : null}
        </div>
      </div>
    </section>
  );
}

// ── Der Weg: die vier Stationen als farbiger, fließender Pfad ─────────
function WegSektion() {
  return (
    <section className="space-y-4">
      <p className="font-label text-xs uppercase tracking-[0.16em] text-salbei-tief">
        {landkarte.path.overviewLabel}
      </p>
      <ol className="space-y-0">
        {landkarte.path.stations.map((station, i) => (
          <li
            key={station.id}
            className="mbm-auftauchen"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            {i > 0 ? <Verbinder /> : null}
            <StationAbschnitt station={station} />
          </li>
        ))}
      </ol>
    </section>
  );
}

// ── Neben dem Weg: Themenwelten (optional, spätere Releases) ──────────
function Themenwelten() {
  const tw = landkarte.themenwelten;
  if (!tw) return null;
  return (
    <section className="space-y-5 rounded-3xl border border-dashed border-linie bg-flaeche/50 p-6 sm:p-8">
      <div className="space-y-1">
        <p className="font-label text-xs uppercase tracking-[0.16em] text-salbei-tief">
          {tw.label}
        </p>
        <p className="text-tinte-sanft">{tw.sub}</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {tw.items.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl border border-dashed border-linie p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg text-tinte-sanft">{item.title}</h3>
              <span className="font-label inline-flex items-center rounded-full bg-sand/30 px-3 py-1 text-xs uppercase tracking-[0.1em] text-etikett">
                {tw.release ?? "später"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Horizont: Licht am Ende des Wegs (warmes Abschluss-Panel) ─────────
function Horizont() {
  const { name, subtitle, body, clarifier } = landkarte.horizon;
  return (
    <section className="rounded-3xl bg-panel-weit p-8 text-center shadow-sm sm:p-12">
      <div className="flex flex-col items-center gap-6">
        <p className="font-label text-xs uppercase tracking-[0.18em] text-salbei-tief">
          Der Horizont
        </p>
        <div className="relative flex items-center justify-center">
          {/* Warmer Gold-Halo hinter den Ringen (dekorativ). */}
          <span
            aria-hidden="true"
            className="mbm-horizont-ringe pointer-events-none absolute h-20 w-20 sm:h-24 sm:w-24"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/deko/weite.svg"
            alt=""
            aria-hidden="true"
            className="mbm-deko-piktogramm mbm-schwebt relative h-32 w-32 select-none sm:h-40 sm:w-40"
          />
        </div>
        <div className="max-w-[54ch] space-y-3">
          <h2 className="text-3xl sm:text-4xl">{name}</h2>
          <p className="text-tinte-sanft">{subtitle}</p>
          <p>{body}</p>
          {clarifier ? (
            <p className="text-sm text-tinte-sanft">{clarifier}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const modes = landkarte.modes.map((m) => ({
    id: m.id === "roam" ? ("roam" as const) : ("follow" as const),
    label: m.label,
    sub: m.sub,
  }));

  return (
    <div className="space-y-14">
      {/* ── Hero: der schwebende Bison zwischen Wolken, in warmem Panel ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-panel-ankommen to-grund p-6 shadow-sm sm:p-10">
        <div className="relative flex flex-col items-center gap-6 sm:flex-row-reverse sm:items-center sm:gap-10">
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/deko/wolke-2.svg"
              alt=""
              aria-hidden="true"
              className="mbm-deko-wolken mbm-wolke-drift-a pointer-events-none absolute -bottom-6 -right-3 w-56 select-none opacity-60 sm:w-64"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/deko/wolke-1.svg"
              alt=""
              aria-hidden="true"
              className="mbm-deko-wolken mbm-wolke-drift-b pointer-events-none absolute -left-16 -top-8 w-36 select-none opacity-40 sm:-left-24 sm:w-44"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/yipyip-bison-transparent.svg"
              alt=""
              aria-hidden="true"
              className="mbm-schwebt relative w-44 select-none sm:w-56"
            />
          </div>
          <div className="relative space-y-4 text-center sm:text-left">
            <p className="font-label text-xs uppercase tracking-[0.18em] text-salbei-tief">
              Guten Tag
            </p>
            <h1 className="text-4xl sm:text-5xl">Schön, dass du da bist.</h1>
            <p className="mx-auto max-w-[60ch] text-lg text-tinte-sanft sm:mx-0">
              Von hier aus geht es Schritt für Schritt nach innen — vom ersten
              Ankommen bis zu einer inneren Weite. Kein Muss, kein Tempo. Du
              bestimmst, wie weit.
            </p>
          </div>
        </div>
      </section>

      <HomeGemerkt />

      <HomeEinstieg modes={modes} needs={<NeedsEinstieg />} weg={<WegSektion />} />

      <Themenwelten />

      {/* ── Der tägliche Puls (in warmem Rahmen, s. LoopPuls) ── */}
      <LoopPuls />

      <Horizont />
    </div>
  );
}
