import { html, nothing, type TemplateResult } from "lit";
import type { DeviceConfig, RoomConfig } from "./config";
import { isUnreachable, type Hass } from "./hass";
import { cssRgb, readEntity, type RoomLight } from "./light";
import { formatTemperature, readTemperature } from "./temperature";

export interface PanelActions {
  close(): void;
  toggle(entityId: string): void;
  setBrightness(entityId: string, percent: number): void;
  stepTarget(entityId: string, delta: number): void;
  moreInfo(entityId: string): void;
  tapDevice(device: DeviceConfig): void;
}

const DEFAULT_STEP = 0.5;
const TENTHS_BELOW_WATT = 10;
const nameOf = (hass: Hass, entityId: string, fallback?: string): string =>
  fallback ?? hass.states[entityId]?.attributes.friendly_name ?? entityId;

function switchControl(on: boolean, disabled: boolean, label: string, onToggle: () => void): TemplateResult {
  return html`<label class="switch">
    <input type="checkbox" role="switch" .checked=${on} ?disabled=${disabled} aria-label=${label} @change=${(e: Event) => { (e.target as HTMLInputElement).checked = on; onToggle(); }} />
    <span aria-hidden="true"></span>
  </label>`;
}

function lightRow(hass: Hass, entityId: string, label: string, actions: PanelActions): TemplateResult {
  const entity = hass.states[entityId];
  const reading = readEntity(entityId, hass);
  const percent = Math.round(((entity?.attributes.brightness ?? 0) / 255) * 100);
  const dimmable = reading.on && typeof entity?.attributes.brightness === "number";
  return html`<div class="row ${reading.on ? "on" : ""}" style="--c:${cssRgb(reading.color)}">
    <button class="row-name" @click=${() => actions.moreInfo(entityId)}>
      <i class="dot" aria-hidden="true"></i><span>${label}</span>
      <small>${reading.unreachable ? "Nicht erreichbar" : reading.on ? `${percent} %` : "Aus"}</small>
    </button>
    ${switchControl(reading.on, reading.unreachable, `${label} schalten`, () => actions.toggle(entityId))}
    ${dimmable
      ? html`<input class="dim" type="range" min="1" max="100" .value=${String(percent)} aria-label="Helligkeit ${label}"
          @change=${(e: Event) => actions.setBrightness(entityId, Number((e.target as HTMLInputElement).value))} />`
      : nothing}
  </div>`;
}

function climateBlock(hass: Hass, room: RoomConfig, locale: string, actions: PanelActions, pendingTarget?: number): TemplateResult | typeof nothing {
  const entity = room.climate ? hass.states[room.climate] : undefined;
  const current = room.temperature ? readTemperature(hass.states[room.temperature]) : undefined;
  if (!entity && current === undefined) return nothing;
  const target = pendingTarget ?? entity?.attributes.temperature;
  const step = entity?.attributes.target_temp_step ?? DEFAULT_STEP;
  const adjustable = entity && !isUnreachable(entity) && typeof target === "number";
  return html`<section class="climate">
    <div>
      <strong>${formatTemperature(current, locale)}</strong>
      <small>${entity?.attributes.hvac_action === "heating" ? "Heizt gerade" : "Raumtemperatur"}</small>
    </div>
    ${adjustable
      ? html`<div class="stepper" role="group" aria-label="Zieltemperatur">
          <button aria-label="Kälter" @click=${() => actions.stepTarget(room.climate!, -step)}><ha-icon icon="mdi:minus"></ha-icon></button>
          <output>${formatTemperature(target, locale)}</output>
          <button aria-label="Wärmer" @click=${() => actions.stepTarget(room.climate!, step)}><ha-icon icon="mdi:plus"></ha-icon></button>
        </div>`
      : nothing}
  </section>`;
}

function powerText(hass: Hass, device: DeviceConfig, locale: string): string | undefined {
  const sensor = device.power ? hass.states[device.power] : undefined;
  const value = Number.parseFloat(sensor?.state ?? "");
  if (!Number.isFinite(value)) return undefined;
  const digits = value < TENTHS_BELOW_WATT ? 1 : 0;
  const text = new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);
  return `${text} ${sensor?.attributes.unit_of_measurement ?? "W"}`;
}

function deviceRow(hass: Hass, device: DeviceConfig, locale: string, armed: boolean, actions: PanelActions): TemplateResult {
  const entity = hass.states[device.entity];
  const unreachable = isUnreachable(entity);
  const on = entity?.state === "on";
  const label = nameOf(hass, device.entity, device.name).trim();
  const status = armed ? "Nochmal tippen" : unreachable ? "Nicht erreichbar" : on ? powerText(hass, device, locale) ?? "An" : "Aus";
  return html`<div class="row device-row ${on ? "on" : ""} ${armed ? "armed" : ""}">
    <button class="row-name" @click=${() => actions.moreInfo(device.entity)}>
      <ha-icon icon=${device.icon ?? "mdi:power-plug-outline"}></ha-icon><span>${label}</span>
      <small>${status}</small>
    </button>
    ${switchControl(on, unreachable, `${label} schalten`, () => actions.tapDevice(device))}
  </div>`;
}

export function renderPanel(hass: Hass, room: RoomConfig, light: RoomLight, locale: string, actions: PanelActions, pendingTarget?: number, armedDevice?: string): TemplateResult {
  const groups = room.lights ?? [];
  const fixtures = room.fixtures ?? [];
  const devices = room.devices ?? [];
  return html`<aside class="panel" aria-label="${room.name}, Details">
    <header>
      <h2>${room.name}</h2>
      <button class="icon" aria-label="Details schließen" @click=${actions.close}><ha-icon icon="mdi:close"></ha-icon></button>
    </header>
    ${climateBlock(hass, room, locale, actions, pendingTarget)}
    ${groups.length > 0
      ? html`<section class="rows">${groups.map((g) => lightRow(hass, g.entity, nameOf(hass, g.entity, g.name), actions))}</section>`
      : nothing}
    ${devices.length > 0
      ? html`<section class="rows" aria-label="Geräte">${devices.map((d) => deviceRow(hass, d, locale, armedDevice === d.entity, actions))}</section>`
      : nothing}
    ${fixtures.length > 0
      ? html`<details>
          <summary>Einzelne Lampen (${fixtures.length})</summary>
          <section class="rows">${fixtures.map((f) => lightRow(hass, f.entity, nameOf(hass, f.entity, f.name), actions))}</section>
        </details>`
      : nothing}
    ${light.unreachableCount > 0
      ? html`<p class="note">${light.unreachableCount === 1 ? "1 Lampe ist" : `${light.unreachableCount} Lampen sind`} nicht erreichbar, vermutlich am Wandschalter ausgeschaltet.</p>`
      : nothing}
  </aside>`;
}
