# YipYip auf dem Chazon-VPS

Stand 06.09.2026: Image `yipyip:renewal-20260906-01` läuft auf dem VPS
31.97.178.99, intern unter 127.0.0.1:4180. Container gesund; Next 15.5.25,
Node 22, begrenzt auf 1 CPU / 640 MiB, schreibgeschützte Laufzeit.
Releasequelle: `/srv/yipyip/releases/renewal-20260906-01`.

`compose.yaml` verbindet ausschließlich den Anwendungscontainer mit dem
bestehenden Caddy-Netz. `YipYip.caddy` wurde an `/root/postiz/Caddyfile`
angefügt, geprüft und ohne Containerneustart geladen. Vorheriger Stand:
`/srv/yipyip/releases/renewal-20260906-01/Caddyfile.before-yipyip`.

**Öffentliche Domain live:** Der Nutzer hat den A-Eintrag am 06.09.2026
gesetzt. `https://yipyip.chazon.eu` liefert gültiges HTTPS und die neue App.
Die Browserprüfung wurde zusätzlich öffentlich bei 390 / 1440 px bestanden.

Prüfungen: Produktionsbuild und Typecheck bestanden, fünf Backup-/Rollbacktests
bestanden, echte Browserprüfung über SSH zum VPS bei 390 / 1440 px bestanden:
Export, Vorschau vor Import, Wiederherstellung, ungültige Sicherung abgewiesen,
Einwilligungen erhalten, keine Fremdanfragen, Home/Modul/Hilfe ohne Überbreite.
Der Test wartet nun auf die tatsächlich aus lokalem Speicher geladene Notiz,
bevor er mit den React-Schaltflächen interagiert; SSR allein ist noch keine
abgeschlossene Hydration. Keine Anwendungsänderung war dafür nötig.

Die bisherigen Vercel-Daten bleiben an deren Browser-Origin gebunden. Die
neue App kann Sicherungen importieren. Eine Export-Brücke auf der bisherigen
Vercel-Adresse ist noch nicht veröffentlicht (vorhandener API-Zugang HTTP 403).
Deshalb Hauptseitenlink noch nicht umgestellt und Vercel nicht abgeschaltet.
Keine bestehenden Nutzerstände als automatisch migriert bezeichnen.

Nach DNS: öffentlich TLS, Home, /mein-weg, /modul/willkommen, /manifest.webmanifest,
Audio-Range und Browserbedienung prüfen; Export-Brücke veröffentlichen oder
einen konkret geprüften Übertragungsweg bereitstellen, danach Modulverzeichnis
auf die neue Adresse umstellen. Keine Testnotizen in echte Konten übernehmen.
