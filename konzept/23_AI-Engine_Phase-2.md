# 23 · AI-Engine — Phase 2 (dialogischer Spiegel) · Ausarbeitung

*Arbeitet Phase 2 aus `konzept/20` §5 so weit aus, wie ohne die noch offenen
Backend-/Account-Entscheidungen möglich. Baut auf dem live gebauten Phase-1-Stack
(`lib/ai-engine/`, Route, Consent, Safety, Krisen-Layer, Rate-Limit) auf. Stand
2026-07-09. Legt zugleich die **lokale Memory-Grundschicht** an (`lib/ai-engine/memory/`).*

---

## 1 · Vision — vom Einladen zum Spiegeln

Phase 1 gibt **eine** personalisierte Einladung aus lokalem Zustand. Phase 2 macht
daraus einen **Dialog**: die Person schreibt in eigenen Worten, die Engine spiegelt
Muster ehrlich und stimmt die nächste Einladung ab — über die Zeit, mit Erinnerung.
Der Kernwert bleibt „dein Weg statt ein Weg für alle", jetzt fortlaufend. Die
Leitplanken aus `research/02` gelten unverändert und **schärfer**, weil freier Text
und Kontinuität die Risiken erhöhen (Krise, Sykophantie, Abhängigkeit).

**Nicht das Ziel:** ein Companion/Chatbot als Bindungsobjekt. Die Engine bleibt
Bildungs-Begleitung — sie fördert reale Verbindung und macht sich nicht unentbehrlich
(AI-Act-rote-Linie, Replika-Fall).

---

## 2 · Delta gegenüber Phase 1

| | Phase 1 (live) | Phase 2 |
|---|---|---|
| Eingabe | lokaler Zustand (Skalen/Notizen) | + **Freitext** der Person, mehrere Turns |
| Ausgabe | 1 Einladung | fortlaufende, abgestimmte Spiegelung |
| Gedächtnis | keins (stateless) | **Memory** (verdichtet, editierbar, löschbar) |
| Speicher | lokal (localStorage) | lokal **oder** Cloud (Accounts, geräteübergreifend) |
| Safety | pro Antwort | **über den Verlauf** (Mehr-Turn-Krise, Verlaufs-Sykophantie, Session-Grenzen) |
| Recht | 1 Consent (LLM-Aufruf) + DPIA | + Cloud-Consent, Auftragsverarbeitung, erweiterte DPIA |

---

## 3 · Architektur — der Dialog-Loop

Ein Turn läuft so (alles serverseitig hinter der Route, stateless pro Request):

```
Freitext + Kurz-Zustand
   → [Safety-Eingang]  Keyword- + Modell-Krisen-Check (wie Phase 1, aber auf den
                        Turn UND den jüngsten Verlauf)  ── Krise → Signposting, Ende
   → [Memory-Retrieval] relevante verdichtete Erinnerungen abrufen
   → [Kontext bauen]    System-Prompt + Memory + kurzer Verlauf + aktueller Turn
   → [Modell]           Mistral EU → Spiegelung/Einladung
   → [Safety-Ausgang]   Filter (Heilkunde/Nocebo/Druck/Sykophantie/Vermenschlichung)
                        + Verlaufs-Sykophantie-Check
   → [Memory-Update]    salient facts extrahieren → konsolidieren (add/update/delete)
   → Antwort + KI-Hinweis
```

Wiederverwendet aus Phase 1: `safety`, `krise-modell`, `mistral`, `ratelimit`,
`config`, der System-Prompt (mit Lana-Ton). Neu: Memory + Verlaufs-Kontext +
Verlaufs-Safety.

---

## 4 · Memory-System (Mem0-Muster)

Aus `research/02` §1: **extrahieren → konsolidieren → abrufen**. Nicht Roh-Logs,
sondern **verdichtete, editierbare, löschbare** Einträge. Prinzipien:

- **Der Mensch sieht und kontrolliert sein Memory** (Transparenz + Löschung =
  DSGVO-Betroffenenrechte + Vertrauen). Eine „Mein Gedächtnis"-Ansicht: jeder
  Eintrag lesbar, einzeln editier-/löschbar, alles-löschen jederzeit.
- **So klein wie möglich** (Datenminimierung). Nur, was die Spiegelung wirklich
  persönlicher macht — keine Sammelwut.
- **Kein sensibler Rohtext, wo Verdichtung reicht** (z. B. „fühlt sich abends oft
  unruhig, Anker hilft" statt Journal-Zitate).
- **Konsolidierung** löst Widersprüche auf (add/update/delete), analog menschlicher
  Rekonsolidierung — nicht endlos anhäufen.

**Grundschicht jetzt gebaut** (`lib/ai-engine/memory/`, lokal-first, ohne Backend):
ein austauschbares `MemoryStore`-Interface + `localMemory` (localStorage) — genau
wie `storage.ts` austauschbar ist. Extraktion/Konsolidierung (modellgestützt) und
die Cloud-Variante folgen mit den Backend-Entscheidungen.

---

## 5 · Backend / Accounts (Supabase)

Cloud wird nötig, sobald **geräteübergreifend** oder **über lange Zeit** erinnert
werden soll. Design:

- **`storage.ts`- und `MemoryStore`-Interfaces bleiben die Nahtstelle** → Supabase
  ist eine zweite Implementierung, kein Umbau. Lokal-first bleibt Default; Cloud ist
  Opt-in.
- **EU-Hosting** (Supabase EU-Region), **Auftragsverarbeitungsvertrag**, RLS
  (Row-Level-Security) pro Nutzer, Verschlüsselung, restriktiver Zugriff auf
  verdichtete Memory-Daten.
- **Dritter, entbündelter Consent** „Cloud-Speicherung/Sync" — getrennt vom
  LLM-Aufruf-Consent; Kernfunktion nie daran koppeln (Koppelungsverbot).
- Accounts so **datensparsam** wie möglich (z. B. Magic-Link/E-Mail statt Profil).

> Für **verteiltes Rate-Limiting** (Phase-1-Rest) und Sessions bietet sich derselbe
> Cloud-Baustein an (Supabase/Upstash) — ein Grund, die Backend-Frage bald zu klären.

---

## 6 · Erhöhte Safety-Last (das eigentlich Neue)

Freier Text + Kontinuität heben die Risiken — die Antworten darauf:

- **Mehr-Turn-Krise:** Krisen-Check nicht nur auf den aktuellen Satz, sondern auf den
  jüngsten Verlauf; Eskalation über Turns erkennen. Bei Krise: Dialog pausieren,
  Signposting, nicht „weiterchatten".
- **Verlaufs-Sykophantie:** nicht nur einzelne Sätze filtern — erkennen, wenn die
  Engine über mehrere Turns nur bestätigt/schmeichelt (Reward-Hacking-Muster,
  GPT-4o-Fall). Ehrliches Spiegeln erzwingen.
- **Anti-Abhängigkeit:** sanfte **Session-Grenzen** (kein endloses Chatten),
  regelmäßige Hinweise auf reale Verbindung/Pausen, keine „vermiss dich"-Bindung.
  Nutzung nicht auf Verweildauer optimieren.
- **Titration/Erdung:** bei allem, was nach innen geht, Erdungs-Abschluss anbieten.
- **Anti-Sykophantie strukturell:** weiterhin NIE auf Nutzer-Feedback („gefällt")
  optimieren.

---

## 7 · Rechtlicher Delta

- **Neue DPIA-Scope** (Erweiterung von `konzept/22`): Freitext-Verarbeitung,
  persistiertes Memory, ggf. Cloud/Accounts, längere Speicherung.
- **Auftragsverarbeitung** mit Supabase (AVV, EU-Region) zusätzlich zu Mistral.
- **Speicherdauer/Löschung** für Memory definieren (Default kurz, Nutzer-Löschung
  sofort wirksam, „Recht auf Vergessen").
- Weiterhin: **Zweck = Bildung**, keine Diagnose/Heilkunde; KI-Hinweis; entbündelte
  Consents (jetzt drei: LLM-Aufruf · Memory · Cloud).

---

## 8 · Unter-Phasen (Vorschlag)

- **2a — Dialog lokal, Memory lokal:** Freitext-Turn + lokales Memory + Verlaufs-
  Safety, alles auf dem Gerät (kein Backend, kein neuer Consent außer „Memory
  speichern"). Größter Erkenntnisgewinn bei kleinstem Rechts-/Infra-Schritt.
- **2b — Cloud/Accounts:** Supabase-Implementierung von Storage + Memory,
  geräteübergreifend, dritter Consent, erweiterte DPIA, verteiltes Rate-Limit.
- **2c — Feinschliff:** Session-Grenzen, „Mein Gedächtnis"-Ansicht ausbauen,
  Lana-Ton über den Dialog.

---

## 9 · Offene Entscheidungen (→ User)

1. **Wann Accounts/Backend?** (Schwelle zu 2b — bis dahin geht 2a rein lokal.)
2. **Supabase** als Cloud-Heimat bestätigen (EU-Region, AVV) — dort liegen schon
   andere Keys; passt auch für verteiltes Rate-Limiting.
3. **Dialog-Grenzen:** wie „frei" darf der Chat sein (Anti-Abhängigkeit) — eher
   knappe, geführte Turns oder offener?
4. **Memory-Umfang & -Dauer:** wie viel erinnern, wie lange, Default-Löschfrist?
5. **Reihenfolge:** erst 2a (lokal, sofort baubar) — oder gleich mit Cloud?

---

*Nächster konkret baubarer Schritt ohne neue Entscheidungen: **Phase 2a** auf der
jetzt gelegten lokalen Memory-Grundschicht — Freitext-Turn + Verlaufs-Safety, rein
lokal. Cloud/Accounts (2b) warten auf die Backend-Entscheidung.*
