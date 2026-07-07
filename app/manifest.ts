import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "YipYip — Gebrauchsanweisung zum Menschsein",
    short_name: "YipYip",
    description:
      "Ein ruhiges Selbstlernprogramm der Mind-Body-Medizin: verstehen, erleben, in den Alltag bringen.",
    lang: "de",
    display: "standalone",
    start_url: "/",
    background_color: "#FAF6EF",
    theme_color: "#FAF6EF",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
