# 22 · DPIA — AI-Engine Phase 1 (Alpha)

*Datenschutz-Folgenabschätzung (Art. 35 DSGVO) für die gebundene Einladungs-Schicht.
**Status: FINAL — freigegeben für die Alpha** (Freigabe s. §7). Grundlage:
`research/02` (verifiziert), `konzept/21`, der gebaute Stack (`lib/ai-engine/`,
`app/api/einladung`). Stand 2026-07-09.*

> **Alpha-Rahmen:** Die Engine wird für eine begrenzte Alpha aktiviert, damit Lana
> die fertige Version im Betrieb sieht; Ton-/Text-Anpassungen nach ihrem Feedback.
> Vor breiter öffentlicher Verfügbarkeit: die zwei Rest-Häkchen in §6 (öffentliche
> Datenschutzerklärung, Ton-Review eingearbeitet).

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
  keine. Bei Mistral: **ZDR (Scale-Plan) ist aktiviert** → keine Retention über die
  Antwort hinaus, kein 30-Tage-Missbrauchs-Fenster.

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

- **Krisen-Layer (Eingang), ZWEISTUFIG:** (1) deterministische Keyword-Erkennung
  (`pruefeEingabe`) → sofortiges **Signposting auf „Hilfe", ohne Modell**; (2)
  **modellgestützter Klassifikator** (`pruefeKriseModell`, Mistral Small, konservativ)
  fängt subtile Fälle, die Muster verpassen — beide Tore VOR jeder Einladung. Live
  verifiziert: subtiler Krisen-Text ohne Keyword-Treffer wird erkannt.
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

Mit den Maßnahmen sinkt das Risiko in den für eine Alpha vertretbaren Bereich. Die
**Krisen-Erkennung** ist jetzt zweistufig (Keyword + modellgestützt) und live geprüft.
Verbleibendes Restrisiko wird über den begrenzten Alpha-Rahmen und Lanas Betriebs-
Review (Ton) getragen; Anpassungen fließen laufend ein.

## 6 · Häkchen

**Für die Alpha erledigt:**
- ☑ DPIA finalisiert & freigegeben (§7)
- ☑ **ZDR/Scale-Plan** bei Mistral aktiviert
- ☑ Krisen-Erkennung um **modellgestützten** Check erweitert (live verifiziert)
- ☑ Krisen-Layer end-to-end getestet (Keyword + Modell, Prod-Server-Test)
- ☑ Consent entbündelt + KI-Hinweis (Art. 50) umgesetzt; Engine default AUS
- ☐ `MISTRAL_API_KEY` in Vercel-Env (nur Server) · `NEXT_PUBLIC_ENGINE_ENABLED=true`
  → die eine verbleibende Aktivierungs-Handlung (braucht Vercel-Zugang)

**Vor breiter öffentlicher Verfügbarkeit (nach der Alpha):**
- ☐ **Lana-Review** des Engine-Tons (`system-prompt.ts`) + Consent/KI-Hinweis-Texte
  in die App eingearbeitet
- ☐ Öffentliche **Datenschutzerklärung** um diese Verarbeitung ergänzt

## 7 · Freigabe

- **Verantwortlicher:** Dennis Korn (Betreiber YipYip).
- **Freigabe:** erteilt für die **Alpha** am 2026-07-09 auf Weisung des Verantwortlichen.
- **Umfang:** Aktivierung der AI-Engine (Phase 1, gebundene Einladung) mit den in §4
  beschriebenen Maßnahmen; ZDR aktiv; Krisen-Layer zweistufig.
- **Hinweis:** Die datenschutzrechtliche Verantwortung liegt beim Verantwortlichen.
  Diese DPIA ist eine fachliche Aufbereitung; für die öffentliche Breiten-Freigabe
  sind die zwei offenen Häkchen in §6 zu schließen.
