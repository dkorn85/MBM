import Link from "next/link";
import { landkarte } from "@/lib/content";
import type {
  ModulStatus2,
  Seitenpfad,
  Station,
  StationModulRef,
} from "@/lib/module-schema";
import AbgeschlossenChip from "@/components/AbgeschlossenChip";
import HomeGemerkt from "@/components/HomeGemerkt";

// Status jedes Moduls (aus den Stationen) — für die Needs-Chips (nur „written"
// ist anklickbar).
const modulStatus = new Map<string, ModulStatus2>();
landkarte.path.stations.forEach((s) =>
  s.modules.forEach((m) => modulStatus.set(m.id, m.status)),
);

// ── Needs-Einstieg ────────────────────────────────────────────────────
function NeedsEinstieg() {
  const { eyebrow, chips } = landkarte.needsEntry;
  return (
    <section className="space-y-3">
      <p className="text-tinte-sanft">{eyebrow}</p>
      <ul className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const klickbar = modulStatus.get(chip.targetModule) === "written";
          if (klickbar) {
            return (
              <li key={chip.targetModule}>
                <Link
                  href={`/modul/${chip.targetModule}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-linie bg-flaeche px-4 py-2 text-tinte transition-[border-color,color] duration-200 ease-out hover:border-salbei hover:text-salbei-tief"
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
  return (
    <Link
      href={`/modul/${modul.id}`}
      className="group block rounded-2xl border border-linie bg-flaeche p-5 transition-[border-color,transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:border-salbei hover:shadow-sm"
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl">{modul.title}</h3>
          <AbgeschlossenChip modulId={modul.id} />
        </div>
        {typeof modul.durationMin === "number" ? (
          <p className="text-sm text-tinte-sanft">
            ca. {modul.durationMin} Minuten
          </p>
        ) : null}
        <p className="text-salbei-tief transition-colors duration-200 ease-out group-hover:text-akzent">
          Modul beginnen{" "}
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1"
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
    <div className="rounded-2xl border border-dashed border-linie p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl text-tinte-sanft">{modul.title}</h3>
        <span className="inline-flex items-center rounded-full bg-sand/30 px-3 py-1 text-sm text-tinte-sanft">
          auf dem Weg
        </span>
      </div>
    </div>
  );
}

// Seitenpfad „Begegnen" — gegatet, klar als späterer Nebenweg markiert.
function BranchTeaser({ branch }: { branch: Seitenpfad }) {
  return (
    <div className="rounded-2xl border border-dashed border-linie bg-flaeche/40 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl text-tinte-sanft">{branch.title}</h3>
        <span className="inline-flex items-center rounded-full bg-sand/30 px-3 py-1 text-sm text-tinte-sanft">
          {branch.tag}
        </span>
      </div>
      <p className="mt-2 text-sm text-tinte-sanft">{branch.gateCopy}</p>
    </div>
  );
}

// ── Eine Station auf dem Weg ──────────────────────────────────────────
function StationAbschnitt({ station }: { station: Station }) {
  return (
    <li className="relative pl-12 sm:pl-14">
      {/* Knoten auf dem Wegband */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-linie bg-grund text-sm font-medium text-salbei-tief sm:h-10 sm:w-10"
      >
        {station.number}
      </span>

      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-salbei-tief">
            {station.tag}
          </p>
          <h2 className="text-2xl">{station.title}</h2>
          {/* Shift-Satz — das Herzstück der Station */}
          <p className="max-w-[62ch] pt-1 text-lg italic text-tinte">
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
    </li>
  );
}

// ── Loop-Puls: ruhige Vorschau, (noch) nicht interaktiv ───────────────
function LoopPuls() {
  const { title, subtitle, items } = landkarte.loop;
  return (
    <section className="space-y-4 rounded-2xl border border-linie bg-flaeche p-6 sm:p-7">
      <div className="space-y-1">
        <h2 className="text-xl">{title}</h2>
        <p className="text-tinte-sanft">{subtitle}</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-linie bg-grund/60 p-4"
          >
            <p className="font-medium text-tinte">{item.title}</p>
            <p className="mt-1 text-sm text-tinte-sanft">{item.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Horizont: Licht am Ende des Wegs ──────────────────────────────────
function Horizont() {
  const { name, subtitle, body, clarifier } = landkarte.horizon;
  return (
    <section className="flex flex-col items-center gap-5 pt-6 text-center">
      {/* Ruhig atmende, sich öffnende konzentrische Ringe (dekorativ) */}
      <div className="flex h-24 items-center justify-center">
        <span
          aria-hidden="true"
          className="mbm-horizont-ringe block h-3 w-3 bg-gold"
        />
      </div>
      <div className="max-w-[58ch] space-y-2">
        <h2 className="text-3xl">{name}</h2>
        <p className="text-tinte-sanft">{subtitle}</p>
        <p>{body}</p>
        {clarifier ? (
          <p className="text-sm text-tinte-sanft">{clarifier}</p>
        ) : null}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="space-y-14">
      {/* ── Hero: der schwebende Bison zwischen Wolken ── */}
      <section className="relative pb-2 pt-2">
        <div className="relative flex flex-col items-center gap-6 sm:flex-row-reverse sm:items-center sm:gap-10">
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/deko/wolke-2.svg"
              alt=""
              aria-hidden="true"
              className="mbm-deko-wolken pointer-events-none absolute -bottom-6 -right-3 w-56 select-none opacity-50 sm:w-64"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/deko/wolke-1.svg"
              alt=""
              aria-hidden="true"
              className="mbm-deko-wolken pointer-events-none absolute -left-16 -top-8 w-36 select-none opacity-30 sm:-left-24 sm:w-44"
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

      <NeedsEinstieg />

      {/* ── Der Weg: vier Stationen, Bewegung nach innen ── */}
      <section className="space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-salbei-tief">
          {landkarte.path.overviewLabel}
        </p>
        <div className="relative">
          {/* Wegband: schmaler vertikaler Verlauf dunkel→licht neben den
              Stationen (Entscheidung dokumentiert in globals.css). */}
          <div
            aria-hidden="true"
            className="mbm-journey pointer-events-none absolute bottom-2 left-4 top-2 w-[3px] rounded-full sm:left-[19px]"
          />
          <ol className="space-y-12">
            {landkarte.path.stations.map((station) => (
              <StationAbschnitt key={station.id} station={station} />
            ))}
          </ol>
        </div>
      </section>

      <LoopPuls />

      <Horizont />
    </div>
  );
}
