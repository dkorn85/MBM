import Link from "next/link";
import { landkarte } from "@/lib/content";
import type { LandkarteModul } from "@/lib/module-schema";
import AbgeschlossenChip from "@/components/AbgeschlossenChip";
import HomeGemerkt from "@/components/HomeGemerkt";

function Chip({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-sand/50 px-3 py-1 text-sm text-tinte">
      {text}
    </span>
  );
}

function AktiveModulKarte({ modul }: { modul: LandkarteModul }) {
  return (
    <Link
      href={`/modul/${modul.id}`}
      className="group block rounded-2xl border border-linie bg-flaeche p-5 transition-[border-color,transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:border-salbei hover:shadow-sm"
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl">{modul.titel}</h3>
          {modul.thema ? <Chip text={modul.thema} /> : null}
          <AbgeschlossenChip modulId={modul.id} />
        </div>
        {typeof modul.dauerMin === "number" ? (
          <p className="text-sm text-tinte-sanft">ca. {modul.dauerMin} Minuten</p>
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

function AmHorizont({ module }: { module: LandkarteModul[] }) {
  if (module.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-tinte-sanft">Am Horizont:</span>
      {module.map((modul) => (
        <span
          key={modul.id}
          className="inline-flex items-center rounded-full border border-dashed border-linie px-3 py-1 text-sm text-tinte-sanft"
        >
          {modul.titel}
        </span>
      ))}
    </div>
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
            <h1 className="text-4xl sm:text-5xl">{landkarte.einstieg.gruss}</h1>
            <p className="mx-auto max-w-[60ch] text-lg text-tinte-sanft sm:mx-0">
              {landkarte.einstieg.text}
            </p>
          </div>
        </div>
      </section>

      <HomeGemerkt />

      {/* ── Landkarte: vier Ebenen ── */}
      {landkarte.ebenen.map((ebene) => {
        const aktive = ebene.module.filter((m) => m.status === "aktiv");
        const kommende = ebene.module.filter((m) => m.status !== "aktiv");
        return (
          <section key={ebene.ebene} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                {ebene.deko ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ebene.deko}
                    alt=""
                    aria-hidden="true"
                    className="mbm-deko-piktogramm h-9 w-9 shrink-0 select-none"
                  />
                ) : null}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-salbei-tief">
                    Ebene {ebene.ebene}
                  </p>
                  <h2 className="text-2xl">{ebene.name}</h2>
                </div>
              </div>
              <p className="max-w-[65ch] text-tinte-sanft">{ebene.untertitel}</p>
            </div>
            {aktive.length > 0 ? (
              <div className="space-y-3">
                {aktive.map((modul) => (
                  <AktiveModulKarte key={modul.id} modul={modul} />
                ))}
              </div>
            ) : null}
            <AmHorizont module={kommende} />
          </section>
        );
      })}

      {/* ── Wann ist „bald"? ── */}
      <section className="relative overflow-hidden rounded-2xl border border-linie bg-flaeche p-6 sm:p-7">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/deko/drachen.svg"
          alt=""
          aria-hidden="true"
          className="mbm-drachen-schwebt mbm-deko-drachen pointer-events-none absolute -right-4 -top-2 w-28 select-none sm:w-32"
        />
        <div className="max-w-[52ch] space-y-2 pr-16 sm:pr-24">
          <h2 className="text-xl">Wann ist „bald“?</h2>
          <p className="text-tinte-sanft">
            Die Landkarte füllt sich nach und nach: Jedes neue Modul entsteht
            zuerst in Lanas Praxis und findet dann seinen Weg hierher — als
            Nächstes „Kleine Inseln im Tag“. Ohne Countdown, ohne Druck. Was
            heute da ist, darf für heute reichen.
          </p>
        </div>
      </section>
    </div>
  );
}
