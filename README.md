# Isoplan Card

Lovelace-Karte für Home Assistant, die ein isometrisches Grundrissbild zum Leben erweckt. Statt Badges zu stapeln, zeigt sie Licht dort, wo es hingehört: im Raum.

- **Eine Plakette pro Raum** mit Name und Temperatur. Überlappen sich Plaketten, schiebt die Karte sie automatisch auseinander.
- **Echter Lichtverlauf:** Jede platzierte Lampe gießt ihr Licht in ihrer echten Farbe und Helligkeit in den Raum, begrenzt durch die Raumform.
- **Tag und Nacht** nach Sonnenstand. Nachts tragen die eingeschalteten Räume die Szene.
- **Klima-Ansicht** mit Temperatur-Tönung von kühl bis warm.
- **Zoom und Detail-Panel:** Ein Tipp auf den Raum fährt hinein und zeigt Licht, Helligkeit und Thermostat.
- **Lampen direkt schalten:** Im gezoomten Raum schaltet ein Tipp die Lampe, langes Drücken öffnet die Details.
- **Geräte an Steckdosen:** Schalter und Verbrauch im Plan und im Panel, heikle Geräte schalten erst nach einem zweiten Tipp aus.
- **Visueller Editor:** Lampen und Geräte auf den Plan setzen und per Drag & Drop verschieben.

Warum keine bestehende Karte? `ha-floorplan` braucht ein SVG mit benannten Elementen, `floor3d` ein 3D-Modell, und `glowfloor-card` kennt nur Lichtpunkte ohne Räume und Temperaturen. Für ein fertig gerendertes Bild mit Raumformen, Lampen und Klima gab es nichts Passendes.

## Installation über HACS

1. HACS öffnen, oben rechts das Menü wählen und **Benutzerdefinierte Repositories** öffnen.
2. Die GitHub-Adresse dieses Repositorys eintragen und als Typ **Dashboard** wählen.
3. **Isoplan Card** herunterladen und die Seite neu laden.
4. Die fiktive Grafik [beispiel.svg](examples/beispiel.svg) nach `/config/www/isoplan/beispiel.svg` kopieren. Für einen eigenen Grundriss passe in der Konfiguration das Bild, die Raumkoordinaten und die Entitäten an.
5. Im Dashboard eine manuelle Karte anlegen und [`examples/beispiel.yaml`](examples/beispiel.yaml) einfügen, oder die Karte **Isoplan Card** aus der Liste wählen.

Am besten wirkt die Karte in einer Ansicht vom Typ **Panel (1 Karte)**.

### Manuell

`dist/isoplan-card.js` nach `/config/www/` kopieren und unter **Einstellungen → Dashboards → Ressourcen** als JavaScript-Modul `/local/isoplan-card.js` eintragen.

## Lampen platzieren

1. Karte im Dashboard bearbeiten. Der Editor zeigt den Plan mit allen Lampen.
2. Lampe und Leuchtentyp wählen, **Auf Plan setzen** drücken und in den Raum klicken.
3. Lampen ziehen, um sie genau zu setzen, oder mit den Pfeiltasten verschieben. Landet eine Lampe in einem anderen Raum, wechselt sie dorthin.
4. Unter der gewählten Lampe lassen sich Typ, Lichtradius, Drehung und ein eigenes Produktbild einstellen.

Die mitgelieferten Symbole sind eigene Zeichnungen in der Form der Hue-Leuchten (Spot, Lightstrip, Play, Play gradient tube, Kerze, Lampe). Für ein echtes Produktbild legst du ein freigestelltes PNG unter `/config/www/isoplan/` ab und trägst den Pfad bei der Lampe ein. Produktfotos der Hersteller gehören nicht in dieses Repository, weil sie urheberrechtlich geschützt sind.

## Konfiguration

| Option | Pflicht | Bedeutung |
|---|---|---|
| `image` | ja | Pfad zum Grundriss. |
| `image_night` | nein | Eigenes Nachtbild. Ohne Angabe dunkelt die Karte `image` selbst ab. |
| `coordinates` | nein | Bildmaße für alle Koordinaten, Standard `[1536, 1024]`. Eine schärfere Fassung mit gleichem Seitenverhältnis braucht nur einen neuen `image`-Pfad. |
| `night` | nein | `auto` nach Sonnenstand (Standard), `on` oder `off`. |
| `sun_entity` | nein | Standard `sun.sun`. |
| `default_mode` | nein | `licht` (Standard) oder `klima`. |
| `temperature_range` | nein | Skala der Klima-Ansicht, Standard `[16, 24]`. |
| `all_lights` | nein | Lichtgruppe für die Schaltfläche *Alle aus*. |
| `extras` | nein | Weitere Schaltflächen, etwa für den Balkon: `entity`, `name`, `icon`. |
| `rooms` | ja | Liste der Räume. |

**Raum:** `id`, `name`, `area` (Raumform als Punktliste), `label` (Position der Plakette), optional `temperature`, `climate`, `lights` (Gruppen im Panel), `fixtures` und `devices`.

**Lampe (`fixtures`):** `entity`, `type` (`spot`, `strip`, `play`, `tube`, `candle`, `bulb`), `x`, `y`, optional `name`, `image`, `reach`, `angle`.

**Gerät (`devices`):** `entity`, optional `name`, `icon`, `power` (Verbrauchssensor), `confirm` (Ausschalten erst nach zweitem Tipp), `x`, `y`. Ohne `x` und `y` erscheint das Gerät nur im Panel.

Platzierte Lampen haben Vorrang vor Gruppen. Eine Hue-Gruppe meldet weiter „an“, auch wenn alle ihre Lampen am Wandschalter stromlos sind. Die Karte liest deshalb die Mitglieder der Gruppe aus ihrem Attribut `entity_id`, zeigt den tatsächlichen Zustand und nennt die nicht erreichbaren Lampen im Panel.

## Entwicklung

```bash
npm install
```

```bash
npm test
```

```bash
npm run build
```

```bash
npm run dev
```

Die Demo unter `http://localhost:5199` verwendet einen fiktiven Grundriss und simulierte Home-Assistant-Entitäten.

## Lizenz

MIT
