"use client";

import Link from "next/link";
import { storage } from "@/lib/storage";
import type { AktivesExperiment, JournalEintrag } from "@/lib/storage";
import { useMbmWert } from "@/lib/use-mbm-storage";
import GemerktesExperiment from "./GemerktesExperiment";

export type ModulInfo = { id: string; titel: string; thema?: string };

function datumLang(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("de-DE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

function Sektion({
  titel,
  children,
}: {
  titel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl">{titel}</h2>
      {children}
    </section>
  );
}

function Leer({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-linie bg-flaeche p-6 text-tinte-sanft">
      <p>{text}</p>
    </div>
  );
}

export default function MeinWegInhalt({
  modulInfos,
}: {
  modulInfos: ModulInfo[];
}) {
  const nachId = new Map(modulInfos.map((m) => [m.id, m]));

  const abgeschlossene = useMbmWert(() => storage.getAbgeschlossene(), [], []);
  const journal = useMbmWert<JournalEintrag[]>(
    () => storage.getJournal(),
    [],
    [],
  );
  const experimente = useMbmWert<AktivesExperiment[]>(
    () => storage.getExperimente(),
    [],
    [],
  );

  const abgeschlosseneModule = abgeschlossene
    .map((id) => nachId.get(id))
    .filter((m): m is ModulInfo => m !== undefined);

  const journalNeuesteZuerst = [...journal].sort((a, b) =>
    b.erstellt.localeCompare(a.erstellt),
  );

  return (
    <div className="space-y-12">
      <Sektion titel="Abgeschlossene Module">
        {abgeschlosseneModule.length > 0 ? (
          <ul className="space-y-3">
            {abgeschlosseneModule.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/modul/${m.id}`}
                  className="group block rounded-2xl border border-linie bg-flaeche p-5 transition-colors duration-200 ease-out hover:border-salbei"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl">{m.titel}</h3>
                    {m.thema ? (
                      <span className="inline-flex items-center rounded-full bg-sand/50 px-3 py-1 text-sm text-tinte-sanft">
                        {m.thema}
                      </span>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Leer text="Noch keins — und das ist völlig in Ordnung." />
        )}
      </Sektion>

      <Sektion titel="Deine Notizen">
        {journalNeuesteZuerst.length > 0 ? (
          <ul className="space-y-4">
            {journalNeuesteZuerst.map((e, i) => (
              <li
                key={`${e.modulId}-${e.erstellt}-${i}`}
                className="space-y-1 rounded-2xl border border-linie bg-flaeche p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="font-medium text-tinte">
                    {nachId.get(e.modulId)?.titel ?? e.modulId}
                  </span>
                  <span className="text-sm text-tinte-sanft">
                    {datumLang(e.erstellt)}
                  </span>
                </div>
                <p className="text-sm text-tinte-sanft">{e.frage}</p>
                <p className="whitespace-pre-line">{e.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <Leer text="Hier erscheinen deine festgehaltenen Gedanken." />
        )}
      </Sektion>

      <Sektion titel="Deine Experimente">
        {experimente.length > 0 ? (
          <div className="space-y-6">
            {experimente.map((e) => (
              <GemerktesExperiment key={e.modulId} experiment={e} />
            ))}
          </div>
        ) : (
          <Leer text="Wenn du ein Experiment merkst, findest du es hier und auf der Startseite." />
        )}
      </Sektion>
    </div>
  );
}
