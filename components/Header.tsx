import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-linie">
      <div className="mx-auto flex max-w-2xl flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-4 sm:px-6">
        <Link
          href="/"
          className="font-ueberschrift text-lg text-tinte transition-colors duration-200 ease-out hover:text-salbei-tief"
        >
          Gebrauchsanweisung zum Menschsein
        </Link>
        <nav aria-label="Hauptnavigation">
          <ul className="flex items-center gap-5 text-base text-tinte-sanft">
            <li>
              <Link
                href="/mein-weg"
                className="inline-flex min-h-11 items-center transition-colors duration-200 ease-out hover:text-salbei-tief"
              >
                Mein Weg
              </Link>
            </li>
            <li>
              <Link
                href="/hilfe"
                className="inline-flex min-h-11 items-center transition-colors duration-200 ease-out hover:text-salbei-tief"
              >
                Hilfe
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
