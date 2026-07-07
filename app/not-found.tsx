import Link from "next/link";

export default function NotFound() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl">Diese Seite gibt es nicht.</h1>
      <p>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-salbei-tief underline underline-offset-4 transition-colors duration-200 ease-out hover:text-akzent"
        >
          Zur Übersicht
        </Link>
      </p>
    </article>
  );
}
