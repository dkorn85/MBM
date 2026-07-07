import Link from "next/link";
import { landkarte } from "@/lib/content";
import type { LandkarteModul } from "@/lib/module-schema";

function Chip({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-sand/50 px-3 py-1 text-sm text-tinte-sanft">
      {text}
    </span>
  );
}

function ModulKarte({ modul }: { modul: LandkarteModul }) {
  if (modul.status === "aktiv") {
    return (
      <Link
        href={`/modul/${modul.id}`}
        className="group block rounded-2xl border border-linie bg-flaeche p-5 transition-colors duration-200 ease-out hover:border-salbei"
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl">{modul.titel}</h3>
            {modul.thema ? <Chip text={modul.thema} /> : null}
          </div>
          {typeof modul.dauerMin === "number" ? (
            <p className="text-sm text-tinte-sanft">
              ca. {modul.dauerMin} Minuten
            </p>
          ) : null}
          <p className="text-salbei-tief transition-colors duration-200 ease-out group-hover:text-akzent">
            Modul beginnen
          </p>
        </div>
      </Link>
    );
  }

  return (
    <div className="rounded-2xl border border-linie/70 bg-flaeche/50 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl text-tinte-sanft">{modul.titel}</h3>
        <Chip text="bald" />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl">{landkarte.einstieg.gruss}</h1>
        <p className="max-w-[65ch] text-lg text-tinte-sanft">
          {landkarte.einstieg.text}
        </p>
      </section>

      {landkarte.ebenen.map((ebene) => (
        <section key={ebene.ebene} className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl">{ebene.name}</h2>
            <p className="max-w-[65ch] text-tinte-sanft">{ebene.untertitel}</p>
          </div>
          <div className="space-y-3">
            {ebene.module.map((modul) => (
              <ModulKarte key={modul.id} modul={modul} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
