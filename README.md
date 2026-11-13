This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Digitaler Bilderrahmen (`/frame`)

`/frame` ist eine Vollbild-Slideshow für den Monitor mit Raspberry Pi (Chromium-Kiosk). Inhalte kommen aus dem Repo:

- Medien nach `public/frame/` legen, dann `npm run frame:resize` (verkleinert Bilder auf max. 1920×1080 und dreht sie nach EXIF).
- PDFs nach `public/frame/` legen, dann `npm run frame:pdf` (optional `-- datei.pdf [seite]`). Jede Seite wird als `<name>-<seite>.jpg` gerendert (Hochkant 1080×1920, Querformat 1920×1080); die fertigen `image`-Einträge für die Playlist werden ausgegeben. Danach nicht mehr `frame:resize` über diese Bilder laufen lassen, das würde Hochkantbilder auf 1080 px Höhe verkleinern.
- Playlist in `content/frame.json` pflegen. `duration` in Sekunden, sonst gilt `defaultDuration`.

| `type`  | Feld   | Verhalten |
|---------|--------|-----------|
| `image` | `src`  | Bild, eingepasst auf schwarzem Grund |
| `video` | `src`  | Stumm. Ohne `duration` bis zum Videoende, mit `duration` in Schleife bis Zeitablauf. MP4/H.264, max. 1080p |
| `page`  | `src`  | Eigene Route als iframe, z. B. `/` |
| `text`  | `text` | Großer Text, `\n` für Zeilenumbruch |
| `qr`    | `url`, `title`, `caption` | QR-Code zu `url` mit Überschrift und Untertitel, z. B. für Instagram |
| `program` | `days` (optional, Standard 28) | Programmübersicht der nächsten Tage aus Teamup, max. 14 Termine |
| `highlights` | `days` (optional, Standard 28) | Eine Seite pro Teamup-Event mit angehängtem Bild: Flyer oben, darunter Titel, Eckdaten und Eventtext (kurze Stichpunkte mehrspaltig). Passt der Text nicht, wird er gekürzt und ein QR-Code „Mehr Infos unter: quarterpipe.hamburg“ führt zum aufgeklappten Event auf der Startseite (`/#event-<id>`). Steht in den Notizen ein Anmelde- oder Ticketlink (Linktext mit „Anmeldung“, „Ticket“, „Vorverkauf“ …), folgt ein großer QR-Code dazu |

`/frame` läuft im Hochkantformat 9:16. Flyer werden immer vollständig gezeigt, Texte bei Bedarf verkleinert. Ist das Browserfenster quer (Monitor gedreht, Pi gibt Querformat aus), wird die Seite um 90° gegen den Uhrzeigersinn gedreht, `?rechts` dreht andersherum.

Querformat-Variante (Reserve): `/frame/querformat` zeigt dieselbe Playlist im 16:9-Layout.

Teamup-Daten werden alle 15 Minuten neu geholt. Die offene Kiosk-Seite lädt nach einem kompletten Durchlauf neu, wenn sie älter als 30 Minuten ist (nur wenn der Server erreichbar ist). Ist Teamup nicht erreichbar, fallen diese Slides einfach weg.

Nach `git push` und Vercel-Deploy lädt eine offene `/frame`-Seite innerhalb von ~1 Minute neu (`/api/frame-version` liefert den Commit-SHA). Lokal testen: `FRAME_VERSION=neu npm run dev` simuliert eine neue Version.

Kiosk-Start auf dem Pi:

```bash
chromium-browser --kiosk --noerrdialogs --disable-infobars --autoplay-policy=no-user-gesture-required https://quarterpipe.hamburg/frame
```

## Anmeldung & Einlass (`/anmeldung`, `/einlass`)

Kostenlose Anmeldung mit Platzkontingent, QR-Ticket und Einlass-Scanner im Handy-Browser.

- **Freischalten:** In Teamup in die Notizen des Events (strukturiertes Format mit `Titel:`) eine Zeile `Anmeldung: 80` schreiben – die Zahl ist das Kontingent. Auf der Startseite erscheint dann „Anmelden →“.
- **Ablauf:** Formular → eine Mail mit Link (Brevo) → auf `/ticket/<id>` bestätigen → dort stehen die QR-Codes. Plätze werden erst bei der Bestätigung belegt, unbestätigte Anmeldungen verfallen nach 24 h. Über denselben Link kann man absagen.
- **Einlass:** `/einlass` auf dem Handy öffnen, die 6-stellige PIN des Events eingeben (steht auf `/mitglieder`). Scanner, Code-Eingabe (`QP-7K3M`) und Gästeliste. Mehrere Geräte gleichzeitig gehen.
- **Löschen:** Vercel Cron löscht täglich alle Daten zu Events, die älter als 30 Tage sind (`/api/cron/tickets-cleanup`).

Env-Variablen:

| Variable | Zweck |
|---|---|
| `DATABASE_URL` | Neon Postgres (über den Vercel Marketplace, Region Frankfurt). Lokal leer lassen → eingebettetes Postgres in `.data/` |
| `TICKETS_SECRET` | Zufallswert, daraus werden Einlass-PINs und Einlass-Cookies abgeleitet. Ändern macht alle PINs neu |
| `CRON_SECRET` | Zufallswert, schützt den Aufräum-Cron |

Lokal testen ohne echten Mailversand: `MAIL_LOG=1 TICKETS_SECRET=test npm run dev` – Mails landen in der Konsole.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
