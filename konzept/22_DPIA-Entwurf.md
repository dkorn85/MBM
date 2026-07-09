# 22 · DPIA-Entwurf — AI-Engine Phase 1

*Datenschutz-Folgenabschätzung (Art. 35 DSGVO) für die gebundene Einladungs-Schicht.
**Entwurf** — muss vor Produktivstellung finalisiert & von der/dem Verantwortlichen
freigegeben werden. Grundlage: `research/02` (verifiziert), `konzept/21`, der
gebaute Stack (`lib/ai-engine/`, `app/api/einladung`). Stand 2026-07-09.*

> **Warum Pflicht:** DSK-Muss-Liste, zwei Trigger — Nr. 11 (KI zur Interaktions-
> steuerung/Bewertung persönlicher Aspekte) und Nr. 9 (Persönlichkeitsprofile).
> Muss **vor** dem ersten echten Verarbeiten vorliegen.

---

## 1 · Beschreibung der Verarbeitung

- **Zweck:** aus den bereits lokal vorhandenen Selbstlern-Signalen EINE personalisierte,
  ressourcenorientierte *Einladung* formulieren (Bildung/Coaching für Gesunde — **keine**
  Diagnose/Heilkunde).
- **Datenkategorien:** Selbsttest-Baseline (4 Skalen 0–10), spätere Messung, kurzes
  „Anliegen", Loop-Signale (Spür-Stimmung, Glücksmomente, Anker), letzte Journal-Notizen,
  Liste abgeschlossener Module. **Abgeleitete psychische Muster = Gesundheitsdaten
  (Art. 9, EuGH C-252/21).**
- **Ablauf:** Client sammelt den Zustand (`sammleZustand`) → POST an `app/api/einladung`
  → serverseitiger Aufruf an Mistral (EU) → Safety-Filter → Einladung zurück.
  **Stateless: der Server speichert nichts.**
- **Empfänger / Auftragsverarbeiter:** Mistral AI (Frankreich, EU), DPA vorhanden,
  **kein Training auf Kundendaten**, EU-Hosting. **Kein Drittland-Transfer.**
- **Speicherdauer:** lokal beim Nutzer (localStorage), von ihm löschbar. Serverseitig
  keine. Bei Mistral: 30 Tage Missbrauchs-Monitoring im Standard → **vor Go-Live ZDR
  (Scale-Plan)**, dann keine.

## 2 · Notwendigkeit & Verhältnismäßigkeit

- **Rechtsgrundlage:** ausdrückliche, **pro Zweck entbündelte** Einwilligung (Art. 9
  Abs. 2 lit. a). Umgesetzt: separates Opt-in „LLM-Aufruf" (`getEngineConsent`),
  default AUS, jederzeit widerrufbar; **kein Bundle**.
- **Koppelungsverbot gewahrt:** die gesamte App (10 Module, Loop, Selbsttest) funktioniert
  **vollständig ohne** die Engine — reines Opt-in-Add-on.
- **Datenminimierung (Art. 5):** die Route reicht nur bekannte Felder in begrenzter
  Größe weiter (`bereinige`), nichts Beliebiges; keine Rohdaten-Historie.
- **Freiwilligkeit:** die Einladung wird zusätzlich nutzer-initiiert ausgelöst (kein
  automatischer Call), Engine standardmäßig aus (Privacy by Design/Default, Art. 25).

## 3 · Risiken für die Betroffenen

| Risiko | Beschreibung |
|--------|--------------|
| Fehlspiegelung / Nocebo | KI-Text könnte pathologisieren oder etwas als „krank machend" framen |
| Heilkunde-/Diagnose-Eindruck | Wortwahl könnte als Behandlung/Diagnose ankommen (§1 HeilprG, Eindruck) |
| Sykophantie | reflexhafte Bestätigung gefährlichen Verhaltens (dok. Schadensmechanismus, GPT-4o) |
| Krise unerkannt | akute Suizidalität ohne adäquate Reaktion (0/29 Chatbots bestehen C-SSRS) |
| Emotionale Abhängigkeit | Bindung an die App statt an reale Verbindung (AI-Act-rote-Linie) |
| Datenschutz | Übermittlung von Gesundheitsdaten an einen Dritten |

## 4 · Abhilfemaßnahmen (umgesetzt im Stack)

- **Krisen-Layer (Eingang):** Krisen-Muster → **festes Signposting auf „Hilfe", das
  Modell wird gar nicht erst aufgerufen** (`pruefeEingabe` + `KRISEN_EINLADUNG`).
- **Output-Filter:** Blocklist (Heilkunde/Diagnose), Nocebo-, Druck-, **Sykophantie-**
  und **Vermenschlichungs-/Abhängigkeits-**Erkennung, Längen-Check; ein Nachbesserungs-
  Versuch, sonst neutraler Fallback (`pruefeAusgabe`). Gegen ein Red-Team-Harness
  (`prototype/ai-engine/eval.mjs`, 18 Checks) abgesichert.
- **System-Prompt:** harte Grenzen (keine Diagnose/Heilung, nocebo-sicher, anti-
  sykophantisch, „du bist eine KI"), Lanas einladender Ton.
- **KI-Hinweis** (Art. 50) sichtbar an jeder Ausgabe (`KI_HINWEIS`).
- **EU-Inferenz + kein Training** (Mistral), **ZDR vor Go-Live**, **stateless Server**.
- **Entbündelte Einwilligung**, Widerruf, lokale Löschbarkeit, **Feature-Gate default AUS**.

## 5 · Bewertung / Restrisiko

Mit den Maßnahmen sinkt das Risiko in den vertretbaren Bereich; kritisch bleiben
**Krisen-Erkennung** (nur Keyword-basiert — Produktion sollte modellgestützt ergänzen)
und **Ton-Qualität** (Lana-Review des System-Prompts). Beides ist Teil des Go-Live-Gates.

## 6 · Vor Go-Live (offene Häkchen)

- ☐ DPIA finalisieren & von Verantwortlicher/m freigeben
- ☐ **ZDR/Scale-Plan** bei Mistral aktivieren
- ☐ **Lana-Ton-Review** des System-Prompts (`lib/ai-engine/system-prompt.ts`)
- ☐ Krisen-Erkennung um modellgestützten Check erweitern
- ☐ Consent- & KI-Hinweis-Texte von Lana/Fable gegengelesen
- ☐ `MISTRAL_API_KEY` in Vercel-Env (nur Server) · `NEXT_PUBLIC_ENGINE_ENABLED=true`
- ☐ Krisen-Layer produktiv end-to-end getestet
- ☐ Datenschutzerklärung um die Verarbeitung ergänzt
