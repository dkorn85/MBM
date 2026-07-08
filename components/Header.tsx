import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-linie">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 font-ueberschrift text-2xl text-tinte transition-colors duration-200 ease-ruhig hover:text-salbei-tief"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/yipyip-bison-transparent.svg"
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 shrink-0"
          />
          YipYip
        </Link>
        <nav aria-label="Hauptnavigation">
          <ul className="flex items-center gap-5 text-base text-tinte-sanft">
            <li>
              <Link
                href="/mein-weg"
                className="inline-flex min-h-11 items-center transition-colors duration-200 ease-ruhig hover:text-salbei-tief"
              >
                Mein Weg
              </Link>
            </li>
            <li>
              <Link
                href="/hilfe"
                className="inline-flex min-h-11 items-center transition-colors duration-200 ease-ruhig hover:text-salbei-tief"
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
