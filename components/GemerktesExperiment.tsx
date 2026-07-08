"use client";

import Link from "next/link";
import type { AktivesExperiment } from "@/lib/storage";
import { storage } from "@/lib/storage";
import ExperimentKarte from "./modul/ExperimentKarte";

export default function GemerktesExperiment({
  experiment,
}: {
  experiment: AktivesExperiment;
}) {
  const nichtMehr = () => storage.entferneExperiment(experiment.modulId);

  return (
    <div className="space-y-3">
      <ExperimentKarte
        experiment={{ haupt: experiment.haupt, optional: experiment.optional }}
      />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          href={`/modul/${experiment.modulId}`}
          className="inline-flex min-h-11 items-center text-salbei-tief underline underline-offset-4 transition-colors duration-200 ease-ruhig hover:text-akzent"
        >
          Zum Modul
        </Link>
        <button
          type="button"
          onClick={nichtMehr}
          className="inline-flex min-h-11 items-center rounded-xl border border-linie px-4 py-2 text-tinte-sanft transition duration-200 ease-ruhig hover:border-salbei hover:text-tinte active:scale-[0.98]"
        >
          Nicht mehr merken
        </button>
      </div>
    </div>
  );
}
