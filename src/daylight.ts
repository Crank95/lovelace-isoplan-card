import type { NightSetting } from "./config";
import type { HassEntity } from "./hass";

const DAY_ELEVATION = 6;
const NIGHT_ELEVATION = -6;

/** 0 = voller Tag, 1 = Nacht. Überblendet durch die bürgerliche Dämmerung. */
export function nightFactor(setting: NightSetting, sun: HassEntity | undefined): number {
  if (setting === "on") return 1;
  if (setting === "off" || !sun) return 0;
  const elevation = sun.attributes.elevation;
  if (typeof elevation !== "number") return sun.state === "below_horizon" ? 1 : 0;
  const position = (DAY_ELEVATION - elevation) / (DAY_ELEVATION - NIGHT_ELEVATION);
  const t = Math.min(1, Math.max(0, position));
  return t * t * (3 - 2 * t);
}
