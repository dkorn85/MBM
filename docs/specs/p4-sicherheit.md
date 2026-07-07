# Spec P4 — Sicherheits-Layer: Onboarding-Disclaimer

*Autor: Fable. Umsetzung: builder. Alle Texte wörtlich. Die `/hilfe`-Seite und der Footer sind seit P0 final — P4 ergänzt den Erststart-Disclaimer.*

## Onboarding-Disclaimer (einmalig beim ersten Start)

Zugängliches modales Dialog-Overlay (role="dialog", `aria-modal`, Fokus ins Dialog, Esc schließt nicht — Schließen nur über den Button; Hintergrund `grund` mit leichter Abdunklung, Dialog als Karte). Wird auf jeder Route gezeigt, solange `storage.istDisclaimerGesehen()` false ist; der Button setzt das Flag.

**Titel:** `Bevor du beginnst`

**Text (drei Absätze):**

> Schön, dass du hier bist. Zwei Dinge sind uns wichtig:
>
> Dieses Programm ist ein **Bildungsangebot**. Es hilft dir zu verstehen, wie dein Körper-Geist-System funktioniert — aber es ersetzt keine medizinische oder psychotherapeutische Behandlung und stellt keine Diagnosen.
>
> Und: **Du bestimmst.** Alles hier ist ein Angebot. Du kannst jede Übung jederzeit unterbrechen, jeden Schritt überspringen und in deinem eigenen Tempo gehen. Wenn es dir gerade sehr schlecht geht, findest du unter „Hilfe in Krisen" Anlaufstellen, die für dich da sind.

**Aktionen:** primärer Button `Verstanden`, daneben dezenter Link `Hilfe in Krisen ansehen` → `/hilfe` (setzt das Flag ebenfalls, damit die Seite erreichbar ist und der Dialog nicht erneut blockiert).

Rendering-Hinweis: `**…**` wie überall über den Bloecke-Parser (oder gleichwertig) als `<strong>`.

## Verifikation

1. Frisches Profil: Dialog erscheint vor allem anderen, ist per Tastatur bedienbar, Screenreader-tauglich (Titel als `aria-labelledby`).
2. Nach `Verstanden`: nie wieder, auch nach Reload.
3. `Hilfe in Krisen ansehen` führt zu `/hilfe`.
4. `npm run build` + `lint` grün.
