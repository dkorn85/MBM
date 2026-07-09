# 21 · AI-Engine — Phase-1-Entscheidungen (entscheidungsreif)

*Bringt die fünf offenen Entscheidungen aus `20_AI-Engine_Architektur.md` §6 in
entscheidungsreife Form: je Punkt die Optionen, die Empfehlung und was sie
festlegt. Grundlage: `research/02` (verifizierte Recht/Safety-Lage) + aktuelle
Anbieter-Recherche (Mistral, Stand 2026-07). Stand 2026-07-09.*

> **Neu seit Konzept 20:** Es liegt ein **Mistral-API-Key** vor
> (`Download/MBM/.mistral`, 32 Zeichen). Das entscheidet die Anbieterfrage
> faktisch — und zwar in die sauberste Richtung.

---

## Entscheidung 1 · LLM-Anbieter → **Mistral (EU)** ✅ faktisch gefallen

**Warum Mistral die rechtlich sauberste Wahl ist:** Mistral ist in Frankreich
ansässig, La Plateforme ist EU-gehostet, es besteht ein DPA, und Mistral
**trainiert nicht auf Kundendaten**. Damit gibt es **keinen Drittland-Transfer**
(Art. 44 ff. DSGVO) — die gesamte OpenAI-/DPF-/SCC-Frage aus `research/02`
**entfällt komplett**. Das ist der größte Vorteil gegenüber OpenAI EU-Residency
(die formal auch ginge, aber US-Anbieter bleibt US-Anbieter).

**Modelle & Preise (Stand 2026-07, pro 1 Mio. Token In/Out):**

| Modell | Preis In/Out | Einordnung für uns |
|--------|-------------|--------------------|
| Mistral **Large 3** (Dez 2025) | $0,50 / $1,50 | Beste Ton-/Nuancen-Qualität → für die *Einladung* (tonkritisch, Lanas Stimme) |
| Mistral **Medium 3** | $0,40 / $2,00 | Guter Kompromiss |
| Mistral **Small 3** | $0,10 / $0,30 | Günstig; evtl. für einfache Umformulierungen/Safety-Recheck |
| Batch | −50 % | irrelevant (wir sind interaktiv) |

**Kostengefühl:** Eine „nächste Einladung" ist ein kurzer Call (~1–2k Token in,
~200 out). Mit Large 3 sind das **Bruchteile eines Cents pro Interaktion** — Kosten
sind hier kein Entscheidungsfaktor, Ton-Qualität schon. **Empfehlung: Large 3** für
die Einladung; Small 3 optional als günstiger Safety-Nachprüf-Pass.

**Datenschutz-Feinheit (wichtig für Go-Live mit abgeleiteten Psyche-Daten):**
Standardmäßig behält Mistral In/Out **30 Tage** (Missbrauchs-Monitoring), EU-gehostet,
kein Training. **Zero Data Retention (ZDR)** eliminiert auch diese 30 Tage — ist aber
auf den **Scale-Plan** beschränkt und nur für stateless Calls (chat completions etc.).
→ Für Gesundheitsdaten-nahe Verarbeitung im echten Release **ZDR (Scale-Plan) wählen**;
Kosten dafür = Enterprise-Angebot (anzufragen). Für den **Dev-/Prototyp-Betrieb** (nur
synthetische Daten) reicht der Standard-Key vollauf.

> **Key-Handling:** Der Key gehört in `/root/MBM/MBM/.env` (dort gitignored,
> `MISTRAL_API_KEY=…`) und wird **nur serverseitig** (Vercel-Function) genutzt —
> nie im Client-Bundle. Niemals committen.

**→ Deine Entscheidung nötig:** Modell-Tier (Empfehlung Large 3) · ZDR/Scale-Plan
jetzt anfragen oder erst kurz vor Go-Live?

---

## Entscheidung 2 · Backend/Accounts-Schwelle → **so spät wie möglich**

**Schlüssel-Erkenntnis:** Phase 1 braucht **kein Backend und keine Accounts.** Der
Ablauf kann rein so laufen:

```
Lokaler State (localStorage) ──► Vercel-Function (hält Key, ruft Mistral EU, ZDR)
      └── kein Server-Speicher ─────────────────────► Einladung zurück in die App
```

Die Function ist **stateless** (nimmt State entgegen, gibt Einladung zurück, speichert
nichts). Damit bleibt „lokal-first" intakt: **keine Konten, keine Cloud-DB, kein
Sync** in Phase 1. Der `storage.ts`-Layer bleibt lokal.

- **Accounts/Supabase erst für Phase 2** nötig (geräteübergreifender Sync, Dialog-
  Historie, editierbares Memory über Sessions). Das ist die Schwelle, ab der eine
  Cloud-Consent-Ebene + Auftragsverarbeitung dazukommen.
- **Aber:** Der bloße LLM-Call sendet aus lokalem State **abgeleitete Muster** an
  Mistral → das ist eine Verarbeitung von Art.-9-nahen Daten und braucht **Consent +
  DPIA** (siehe E3), auch ohne DB. „Kein Backend" ≠ „kein Datenschutz".

**Empfehlung:** Phase 1 ohne Accounts/Backend (nur stateless Function). Accounts-
Frage vertagen bis Phase 2 konkret wird.

---

## Entscheidung 3 · Consent- & DPIA-Architektur → konkret, aus `research/02`

Abgeleitete psychische Muster **sind** Gesundheitsdaten (DSGVO Art. 9, EuGH C-252/21).
Pflicht ist die **explizite, pro Zweck entbündelte** Einwilligung + DPIA. Konkret:

**Entbündelte Opt-ins (getrennt an/abwählbar, nichts gebündelt):**
1. **Lokale Analyse** (on-device, kein Transfer) — minimal/евtl. gar kein Consent nötig,
   da keine Übermittlung; transparent machen genügt.
2. **LLM-Aufruf** (lokaler State → Mistral EU) — **das** ist der Consent für Phase 1:
   ein klares, separates Opt-in „Meine Eingaben/mein Zustand dürfen an eine KI (Mistral,
   EU) gesendet werden, um mir eine persönliche Einladung zu erzeugen."
3. **Cloud-Backend/Sync** (Phase 2) — eigener, späterer Opt-in.

**Für Phase 1 ist also genau EIN Opt-in nötig** (Nr. 2) — überschaubar.

**Pflicht-Beiwerk vor Go-Live** (alles aus `research/02` verifiziert):
- **DPIA** (DE zwingend: DSK-Trigger Nr. 9 Persönlichkeitsprofile + Nr. 11 KI-Interaktions-
  steuerung) — **vor** Produktivstellung; wir können einen Entwurf vorbereiten.
- **KI-Hinweis** (AI Act Art. 50, ab 02.08.2026): sichtbar „Du interagierst mit einer KI".
- **Koppelungsverbot**: Kernfunktion (der bestehende Weg, alle Module) funktioniert
  **vollständig ohne** die Engine — die Engine ist reines Opt-in-Add-on. (Ist heute schon so.)
- **Privacy by Design/Default** (Art. 25): Engine standardmäßig aus; Memory klein,
  einsehbar, löschbar.
- **Krisen-Layer produktiv** (Prototyp hat ihn schon: Krise geht gar nicht ans Modell).

**Empfehlung:** Ein sauberes Einzel-Opt-in (Nr. 2) + KI-Hinweis + DPIA-Entwurf. Kein
Bundle, Engine defaultmäßig aus.

---

## Entscheidung 4 · Ambition erste Ausbaustufe → **Phase 1 (gebundene Einladung)**

- **Phase 1 — gebundene Einladungs-Schicht:** an definierten Andockpunkten (nach dem
  Selbsttest · im „Weitergehen"/Loop · in „Mein Weg") erzeugt die Engine **eine**
  personalisierte, ressourcenorientierte Einladung statt einer generischen. Opt-in,
  überspringbar, kein freier Chat. **Safety-Last überschaubar, Nutzen sofort spürbar.**
- **Phase 2 — dialogischer Spiegel:** freier Text ↔ Engine. Höchste Safety-Last
  (Krise, Anti-Sykophantie, Anti-Abhängigkeit voll tragend) + Accounts/Backend.

**Empfehlung: klar Phase 1 zuerst.** Sie liefert den Kernwert („dein Weg statt ein Weg
für alle") bei minimaler rechtlicher/technischer Last — und ist der ehrliche Testboden
für Ton und Safety, bevor wir die volle Vision (Phase 2) angehen.

**→ Deine Entscheidung nötig:** Phase 1 zuerst (Empfehlung) — oder direkt Phase 2?

---

## Entscheidung 5 · Lanas Ton-Vorgabe (Engine-Seele) → **Lana-Aufgabe**

Der System-Prompt (`prototype/ai-engine/system-prompt.mjs`, „die Seele") prägt Ton und
Grenzen der Spiegelung. Das ist **Lanas** Feld — steht schon in `konzept/LANA-FRAGEN.md`
nicht drin und sollte ergänzt werden: *„Möchtest du den Ton der KI-Spiegelung mitprägen
(Einladung statt Anordnung, folgen statt führen, so tief wie tragbar)?"* Bis dahin bauen
wir gegen den vorhandenen, an ihren Prinzipien orientierten Prompt.

---

## Was daraus konkret baubar wird (sobald E1/E4 bestätigt sind)

Reihenfolge, alles **ohne Lana** außer dem Ton-Feinschliff:

1. **Serverseitige Route** (`app/api/einladung`): hält `MISTRAL_API_KEY`, ruft Mistral
   EU (Large 3), stateless, kein Speicher. Ersetzt `rufeModell` aus dem Prototyp.
2. **Safety-Layer nach `lib/ai-engine/`** portieren + **härten**: Anti-Sykophantie-Check,
   Erdungs-/Titrations-Prüfung, mehr Krisen-Muster, dazu ein **Eval-/Red-Team-Harness**
   (synthetische Personas, Guardrail-Asserts).
3. **Consent-Opt-in (Nr. 2) + KI-Hinweis**-UI (klein, klar, entbündelt).
4. **DPIA-Entwurf** (Dokument) — vor Go-Live.
5. **Andockpunkte** verdrahten (nach Selbsttest · Weitergehen/Loop · Mein Weg) — opt-in,
   überspringbar.
6. **Lana-Ton-Review** des System-Prompts, dann echte Vertonung/Feinschliff.

**Go-Live-Checkliste (Gate):** ☐ DPIA fertig · ☐ ZDR/Scale-Plan aktiv · ☐ KI-Hinweis
sichtbar · ☐ entbündelter Consent · ☐ Krisen-Layer produktiv getestet · ☐ Koppelungs-
verbot gewahrt (Kernfunktion ohne Engine nutzbar).

---

## Deine offenen Häkchen (der Rest ist empfohlen/geklärt)
1. **Modell-Tier:** Large 3 (Empfehlung) · Medium 3 · Small 3?
2. **ZDR/Scale-Plan:** jetzt anfragen oder erst vor Go-Live? (Dev-Prototyp braucht ihn nicht.)
3. **Ambition:** Phase 1 zuerst (Empfehlung) · direkt Phase 2?
4. **Reihenfolge jetzt:** Prototyp-Safety-Layer härten + Route bauen — oder zuerst
   DPIA/Consent-Gerüst?
