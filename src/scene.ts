import { nothing, svg, type TemplateResult } from "lit";
import type { Mode, ResolvedConfig, RoomConfig } from "./config";
import { cssRgb, type FixtureReading, type RoomLight } from "./light";
import { readTemperature, temperatureColor } from "./temperature";
import type { Hass } from "./hass";

export interface SceneInput {
  readonly uid: string;
  readonly config: ResolvedConfig;
  readonly hass: Hass;
  readonly rooms: ReadonlyMap<string, RoomLight>;
  readonly night: number;
  readonly mode: Mode;
  readonly selected?: string;
}

const NIGHT_TINT = "#2b3046";
const FOCUS_MARGIN = 4000;
const AMBIENT_SHARE = 0.34;
const DAY_POOL = 0.26;
const NIGHT_POOL = 0.42;
/** Spots leuchten in die Fläche; das Bild ist isometrisch, ein Lichtkreis wird zur Ellipse. */
const ISO_SQUASH = 0.62;

const pointsOf = (room: RoomConfig): string => room.area.map(([x, y]) => `${x},${y}`).join(" ");

function pool(fixture: FixtureReading, fill: string, opacity: number): TemplateResult {
  return svg`<ellipse class="pool" cx=${fixture.fixture.x} cy=${fixture.fixture.y} rx=${fixture.reach}
    ry=${fixture.reach * ISO_SQUASH} fill=${fill} style="opacity:${opacity.toFixed(3)}"/>`;
}

function roomDefs(input: SceneInput, room: RoomConfig, light: RoomLight): TemplateResult {
  const { uid, config } = input;
  const [width, height] = config.coordinates;
  const ambient = Math.round(255 * light.level * AMBIENT_SHARE);
  return svg`
    <clipPath id="${uid}-clip-${room.id}"><polygon points=${pointsOf(room)}/></clipPath>
    <mask id="${uid}-mask-${room.id}" maskUnits="userSpaceOnUse" x="0" y="0" width=${width} height=${height}>
      <rect width=${width} height=${height} fill="rgb(${ambient} ${ambient} ${ambient})"/>
      ${light.fixtures.filter((f) => f.on).map((f) => pool(f, `url(#${uid}-white)`, f.intensity))}
    </mask>
    ${light.fixtures.filter((f) => f.on).map((f, i) => svg`
      <radialGradient id="${uid}-c-${room.id}-${i}">
        <stop offset="0" style="stop-color:${cssRgb(f.color)};stop-opacity:1"/>
        <stop offset="1" style="stop-color:${cssRgb(f.color)};stop-opacity:0"/>
      </radialGradient>`)}`;
}

function roomLightLayer(input: SceneInput, room: RoomConfig, light: RoomLight): TemplateResult {
  const { uid, config, night } = input;
  const [width, height] = config.coordinates;
  const reveal = light.on ? night : 0;
  const strength = DAY_POOL + (NIGHT_POOL - DAY_POOL) * night;
  const lit = light.fixtures.filter((f) => f.on);
  const fallbackRoomGlow = lit.length === 0 && light.on;
  return svg`
    <g clip-path="url(#${uid}-clip-${room.id})">
      <g class="reveal" mask="url(#${uid}-mask-${room.id})" style="opacity:${reveal.toFixed(3)}">
        <image href=${config.image} width=${width} height=${height}/>
      </g>
      ${lit.map((f, i) => pool(f, `url(#${uid}-c-${room.id}-${i})`, f.intensity * strength))}
      ${fallbackRoomGlow
        ? svg`<polygon class="pool" points=${pointsOf(room)} style="fill:${cssRgb(light.color)};opacity:${(light.level * strength * 0.6).toFixed(3)}"/>`
        : nothing}
    </g>`;
}

function climateLayer(input: SceneInput, room: RoomConfig): TemplateResult {
  const { config, hass, mode } = input;
  const value = room.temperature ? readTemperature(hass.states[room.temperature]) : undefined;
  const visible = mode === "klima" && value !== undefined;
  const fill = value === undefined ? "transparent" : cssRgb(temperatureColor(value, config.temperature_range));
  return svg`<polygon class="tint" points=${pointsOf(room)} style="fill:${fill};opacity:${visible ? 0.72 : 0}"/>`;
}

function focusLayer(input: SceneInput): TemplateResult {
  const { config, selected } = input;
  const [width, height] = config.coordinates;
  const room = config.rooms.find((r) => r.id === selected);
  const hole = room ? `M${room.area.map(([x, y]) => `${x} ${y}`).join("L")}Z` : "";
  return svg`
    <path class="focus" fill-rule="evenodd" d="M${-FOCUS_MARGIN} ${-FOCUS_MARGIN}H${width + FOCUS_MARGIN}V${height + FOCUS_MARGIN}H${-FOCUS_MARGIN}Z ${hole}" style="opacity:${room ? 0.46 : 0}"/>
    ${room ? svg`<polygon class="outline" points=${pointsOf(room)}/>` : nothing}`;
}

export function renderScene(input: SceneInput, onRoom: (id: string) => void): TemplateResult {
  const { uid, config, rooms, night, mode } = input;
  const [width, height] = config.coordinates;
  const entries = config.rooms.map((room) => [room, rooms.get(room.id)!] as const);
  return svg`
    <svg class="scene ${mode}" viewBox="0 0 ${width} ${height}" role="presentation">
      <defs>
        <radialGradient id="${uid}-white">
          <stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </radialGradient>
        ${entries.map(([room, light]) => roomDefs(input, room, light))}
      </defs>
      <image class="plan" href=${config.image} width=${width} height=${height}/>
      ${config.image_night
        ? svg`<image class="night-plan" href=${config.image_night} width=${width} height=${height} style="opacity:${night.toFixed(3)}"/>`
        : svg`<rect class="dusk" width=${width} height=${height} fill=${NIGHT_TINT} style="opacity:${night.toFixed(3)}"/>`}
      ${entries.map(([room, light]) => roomLightLayer(input, room, light))}
      ${config.rooms.map((room) => climateLayer(input, room))}
      ${focusLayer(input)}
      ${config.rooms.map((room) => svg`
        <polygon class="hit" points=${pointsOf(room)} tabindex="-1" @click=${() => onRoom(room.id)}/>`)}
    </svg>`;
}
