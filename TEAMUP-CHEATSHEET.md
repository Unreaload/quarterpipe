# TeamUp Cheat Sheet — quarterpipe.hamburg

Anleitung zum Anlegen und Pflegen von Events im TeamUp-Kalender,
damit sie korrekt auf der Website erscheinen (oder bewusst nicht).

---

## Wie die Website Events anzeigt

- Zeitraum: **7 Tage zurück** bis **30 Tage voraus**
- Aktualisierung: **stündlich** (Cache von 1 Stunde)
- Vergangene Events werden ausgegraut dargestellt
- Events mit Startzeit zeigen Datum + Uhrzeit
- Ganztagesevents zeigen nur das Datum

---

## Event SOLL auf der Website erscheinen

### Pflichtfelder

| Feld          | Was eintragen                              | Beispiel                          |
|---------------|--------------------------------------------|-----------------------------------|
| **Titel**     | Aussagekräftiger Name                      | `Konzert: Valborg & ABEST`       |
| **Startzeit** | Datum + Uhrzeit (kein Ganztagesevent!)     | `23.05.2026, 20:00`              |

### Empfohlene Felder

| Feld           | Was eintragen                                          | Anzeige auf der Website              |
|----------------|--------------------------------------------------------|--------------------------------------|
| **Location**   | Kurze Zusatzinfo (Untertitel)                          | Wird als Subtitel neben Datum gezeigt |
| **Notes**      | Beschreibungstext (wird beim Aufklappen angezeigt)     | Plaintext, HTML-Tags werden entfernt |
| **Anhang**     | Eventbild (jpg, png, webp)                             | Wird beim Aufklappen des Events gezeigt |

### Bild hinzufuegen

1. Event oeffnen -> **Anhang hinzufuegen**
2. Bilddatei hochladen (jpg, png, webp, gif, avif oder svg)
3. Das **erste** Bild wird auf der Website angezeigt
4. Weitere Anhaenge (PDFs etc.) werden ignoriert

> **Wichtig:** Bilder als **Anhang** hochladen, nicht in die Kommentare posten!

### Beispiel fuer ein vollstaendiges Event

```
Titel:      Konzert: Speedway
Start:      28.05.2026, 20:00
Ende:       28.05.2026, 23:00
Location:   Hardcore Punk aus Hamburg
Notes:      Support: TBA. Einlass ab 19:30, Beginn 20:00.
            VVK 12 EUR / AK 15 EUR
Anhang:     speedway-flyer.jpg
```

---

## Event soll NICHT auf der Website erscheinen

Es gibt zwei Wege, ein Event von der Website auszuschliessen:

### Weg 1: Veranstalter*in auf "geschlossen" setzen

Events werden **automatisch ausgeblendet**, wenn das Custom-Feld
**Veranstalter*in** einen Wert mit `geschlossen` enthaelt:

- `extern_geschlossen` — externe geschlossene Veranstaltung (z.B. Geburtstage)
- `amigo_geschlossen` — interne geschlossene Veranstaltung

**Beispiele:**

```
18. Geb Clara       | Veranstalter*in: extern_geschlossen  -> versteckt
Seminar Cathy       | Veranstalter*in: extern_geschlossen  -> versteckt
alternativ zu ...   | Veranstalter*in: amigo_geschlossen   -> versteckt
Konzert: Speedway   | Veranstalter*in: extern              -> sichtbar
QP open             | Veranstalter*in: amigo_               -> sichtbar
```

### Weg 2: Filterwoerter im Titel verwenden

Events werden zusaetzlich ausgeblendet, wenn Titel oder Location
eines dieser Woerter enthalten (Gross-/Kleinschreibung egal):

- `Vorlage Veranstaltung`
- `Anfrage`

**Beispiele:**

```
Anfrage Geburtstagsfeier Max        -> versteckt (enthaelt "Anfrage")
VORLAGE VERANSTALTUNG               -> versteckt (enthaelt "Vorlage Veranstaltung")
Raumanfrage Workshop XY             -> versteckt (enthaelt "anfrage")
```

---

## Ganztagesevents — Achtung

- Ganztagesevents funktionieren, zeigen aber **keine Uhrzeit** an
- Fuer Events mit Einlasszeit: **kein Ganztagesevent** verwenden,
  sondern konkrete Start-/Endzeit setzen
- Ganztagesevents eignen sich fuer mehrtaegige Festivals, Aktionstage etc.

---

## Felder die NICHT auf der Website angezeigt werden

| Feld                  | Wird ignoriert |
|-----------------------|----------------|
| Kommentare            | Ja — nur Anhang-Bilder werden genutzt |
| Custom Field: Veranstalter*in | Ja |
| Wer (who)             | Ja |
| Wiederholungsregeln   | Einzelne Instanzen werden normal angezeigt |

---

## Schnellreferenz

```
+------------------------------------------------------+
|  SICHTBAR auf Website:                               |
|  - Titel ohne Filterwoerter                          |
|  - Startzeit setzen (kein Ganztagesevent)             |
|  - Location = Untertitel                             |
|  - Notes = Beschreibung (aufklappbar)                |
|  - Anhang = Eventbild (erstes Bild zaehlt)           |
+------------------------------------------------------+
|  VERSTECKT auf Website:                              |
|  - Veranstalter*in enthaelt "geschlossen"            |
|    (extern_geschlossen oder amigo_geschlossen)       |
|  - "Anfrage" im Titel oder Location                  |
|  - "Vorlage Veranstaltung" im Titel oder Location    |
+------------------------------------------------------+
```
