import { TextAbsaetze } from "./Bloecke";

export default function ExperimentKarte({
  experiment,
}: {
  experiment: { haupt: string; optional?: string };
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-linie bg-sand/40 p-6">
      <div className="max-w-[65ch] space-y-4">
        <TextAbsaetze text={experiment.haupt} keyPrefix="exp-haupt" />
      </div>
      {experiment.optional ? (
        <div className="max-w-[65ch] space-y-4 border-t border-linie pt-4 text-tinte-sanft">
          <TextAbsaetze text={experiment.optional} keyPrefix="exp-opt" />
        </div>
      ) : null}
    </div>
  );
}
