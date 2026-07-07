"use client";

import { useEffect, useState } from "react";

/**
 * Liest einen Wert aus dem Storage und hält ihn aktuell: nach jedem
 * Schreibvorgang (Event "mbm:storage") und bei Änderungen aus anderen Tabs
 * (Event "storage"). Startwert ist `initial`, damit Server- und erster
 * Client-Render übereinstimmen (keine Hydration-Diskrepanz); der echte Wert
 * wird erst im Effect nachgeladen.
 */
export function useMbmWert<T>(
  lese: () => T,
  initial: T,
  deps: unknown[] = [],
): T {
  const [wert, setWert] = useState<T>(initial);

  useEffect(() => {
    const laden = () => setWert(lese());
    laden();
    window.addEventListener("mbm:storage", laden);
    window.addEventListener("storage", laden);
    return () => {
      window.removeEventListener("mbm:storage", laden);
      window.removeEventListener("storage", laden);
    };
    // lese wird bewusst nicht getrackt; Abhängigkeiten kommen über deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return wert;
}
