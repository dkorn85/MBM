// Best-Effort-Rate-Limiter für die öffentliche Einladungs-Route.
//
// Schützt gegen Bursts, Client-Loops und casual-Abuse OHNE externe Infra — der
// Zustand liegt im Modul-Speicher der jeweiligen Serverless-Instanz (übersteht
// warme Invocations). Zwei Grenzen: pro IP (Fairness) und ein globaler Deckel pro
// Instanz (Kostenschutz gegen Runaway).
//
// LIMITATION: pro Instanz, nicht verteilt — ein über viele Instanzen verteilter
// Angriff wird davon nicht voll gebremst. Für produktionsfesten, verteilten Schutz
// diese Funktion gegen Upstash/Vercel KV tauschen (der eine Austauschpunkt). Für
// die Alpha (nutzer-initiierte Calls, Consent-Gate) ist das ausreichend.

type Eintrag = { count: number; reset: number };

const FENSTER_MS = 60_000; // 1 Minute
const PRO_IP = 8; // max Anfragen je IP/Fenster
const GLOBAL_PRO_INSTANZ = 120; // Kosten-Deckel je Instanz/Fenster
const MAX_EINTRAEGE = 5000; // Speicher-Obergrenze (dann prunen)

const proIp = new Map<string, Eintrag>();
let globalCount = 0;
let globalReset = 0;

function prune(jetzt: number) {
  if (proIp.size < MAX_EINTRAEGE) return;
  for (const [k, v] of proIp) if (jetzt > v.reset) proIp.delete(k);
}

export type RateErgebnis = { ok: boolean; retryNachSek: number };

export function pruefeRate(ip: string): RateErgebnis {
  const jetzt = Date.now();

  // Globaler Fenster-Reset + Kosten-Deckel.
  if (jetzt > globalReset) {
    globalCount = 0;
    globalReset = jetzt + FENSTER_MS;
  }
  if (globalCount >= GLOBAL_PRO_INSTANZ) {
    return { ok: false, retryNachSek: Math.ceil((globalReset - jetzt) / 1000) };
  }

  // Pro-IP-Fenster.
  prune(jetzt);
  const e = proIp.get(ip);
  if (!e || jetzt > e.reset) {
    proIp.set(ip, { count: 1, reset: jetzt + FENSTER_MS });
    globalCount++;
    return { ok: true, retryNachSek: 0 };
  }
  if (e.count >= PRO_IP) {
    return { ok: false, retryNachSek: Math.ceil((e.reset - jetzt) / 1000) };
  }
  e.count++;
  globalCount++;
  return { ok: true, retryNachSek: 0 };
}
