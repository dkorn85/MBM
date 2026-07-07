import landkarte from "@/content/landkarte.json";

export default function Home() {
  return (
    <section className="space-y-4">
      <h1 className="text-4xl">{landkarte.einstieg.gruss}</h1>
      <p className="max-w-[65ch] text-tinte-sanft">{landkarte.einstieg.text}</p>
    </section>
  );
}
