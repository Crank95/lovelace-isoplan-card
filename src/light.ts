import type { FixtureConfig, RoomConfig } from "./config";
import { isUnreachable, type Hass, type HassEntity } from "./hass";

export type Rgb = readonly [number, number, number];

export interface LightReading {
  readonly on: boolean;
  readonly unreachable: boolean;
  /** 0–1, wahrnehmungsnah angehoben, damit stark gedimmtes Licht sichtbar bleibt. */
  readonly intensity: number;
  readonly color: Rgb;
}

export interface FixtureReading extends LightReading {
  readonly fixture: FixtureConfig;
  readonly reach: number;
}

export interface RoomLight {
  readonly on: boolean;
  readonly level: number;
  readonly color: Rgb;
  readonly fixtures: readonly FixtureReading[];
  readonly unreachableCount: number;
}

const WARM_WHITE: Rgb = [255, 196, 137];
const INTENSITY_GAMMA = 0.6;
const MAX_BRIGHTNESS = 255;
const MIN_INTENSITY = 0.12;

const DEFAULT_REACH: Readonly<Record<FixtureConfig["type"], number>> = {
  spot: 190,
  strip: 170,
  play: 140,
  tube: 170,
  candle: 130,
  bulb: 170,
};

/** Näherung nach Tanner Helland, für Lampen ohne rgb_color. */
export function kelvinToRgb(kelvin: number): Rgb {
  const t = kelvin / 100;
  const red = t <= 66 ? 255 : 329.7 * (t - 60) ** -0.1332;
  const green = t <= 66 ? 99.47 * Math.log(t) - 161.12 : 288.12 * (t - 60) ** -0.0755;
  const blue = t >= 66 ? 255 : t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04;
  const clamp = (v: number) => Math.round(Math.min(255, Math.max(0, v)));
  return [clamp(red), clamp(green), clamp(blue)];
}

function colorOf(entity: HassEntity): Rgb {
  const { rgb_color: rgb, color_temp_kelvin: kelvin } = entity.attributes;
  if (Array.isArray(rgb) && rgb.length === 3) return rgb as unknown as Rgb;
  return typeof kelvin === "number" && kelvin > 0 ? kelvinToRgb(kelvin) : WARM_WHITE;
}

function intensityOf(entity: HassEntity): number {
  const brightness = entity.attributes.brightness;
  if (typeof brightness !== "number") return 1;
  return Math.max(MIN_INTENSITY, (brightness / MAX_BRIGHTNESS) ** INTENSITY_GAMMA);
}

export function readLight(entity: HassEntity | undefined): LightReading {
  if (isUnreachable(entity)) return { on: false, unreachable: true, intensity: 0, color: WARM_WHITE };
  const on = entity!.state === "on";
  return { on, unreachable: false, intensity: on ? intensityOf(entity!) : 0, color: on ? colorOf(entity!) : WARM_WHITE };
}

/**
 * Liest eine Lampe oder Gruppe. Hue-Gruppen melden weiter „on“, wenn alle Mitglieder
 * stromlos sind; ihr Attribut `entity_id` verrät die Mitglieder, das gilt dann als nicht erreichbar.
 */
export function readEntity(entityId: string, hass: Hass): LightReading {
  const entity = hass.states[entityId];
  const members: unknown = entity?.attributes.entity_id;
  const allGone = Array.isArray(members) && members.length > 0 && members.every((id) => isUnreachable(hass.states[id]));
  return readLight(allGone ? undefined : entity);
}

function mixColors(readings: readonly LightReading[]): Rgb {
  const total = readings.reduce((sum, r) => sum + r.intensity, 0);
  const channel = (i: 0 | 1 | 2) => Math.round(readings.reduce((sum, r) => sum + r.color[i] * r.intensity, 0) / total);
  return [channel(0), channel(1), channel(2)];
}

/**
 * Fasst einen Raum zusammen. Platzierte Lampen haben Vorrang vor Gruppen, denn eine
 * Hue-Gruppe meldet weiter „on“, wenn alle Mitglieder am Wandschalter stromlos sind.
 */
export function readRoom(room: RoomConfig, hass: Hass): RoomLight {
  const fixtures = (room.fixtures ?? []).map((fixture): FixtureReading => ({
    ...readLight(hass.states[fixture.entity]),
    fixture,
    reach: fixture.reach ?? DEFAULT_REACH[fixture.type],
  }));
  const sources = fixtures.length > 0 ? fixtures : (room.lights ?? []).map((l) => readEntity(l.entity, hass));
  const lit = sources.filter((s) => s.on);
  return {
    on: lit.length > 0,
    level: lit.reduce((max, s) => Math.max(max, s.intensity), 0),
    color: lit.length > 0 ? mixColors(lit) : WARM_WHITE,
    fixtures,
    unreachableCount: sources.filter((s) => s.unreachable).length,
  };
}

export const cssRgb = ([r, g, b]: Rgb): string => `rgb(${r} ${g} ${b})`;
