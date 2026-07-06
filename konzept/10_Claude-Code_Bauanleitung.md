# 10 · Mit Claude Code direkt bauen — Startpaket

So kommt ihr von der Struktur zu einem lauffähigen ersten Modul. Ihr habt Supabase als Connector — das nutzen wir als Backend.

---

## Empfohlener Stack (niedrigschwellig, zu eurem Setup passend)

- **Frontend:** React Native mit Expo (ein Codebase → iOS + Android + Web). Audio-Wiedergabe, Offline-Fähigkeit und Push-Erinnerungen sind out of the box dabei.
- **Backend:** Supabase (habt ihr schon) — Postgres für Module/Fortschritt/Spür-Checks, Storage für Audio-Dateien, Auth für Login.
- **Audio:** eure bestehende ElevenLabs-Pipeline erzeugt die Skripte → als Dateien in Supabase Storage.

Alternative, falls erstmal nur Web/Prototyp: Next.js statt Expo. Für ein echtes App-Gefühl mit Audio und Erinnerungen ist Expo aber der direktere Weg.

---

## Datenbank-Schema (Supabase / Postgres)

Das bildet die Modul-Blaupause und den Fortschritt ab. In Claude Code als Migration anlegen lassen.

```sql
-- Module (Inhalt, redaktionell gepflegt)
create table modules (
  id text primary key,              -- z.B. 'core-01-innerer-alarm'
  ebene text not null,              -- 'kernpfad' | 'themenwelt' | 'integration'
  woche int,
  position int,
  titel text not null,
  kernidee text,
  bild_id text,                     -- Verweis Bilder-Bibliothek
  dauer_min int,
  audio_dauer_min int,
  safety_flag text default 'niedrig',
  voraussetzung text,               -- id des Voraussetzungs-Moduls/-Events
  folgemodul text,
  bewegung text,                    -- '1-ankommen' | '2-wahrnehmen' | '3-begegnen' | '4-weit-werden'
  guardrails jsonb,                 -- Leitplanken pro Modul (siehe Doku 00): nocebo-sicher, keine Kausalität, Titration, Erdung
  schritte jsonb not null,          -- die 6 Schritte als JSON (siehe seed/modul-01.json)
  veroeffentlicht boolean default false
);

-- Bilder-Bibliothek (Lanas Metaphern)
create table images (
  id text primary key,              -- 'alarmanlage'
  thema text,                       -- 'stress'
  titel text,
  schichten jsonb                   -- die aufeinander aufbauenden Karten
);

-- Nutzerfortschritt
create table user_progress (
  user_id uuid references auth.users not null,
  module_id text references modules not null,
  status text default 'offen',      -- 'offen' | 'begonnen' | 'abgeschlossen'
  begonnen_at timestamptz,
  abgeschlossen_at timestamptz,
  primary key (user_id, module_id)
);

-- Spür-Checks (Retention-Motor + Vorher/Nachher)
create table spuer_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  module_id text references modules,
  zeitpunkt text,                   -- 'vor' | 'nach' | 'taeglich'
  koerper int,                      -- 1..6
  stimmung int,                     -- 1..6
  created_at timestamptz default now()
);

-- Experimente / Alltags-Anker
create table experimente (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  module_id text references modules,
  anker text,                       -- 'vor dem ersten Kaffee'
  erinnerung_aktiv boolean default false,
  aktiv boolean default true,
  created_at timestamptz default now()
);

-- Glücksmomente (Bohnen-Feature)
create table gluecksmomente (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  text text,
  created_at timestamptz default now()
);

-- Nordstern-Messung: validierte Skalen (alle 2-4 Wochen)
-- ES-16 (Gleichmut, nur Gesamtscore) · NAS-7 (Nicht-Anhaftung)
-- WICHTIG: deutsche Validierung offen -> in der App ehrlich kennzeichnen.
-- YSQ (Schemata) NICHT ohne geklärte Lizenz einbauen (siehe Doku 00, Lücken).
create table skalen_messungen (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  skala text not null,              -- 'ES-16' | 'NAS-7'
  gesamtscore numeric,              -- nur Gesamtscore, keine Subskalen
  rohwerte jsonb,
  created_at timestamptz default now()
);
alter table skalen_messungen enable row level security;
create policy "own_skalen" on skalen_messungen
  for all using (auth.uid() = user_id);

-- Row Level Security: jede/r sieht nur die eigenen Daten
alter table user_progress enable row level security;
alter table spuer_checks enable row level security;
alter table experimente enable row level security;
alter table gluecksmomente enable row level security;

create policy "own_progress" on user_progress
  for all using (auth.uid() = user_id);
create policy "own_checks" on spuer_checks
  for all using (auth.uid() = user_id);
create policy "own_experimente" on experimente
  for all using (auth.uid() = user_id);
create policy "own_momente" on gluecksmomente
  for all using (auth.uid() = user_id);
```

Der Inhalt eines Moduls (die 6 Schritte) liegt bewusst als `jsonb` — so bleibt die Redaktion flexibel, ohne bei jedem neuen Modul das Schema zu ändern. `seed/modul-01.json` ist genau dieses Objekt und lässt sich direkt als Seed einspielen.

---

## In Claude Code — Schritt für Schritt

**1. Repo klonen.** Claude Code liest den `konzept/`-Ordner (00 Architektur, 01 Struktur, 02 Blaupause, diese Bauanleitung, seed/modul-01.json) und `research/01` als Kontext.

**2. Erster Prompt (Gerüst):**
> „Lies konzept/00, konzept/01 und konzept/02. Erstelle ein Expo-React-Native-Projekt mit Supabase-Anbindung. Lege die Migration aus konzept/10 an. Baue einen Modul-Player, der die 6 Schritte aus einem `schritte`-jsonb rendert: Funke (Text+Button), Warum (wischbare Karten), Erleben (Audio-Player + Nachspür-Screen mit verzögertem Weiter), Experiment (Anker-Auswahl), Spür-Check (2 Slider), Weitergehen. Nutze seed/modul-01.json als Testdaten."

**3. Zweiter Prompt (Audio + Nachspüren):**
> „Der Erleben-Schritt braucht: Audio-Wiedergabe aus Supabase Storage, danach 15 Sekunden Stille bevor der Weiter-Pfeil erscheint, dann die offene Frage mit den drei Chips. Bei ‚unruhiger' zeige die Erdungsvariante."

**4. Dritter Prompt (Loop):**
> „Baue den täglichen Loop als eigenen Screen: Spür-Check (Körper/Stimmung), ein Glücksmoment-Eingabefeld das eine Bohne ins Glas legt, und die Anzeige des aktiven Alltags-Ankers. Speichere alles in Supabase."

**5. Seed einspielen:** `seed/modul-01.json` als erste Zeile in `modules`, plus den `alarmanlage`-Eintrag in `images`.

---

## Wichtig für die Umsetzung

- **Nachspür-Verzögerung ist Feature, kein Bug.** Der Weiter-Button darf erst nach ~15 Sek. erscheinen. Bitte nicht „wegoptimieren".
- **Keine Streaks, keine roten Badges.** Erinnerungen sind sanft und abschaltbar.
- **Nocebo-sichere Spiegelung** in jeder AI-Antwort (siehe Doku 00, Leitplanke 3): ressourcenorientiert, nie defizit-kausal.
- **Safety-Screen jederzeit erreichbar** (Krisen-Hinweis im Menü), besonders vor tiefen Übungen späterer Module.
- **Der Modul-Player ist generisch.** Ist er einmal gebaut, kostet jedes weitere Modul nur noch ein neues JSON — genau das ist der Sinn der Blaupause.

---

## Vor öffentlichem Release zwingend (siehe Doku 00)

- Studie 02: Recht & AI-Architektur (DACH, EU AI Act, DiGA, DSGVO Art. 9)
- YSQ-Lizenzlage klären, falls Schema-Erfassung genutzt wird
- deutsche Validierung von ES-16 / NAS-7 prüfen, sonst ehrlich kennzeichnen

---

## Nächste sinnvolle Schritte

1. Modul-Player mit Modul 1 lauffähig bekommen (obige Prompts).
2. Modul 2 als JSON schreiben — geht schnell, sobald der Player steht.
3. Onboarding-Flow bauen (das digitale Erstgespräch).
4. ElevenLabs-Audio für Modul 1 produzieren und einhängen.
