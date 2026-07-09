import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-linie">
      <div className="mx-auto max-w-2xl space-y-2 px-5 py-8 text-sm text-tinte-sanft sm:px-6">
        <p>
          Dieses Angebot ist Bildung, keine Therapie. Es ersetzt keine
          medizinische oder psychotherapeutische Behandlung.
        </p>
        <p className="flex flex-wrap gap-x-5 gap-y-1">
          <Link
            href="/hilfe"
            className="inline-flex min-h-11 items-center text-salbei-tief underline underline-offset-4 transition-colors duration-200 ease-ruhig hover:text-akzent"
          >
            Hilfe in Krisen
          </Link>
          <Link
            href="/datenschutz"
            className="inline-flex min-h-11 items-center text-salbei-tief underline underline-offset-4 transition-colors duration-200 ease-ruhig hover:text-akzent"
          >
            Datenschutz
          </Link>
        </p>
      </div>
    </footer>
  );
}
