"use client";

import { storage } from "@/lib/storage";
import { useMbmWert } from "@/lib/use-mbm-storage";
import ExperimentKarte from "./ExperimentKarte";

export default function ExperimentMerken({
  modulId,
  titel,
  experiment,
}: {
  modulId: string;
  titel: string;
  experiment: { haupt: string; optional?: string };
}) {
  const gemerkt = useMbmWert(
    () => storage.getExperimente().some((e) => e.modulId === modulId),
    false,
    [modulId],
  );

  const merken = () => {
    storage.merkeExperiment({
      modulId,
      titel,
      haupt: experiment.haupt,
      optional: experiment.optional,
      gemerkt: new Date().toISOString(),
    });
  };

  const nichtMehr = () => storage.entferneExperiment(modulId);

  return (
    <div className="space-y-3">
      <ExperimentKarte experiment={experiment} />
      {gemerkt ? (
        <div className="space-y-2">
          <p className="text-sm text-tinte-sanft" role="status">
            Gemerkt — du findest es auf der Startseite.
          </p>
          <button
            type="button"
            onClick={nichtMehr}
            className="inline-flex min-h-11 items-center rounded-xl border border-linie px-4 py-2 text-tinte-sanft transition-colors duration-200 ease-out hover:border-salbei hover:text-tinte"
          >
            Nicht mehr merken
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={merken}
          className="inline-flex min-h-11 items-center rounded-xl bg-salbei-tief px-4 py-2 font-medium text-grund transition-colors duration-200 ease-out hover:bg-salbei"
        >
          Experiment merken
        </button>
      )}
    </div>
  );
}
