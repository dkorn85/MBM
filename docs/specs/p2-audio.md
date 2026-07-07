# Spec P2 — Audio-Pipeline (`scripts/generate-audio.mjs`)

*Autor: Fable. Umsetzung: builder. Gleiche Regeln wie in p0-p1.md.*

## Ziel

Ein Node-Skript (ESM, keine Dependencies außer Node 20 Built-ins), das aus einem Modul-JSON die vorlesbaren Schritte als MP3s produziert (ElevenLabs) und nach `public/audio/<modulId>/` schreibt — Dateinamen exakt wie im `audio`-Feld des Moduls.

## CLI

```
node scripts/generate-audio.mjs <modulId> [--dry-run] [--schritt <typ>]
```

- `<modulId>`: lädt `content/modules/<modulId>.json`.
- `--dry-run`: keine API-Calls; gibt pro Audio-Datei die aufbereiteten Chunks (Text + Pausen + previous/next-Kontext) auf stdout aus.
- `--schritt <typ>`: nur diesen Schritt produzieren (z.B. `erleben`), für Nachbesserungen.

## Konfiguration

- `.env` im Repo-Root selbst einlesen (kein dotenv-Paket; simples Zeilen-Parsing): `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`. Fehlt eins → klare Fehlermeldung, Exit 1. **Key niemals loggen.**
- Endpoint: `POST https://api.elevenlabs.io/v1/text-to-speech/{voiceId}` mit `model_id: "eleven_multilingual_v2"`, `output_format: "mp3_44100_128"`.
- `voice_settings`: `{ stability: 0.55, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true }` (ruhiges, warmes Sprechen).

## Text-Aufbereitung

1. Für jeden Schritt mit `audio`-Feld: `bloecke[].text` verwenden.
2. Formatierungs-Marker entfernen: `**` und `*` (nur die Auszeichnung, Text bleibt).
3. Pausen-Marker in SSML-Breaks wandeln:
   - `[kurze Pause]` → `<break time="0.6s" />`
   - `[Pause]` → `<break time="1.2s" />`
   - `[längere Pause]` → `<break time="2.5s" />`
4. Zwischen zwei Blöcken (Absatzgrenze), wenn dort kein Marker steht: `<break time="1.0s" />` einfügen.
5. `\n\n` innerhalb eines Textes wie eine Absatzgrenze behandeln.

## Chunking (nur für lange Skripte, praktisch: der `erleben`-Schritt)

- Ein Chunk = Text bis zur nächsten `[längere Pause]`-Grenze (die Pause schließt den Chunk ab). Kürzere Schritte = 1 Chunk.
- Jeder Chunk-Request bekommt `previous_text` (kompletter bereinigter Text davor) und `next_text` (Text danach) für Stimmkontinuität. Zusätzlich `previous_request_ids` der bereits generierten Chunks mitsenden (max. die letzten 3), Response-Header `request-id` dafür einsammeln.
- Chunks eines Schritts zu **einer** MP3 zusammenfügen: einfache Byte-Konkatenation der MP3-Streams ist bei identischem Format zulässig; sauberer ist, die `<break>`-Pause am Chunk-Ende von ElevenLabs rendern zu lassen (Marker gehört zum Chunk) — so entsteht keine hörbare Naht. Kein ffmpeg als Pflicht; wenn ffmpeg im PATH ist, optional damit re-muxen (`ffmpeg -i concat -c copy`), sonst Konkatenation.
- Rate-Limit-Handling: HTTP 429 → 5 s warten, bis zu 3 Retries. Andere Fehler: Abbruch mit Statuscode + Response-Body (ohne Key).

## Output & Verhalten

- Zielpfad aus dem Modul-JSON (`/audio/s1/01-funke.mp3` → `public/audio/s1/01-funke.mp3`). Ordner anlegen.
- Existiert die Datei schon: überspringen, außer `--force`.
- Am Ende Tabelle: Datei, Chunks, Dauer (aus MP3 geschätzt oder `–`), Bytes.
- MP3s werden committet (`feat(p2): s1 audio`), das Skript separat (`feat(p2): audio-pipeline`).

## Verifikation

1. `--dry-run` für `s1`: 5 Dateien geplant (01, 02, 03, 04, 06 — Schritt `experiment` hat kein Audio), Chunk-Grenzen des `erleben`-Schritts liegen an den drei `[längere Pause]`-Stellen (4 Chunks).
2. Echt-Lauf `s1`: 5 MP3s in `public/audio/s1/`, jede > 100 kB, `erleben` deutlich am längsten (~5–7 min).
3. Im Dev-Server: `/modul/s1` spielt jeden Schritt ab; kein „Audio folgt"-Fallback mehr.
