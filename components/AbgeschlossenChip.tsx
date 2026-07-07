"use client";

import { storage } from "@/lib/storage";
import { useMbmWert } from "@/lib/use-mbm-storage";

/** Dezenter Chip „abgeschlossen" (Salbei-Ton) für ein Modul auf der Landkarte. */
export default function AbgeschlossenChip({ modulId }: { modulId: string }) {
  const abgeschlossen = useMbmWert(
    () => storage.getModulStatus(modulId) === "abgeschlossen",
    false,
    [modulId],
  );

  if (!abgeschlossen) return null;

  return (
    <span className="inline-flex items-center rounded-full bg-salbei/20 px-3 py-1 text-sm text-salbei-tief">
      abgeschlossen
    </span>
  );
}
