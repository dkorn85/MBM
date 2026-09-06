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

Die bisherigen Vercel-Daten bleiben an deren Browser-Origin gebunden.
Die Export-Brücke ist inzwischen über den Git-Deploy von `dkorn85/MBM`
veröffentlicht (Commit `a659c8e`). Obwohl der vorhandene Vercel-API-Zugang HTTP
403 meldet, hat der bestehende Git-Deploy funktioniert. Die alte Adresse liefert
nun ebenfalls „Deinen Weg mitnehmen“. Browserprüfung bei 390 / 1440 bestanden.
Eine tatsächlich dort heruntergeladene synthetische Sicherung wurde zusätzlich
auf https://yipyip.chazon.eu importiert und inhaltlich geprüft.

Umzug für vorhandene Nutzer: unter der alten Adresse `/mein-weg` die Sicherung
speichern, auf der neuen Adresse unter `/mein-weg` die Datei öffnen, Vorschau
prüfen und übernehmen. Vercel bleibt hierfür erreichbar; kein Datenbestand
wird automatisch gelöscht oder als bereits übertragen ausgegeben.

Das Chazon-Modulverzeichnis wird auf die neue Adresse umgestellt. Die VPS-App
läuft unabhängig von Vercel. Rollback: vorherige getestete Imagekennung mit
Compose starten; beim Entfernen des Proxy-Eintrags die anderen Caddy-Domains
bewahren. Keine Datenspeicherung auf dem YipYip-Server; Inhalte liegen weiterhin
im Browser des Nutzers, Einwilligungen werden nicht mitkopiert.
