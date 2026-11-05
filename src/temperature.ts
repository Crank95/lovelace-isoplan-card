import type { Point } from "./config";
import { isUnreachable, type HassEntity } from "./hass";
import type { Rgb } from "./light";

const COOL: Rgb = [92, 148, 222];
const NEUTRAL: Rgb = [246, 240, 228];
const WARM: Rgb = [232, 112, 58];

export function readTemperature(entity: HassEntity | undefined): number | undefined {
  if (isUnreachable(entity)) return undefined;
  const value = Number.parseFloat(entity!.state);
  return Number.isFinite(value) ? value : undefined;
}

const mix = (a: Rgb, b: Rgb, t: number): Rgb =>
  [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)) as unknown as Rgb;

/** Zweiseitige Skala: kühl, neutral in der Mitte des Bereichs, warm. */
export function temperatureColor(value: number, [low, high]: Point): Rgb {
  const t = Math.min(1, Math.max(0, (value - low) / (high - low)));
  return t < 0.5 ? mix(COOL, NEUTRAL, t * 2) : mix(NEUTRAL, WARM, (t - 0.5) * 2);
}

export function formatTemperature(value: number | undefined, locale = "de"): string {
  if (value === undefined) return "–";
  const text = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
  return `${text}°`;
}
