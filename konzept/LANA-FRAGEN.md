# Fragen an Lana — Protokoll

Stand: **2026-07-09, gemeinsam mit Lana durchgegangen.** Ihre Antworten sind unten
eingetragen. Was noch offen ist, steht unter „Offen".

Module **01–06** sind in Lanas überarbeiteter Fassung drin, vertont und live.

---

## 1. Module 07–10 — Textabnahme ✅ entschieden

| Nr | Modul | Station |
|----|-------|---------|
| 07 | Den Körper hören | Wahrnehmen |
| 08 | Gedanken entwirren | Wahrnehmen |
| 09 | Deine eigene Praxis | Weit werden |
| 10 | Rückblick & Weite | Weit werden |

**Lana:** überarbeitet 07–10 **voll, wie 01–06** — in ihren Worten.

**Daraus folgt eine feste Reihenfolge:** erst Lanas Text → dann das „Warum"-Bild →
dann die v3-Vertonung. Nichts davon vorziehen (sonst sprechen/zeichnen wir zweimal).

→ **Nächster Schritt (wir):** 07–10 im gleichen Format wie ihr 01–06-Paket liefern.

---

## 2. Bilder-Bibliothek ✅ teilweise entschieden

| Modul | Bild-Idee | Status |
|-------|-----------|--------|
| Willkommen | Gebrauchsanweisung / Handbuch | ✅ Lana ok |
| Wo du stehst | Vier Fenster | ✅ Lana ok |
| Dein innerer Alarm | Säbelzahntiger | ✅ von Lana |
| Energie ablassen | Reh, das sich schüttelt | ✅ Lana ok |
| Zur Ruhe kommen | Hafen | ✅ Lana ok |
| Kleine Inseln im Tag | Insel | ✅ Lana ok |
| Den Körper hören | Haus-Rundgang | ⏸ wartet auf ihren Text |
| Gedanken entwirren | Züge am Bahnsteig | ⏸ wartet auf ihren Text |
| Deine eigene Praxis | Gießkanne | ⏸ wartet auf ihren Text |
| Rückblick & Weite | Ringe / Weite | ⏸ wartet auf ihren Text |

**Lana:** „Bilder 1–6 haben mein Okay. Die Bilder 7–10 kenne ich noch nicht, dafür
muss ich erst die Texte lesen." — Das Bild folgt dem Text, nicht umgekehrt.

---

## 3. Gleichmut-Selbsttest (Horizont, Modul 10) ✅ entschieden

**Lana: gar kein Fragebogen.** Der Horizont bleibt eine offene Reflexion ohne Skala —
kein Messen, nur Spüren.

Damit ist die ES-16-/NAS-7-Frage **endgültig erledigt** (fehlende deutsche Validierung,
siehe `research/02`); auch CHIME/FFMQ-D werden **nicht** eingebaut.

→ **Nächster Schritt (wir):** die leeren ES-16-Container aus Modul 10 entfernen, statt
sie zu füllen.

---

## 4. Modul 2 — die „Absicht" ✅ entschieden

**Lana: festhalten und zurückspiegeln.** Modul 10 („Rückblick") bringt die eigene
Absicht sanft zurück („Damals hast du dir das vorgenommen …"). Bleibt lokal auf dem Gerät.

→ **Nächster Schritt (wir):** `absicht` persistieren (`storage.speicherePfad` kann das
bereits) und in Modul 10 spiegeln.

---

## 5. Sicherheits- und Rahmentexte ✅ entschieden

- **Onboarding-Disclaimer beim ersten Start: passt so.** Unverändert.
- **Krisen-Antwort der KI — Lana hat sie umformuliert** (umgesetzt, `safety.ts`):
  > „Das, was du gerade beschreibst, **verdient es gehört zu werden** — und das brauchst
  > du nicht allein zu tragen. Bitte hol dir jetzt echte Unterstützung: oben im Menü unter
  > „Hilfe" findest du sofort erreichbare Anlaufstellen, die für dich da sind. Du bist
  > damit nicht allein."

  Nicht abwiegeln („klingt nach mehr als einer Übung"), sondern zuwenden.

---

## 6. Weg & Umfang ✅ entschieden

- **Die zehn Module tragen.** Kein weiteres Thema fehlt; Weiteres kommt erst, wenn
  Menschen den Weg gegangen sind.
- Stations-Zuordnung 07–10: implizit mit der Textabnahme, wird mit ihrem Text final.

---

## 7. Die KI-Schicht — Ton und Texte 🔶 in Arbeit

Lana hat die echten Texte und echte Testantworten gelesen. Ihre Korrekturen sind
**alle umgesetzt** (`EngineDialog.tsx`, `dialog.ts`, `safety.ts`):

**a) Einwilligungs-Text** — „den Diagnose-Teil würde ich als eigenständigen Satz
formulieren. Sonst ist es okay. Trotzdem nochmal deutlich darauf hinweisen, was KI macht."
→ Umgesetzt: die KI-Aussage steht vorn („Was du schreibst, liest eine KI — kein Mensch"),
der Diagnose-Satz steht allein („Sie stellt keine Diagnose, sie behandelt nichts und sie
kennt dich nicht.").

**b) Pausen-Hinweis** — „‚Ich lauf dir nicht weg' kann weg. Und so nach 7 Nachrichten der
Hinweis. Der Fokus liegt ja auf den Modulen, nicht auf dem Chatbot. Am besten von
vornherein klar machen, dass es eine Begrenzung gibt."
→ Umgesetzt: Grenze 12 → **7**; der Kuschelsatz ist raus; die Begrenzung steht jetzt
schon im Opt-in und in der Einstiegszeile („Ein paar Nachrichten, dann geht es weiter
auf deinem Weg").

**c) Der Ton der Spiegelung** — „zu vertraut, zu nah", „zu behauptend", sie soll
„mehr fragen als feststellen".
→ Umgesetzt als harte Regel im Dialog-Prompt: nie behaupten, was die Person kennt,
fühlt oder erlebt; vorsichtige Angebote statt Feststellungen; eine offene Frage ist
mehr wert als ein Vorschlag; nicht jede Antwort braucht ein Modul.

**Ergebnis nach der Änderung** (live, dieselbe Person, derselbe Satz):
> *vorher:* „Du kennst diesen Moment genau: der Körper schwer wie Blei …"
> *jetzt:* „Klingt, als würde dein Kopf abends nochmal Gas geben, obwohl der Körper
> längst müde ist … Vielleicht magst du heute einfach nur beobachten: Wo im Körper
> spürst du diese Müdigkeit am deutlichsten?"

**Lanas Urteil dazu: „besser, aber noch nicht ganz."** → **offen**, siehe unten.

---

## Offen

1. **Der Ton der KI-Spiegelung** — Lana feilt weiter. Verdacht: die KI erfindet eigene
   Bilder („der Ärger kommt wie ein ungebetener Gast"), statt bei Lanas Bilder-Bibliothek
   zu bleiben; und/oder die Antwort macht drei Bewegungen, wo eine reichte.
2. **Module 07–10** — Lanas Textfassung (der große Block, blockiert Bilder + Vertonung).
3. **Bilder 7–10** — nach ihrem Text.
4. **Stations-Zuordnung 07–10** — final mit ihrem Text.

## Was wir parallel ohne sie erledigen
Performance, Barrierefreiheit, Offline, Code-Hygiene; die ES-16-Container ausbauen;
die Absicht persistieren. Technik, kein Inhalt.
