export default function Fortschritt({
  titel,
  aktiv,
}: {
  titel: string[];
  aktiv: number;
}) {
  return (
    <ol className="flex items-center gap-2.5" aria-label="Fortschritt">
      {titel.map((t, i) => {
        const istAktiv = i === aktiv;
        const istBesucht = i < aktiv;
        const farbe = istAktiv
          ? "bg-salbei-tief"
          : istBesucht
            ? "bg-salbei/60"
            : "bg-linie";
        return (
          <li key={i} aria-current={istAktiv ? "step" : undefined}>
            <span
              role="img"
              aria-label={`Schritt ${i + 1} von ${titel.length}: ${t}`}
              className={`block h-2.5 w-2.5 rounded-full transition-colors duration-300 ease-ruhig ${farbe}`}
            />
          </li>
        );
      })}
    </ol>
  );
}
