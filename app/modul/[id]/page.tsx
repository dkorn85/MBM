import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { alleModule, getModul } from "@/lib/content";
import ModulPlayer from "@/components/modul/ModulPlayer";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return alleModule.map((modul) => ({ id: modul.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const modul = getModul(id);
  if (!modul) return {};
  return { title: `${modul.titel} — YipYip` };
}

export default async function ModulPage({ params }: Props) {
  const { id } = await params;
  const modul = getModul(id);
  if (!modul) notFound();

  return (
    <article className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl">{modul.titel}</h1>
        <p className="text-tinte-sanft">
          {modul.thema} · ca. {modul.dauerMin} Minuten
        </p>
      </header>
      <ModulPlayer modul={modul} />
    </article>
  );
}
