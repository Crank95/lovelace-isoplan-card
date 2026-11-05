import { html, LitElement, nothing, type PropertyValues, type TemplateResult } from "lit";
import { resolveConfig, watchedEntities, type DeviceConfig, type IsoplanConfig, type Mode, type ResolvedConfig, type RoomConfig } from "./config";
import { nightFactor } from "./daylight";
import { fixtureGlyph } from "./fixtures";
import { boundingBox, NO_ZOOM, separateLabels, zoomTo, type Box, type Label, type Zoom } from "./geometry";
import { domainOf, isUnreachable, type Hass } from "./hass";
import { cssRgb, readEntity, readRoom, type FixtureReading, type RoomLight } from "./light";
import { renderPanel, type PanelActions } from "./panel";
import { renderScene } from "./scene";
import { cardStyles } from "./styles";
import { formatTemperature, readTemperature, temperatureColor } from "./temperature";
import "./isoplan-card-editor";

const HOLD_MS = 500;
const WIDE_MIN = 640;
const PANEL_SPACE = 324;
const NIGHT_THEME_FROM = 0.5;
const ERROR_MS = 6000;
/** So lange zählen schnelle Tipps auf dem Thermostat weiter, bis Home Assistant nachgezogen hat. */
const PENDING_TARGET_MS = 4000;
const CONFIRM_MS = 4000;
/** Platz, den ein Gerät in der Übersicht belegt, in Pixeln. */
const DEVICE_BOX = 24;

let instances = 0;

export class IsoplanCard extends LitElement {
  static styles = cardStyles;
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _mode: { state: true },
    _selected: { state: true },
    _width: { state: true },
    _offsets: { state: true },
    _error: { state: true },
    _pendingTarget: { state: true },
    _armedDevice: { state: true },
  };

  hass?: Hass;
  private _config?: ResolvedConfig;
  private _mode: Mode = "licht";
  private _selected?: string;
  private _width = 0;
  private _offsets: ReadonlyMap<string, readonly [number, number]> = new Map();
  private _error?: string;
  private _pendingTarget?: { readonly entity: string; readonly value: number };
  private _errorTimer?: number;
  private _pendingTimer?: number;
  private _armedDevice?: string;
  private _armTimer?: number;
  private _watched: ReadonlySet<string> = new Set();
  private _uid = `iso${++instances}`;
  private _observer?: ResizeObserver;
  private _holdTimer?: number;
  private _held = false;

  static getConfigElement(): HTMLElement {
    return document.createElement("isoplan-card-editor");
  }

  static getStubConfig(): IsoplanConfig {
    return {
      type: "custom:isoplan-card",
      image: "/local/isoplan/wohnung.webp",
      rooms: [{ id: "raum", name: "Raum", area: [[100, 100], [900, 100], [900, 700], [100, 700]], label: [500, 400] }],
    };
  }

  setConfig(config: IsoplanConfig): void {
    const resolved = resolveConfig(config);
    if (!this._config) this._mode = resolved.default_mode;
    if (!resolved.rooms.some((room) => room.id === this._selected)) this._selected = undefined;
    this._config = resolved;
    this._watched = watchedEntities(resolved);
  }

  getCardSize(): number {
    return 8;
  }

  getGridOptions(): Record<string, unknown> {
    return { columns: "full", rows: "auto", min_columns: 6 };
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._observer = new ResizeObserver(([entry]) => {
      this._width = entry.contentRect.width;
    });
    this._observer.observe(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._observer?.disconnect();
    [this._holdTimer, this._errorTimer, this._pendingTimer, this._armTimer].forEach((timer) => window.clearTimeout(timer));
  }

  protected shouldUpdate(changed: PropertyValues): boolean {
    if (!this._config) return false;
    const previous = changed.get("hass") as Hass | undefined;
    if (changed.size > 1 || !changed.has("hass") || !previous || !this.hass) return true;
    return [...this._watched].some((id) => previous.states[id] !== this.hass!.states[id]);
  }

  protected updated(): void {
    this._placeLabels();
  }

  private get _locale(): string {
    return this.hass?.locale?.language ?? this.hass?.language ?? "de";
  }

  private get _stageSize(): { width: number; height: number } {
    const [w, h] = this._config!.coordinates;
    return { width: this._width, height: (this._width * h) / w };
  }

  private get _wide(): boolean {
    return this._width >= WIDE_MIN;
  }

  private _zoom(): Zoom {
    const room = this._config?.rooms.find((r) => r.id === this._selected);
    if (!room || !this._width) return NO_ZOOM;
    const [w] = this._config!.coordinates;
    const { width, height } = this._stageSize;
    const factor = width / w;
    const box = boundingBox(room.area);
    const pixels: Box = { x: box.x * factor, y: box.y * factor, width: box.width * factor, height: box.height * factor };
    const zoom = zoomTo(pixels, { x: 0, y: 0, width: this._wide ? width - PANEL_SPACE : width, height });
    return { ...zoom, x: Math.round(zoom.x), y: Math.round(zoom.y) };
  }

  /** Miss die Plaketten und schiebe sie auseinander; ändert den Zustand nur bei echter Abweichung. */
  private _placeLabels(): void {
    if (!this._width || !this.shadowRoot || !this._config) return;
    const [w, h] = this._config.coordinates;
    const { width, height } = this._stageSize;
    const labels: Label[] = this._config.rooms.flatMap((room) => {
      const element = this.shadowRoot!.querySelector<HTMLElement>(`[data-room="${room.id}"]`);
      if (!element) return [];
      return [{ id: room.id, x: (room.label[0] / w) * width, y: (room.label[1] / h) * height, width: element.offsetWidth, height: element.offsetHeight }];
    });
    const obstacles: Label[] = this._config.rooms.flatMap((room) => room.devices ?? []).flatMap((device) => {
      if (device.x === undefined || device.y === undefined) return [];
      return [{ id: device.entity, x: (device.x / w) * width, y: (device.y / h) * height, width: DEVICE_BOX, height: DEVICE_BOX }];
    });
    const placed = separateLabels(labels, { width, height }, obstacles);
    const next = new Map(placed.map((label, i) => [label.id, [Math.round(label.x - labels[i].x), Math.round(label.y - labels[i].y)] as const]));
    const changed = [...next].some(([id, [x, y]]) => this._offsets.get(id)?.[0] !== x || this._offsets.get(id)?.[1] !== y);
    if (changed) this._offsets = next;
  }

  private async _call(domain: string, service: string, data: Record<string, unknown>): Promise<void> {
    try {
      await this.hass!.callService(domain, service, data);
    } catch (error) {
      console.error("isoplan-card:", domain, service, error);
      this._error = "Das hat nicht geklappt. Bitte prüfe die Verbindung zu Home Assistant und versuche es erneut.";
      window.clearTimeout(this._errorTimer);
      this._errorTimer = window.setTimeout(() => { this._error = undefined; }, ERROR_MS);
    }
  }

  private _moreInfo(entityId: string): void {
    this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId } }));
  }

  private _toggle(entityId: string): void {
    void this._call("homeassistant", "toggle", { entity_id: entityId });
  }

  private readonly _actions: PanelActions = {
    close: () => { this._selected = undefined; },
    toggle: (id) => this._toggle(id),
    setBrightness: (id, percent) => void this._call(domainOf(id), "turn_on", { entity_id: id, brightness_pct: percent }),
    stepTarget: (id, delta) => this._stepTarget(id, delta),
    tapDevice: (device) => this._tapDevice(device),
    moreInfo: (id) => this._moreInfo(id),
  };

  private _stepTarget(entityId: string, delta: number): void {
    const attributes = this.hass!.states[entityId]?.attributes ?? {};
    const base = this._pendingTarget?.entity === entityId ? this._pendingTarget.value : attributes.temperature;
    const value = Math.min(attributes.max_temp ?? Infinity, Math.max(attributes.min_temp ?? -Infinity, base + delta));
    this._pendingTarget = { entity: entityId, value };
    window.clearTimeout(this._pendingTimer);
    this._pendingTimer = window.setTimeout(() => { this._pendingTarget = undefined; }, PENDING_TARGET_MS);
    void this._call("climate", "set_temperature", { entity_id: entityId, temperature: value });
  }

  /** Geräte mit `confirm` schalten erst nach einem zweiten Tipp aus; Einschalten bleibt direkt. */
  private _tapDevice(device: DeviceConfig): void {
    const entity = this.hass!.states[device.entity];
    if (isUnreachable(entity)) return;
    window.clearTimeout(this._armTimer);
    if (device.confirm && entity!.state === "on" && this._armedDevice !== device.entity) {
      this._armedDevice = device.entity;
      this._armTimer = window.setTimeout(() => { this._armedDevice = undefined; }, CONFIRM_MS);
      return;
    }
    this._armedDevice = undefined;
    this._toggle(device.entity);
  }

  private _onKey(event: KeyboardEvent): void {
    if (event.key === "Escape") this._selected = undefined;
  }

  private _selectRoom(id: string): void {
    this._selected = this._selected === id ? undefined : id;
  }

  private _startHold(entityId: string): void {
    this._held = false;
    this._holdTimer = window.setTimeout(() => {
      this._held = true;
      this._moreInfo(entityId);
    }, HOLD_MS);
  }

  private _endHold(): void {
    window.clearTimeout(this._holdTimer);
  }

  private _cancelHold(): void {
    window.clearTimeout(this._holdTimer);
    this._held = false;
  }

  private _tapFixture(entityId: string): void {
    if (!this._held) this._toggle(entityId);
    this._held = false;
  }

  private _renderPlaque(room: RoomConfig, light: RoomLight, unzoom: number): TemplateResult {
    const [w, h] = this._config!.coordinates;
    const value = room.temperature ? readTemperature(this.hass!.states[room.temperature]) : undefined;
    const klima = this._mode === "klima";
    const dotColor = klima && value !== undefined ? temperatureColor(value, this._config!.temperature_range) : light.color;
    const [dx, dy] = this._offsets.get(room.id) ?? [0, 0];
    const lit = klima ? value !== undefined : light.on;
    return html`<button
      class="plaque ${lit ? "on" : ""} ${klima ? "big" : ""} ${value !== undefined ? "valued" : ""} ${this._selected ? "hidden" : ""}"
      data-room=${room.id}
      style="left:${(room.label[0] / w) * 100}%;top:${(room.label[1] / h) * 100}%;--dx:${dx}px;--dy:${dy}px;--unzoom:${unzoom};--c:${cssRgb(dotColor)}"
      aria-label="${room.name}${value !== undefined ? `, ${formatTemperature(value, this._locale)}` : ""}, ${light.on ? "Licht an" : "Licht aus"}. Details öffnen"
      @click=${() => this._selectRoom(room.id)}
    >
      <i class="dot" aria-hidden="true"></i>
      <span class="name">${room.name}</span>
      ${value !== undefined ? html`<b>${formatTemperature(value, this._locale)}</b>` : nothing}
    </button>`;
  }

  private _renderFixture(reading: FixtureReading, unzoom: number): TemplateResult {
    const [w, h] = this._config!.coordinates;
    const { fixture } = reading;
    const name = fixture.name ?? this.hass!.states[fixture.entity]?.attributes.friendly_name ?? fixture.entity;
    const status = reading.unreachable ? "nicht erreichbar" : reading.on ? "an" : "aus";
    return html`<button
      class="fixture ${reading.on ? "on" : ""} ${reading.unreachable ? "unreachable" : ""}"
      style="left:${(fixture.x / w) * 100}%;top:${(fixture.y / h) * 100}%;--c:${cssRgb(reading.color)};--unzoom:${unzoom};--angle:${fixture.angle ?? 0}deg"
      title="${name}: ${status}"
      aria-label="${name}, ${status}. Tippen schaltet, halten öffnet Details"
      ?disabled=${reading.unreachable}
      tabindex=${this._selected ? 0 : -1}
      @pointerdown=${() => this._startHold(fixture.entity)}
      @pointerup=${this._endHold}
      @pointerleave=${this._cancelHold}
      @pointercancel=${this._cancelHold}
      @contextmenu=${(e: Event) => e.preventDefault()}
      @click=${() => this._tapFixture(fixture.entity)}
    >${fixtureGlyph(fixture)}</button>`;
  }

  private _renderDevice(device: DeviceConfig, unzoom: number): TemplateResult | typeof nothing {
    if (device.x === undefined || device.y === undefined) return nothing;
    const [w, h] = this._config!.coordinates;
    const entity = this.hass!.states[device.entity];
    const unreachable = isUnreachable(entity);
    const on = entity?.state === "on";
    const armed = this._armedDevice === device.entity;
    const name = (device.name ?? entity?.attributes.friendly_name ?? device.entity).trim();
    const status = armed ? "nochmal tippen zum Ausschalten" : unreachable ? "nicht erreichbar" : on ? "an" : "aus";
    return html`<button
      class="device ${on ? "on" : ""} ${armed ? "armed" : ""}"
      style="left:${(device.x / w) * 100}%;top:${(device.y / h) * 100}%;--unzoom:${unzoom}"
      title="${name}: ${status}"
      aria-label="${name}, ${status}. Tippen schaltet, halten öffnet Details"
      ?disabled=${unreachable}
      tabindex=${this._selected ? 0 : -1}
      @pointerdown=${() => this._startHold(device.entity)}
      @pointerup=${this._endHold}
      @pointerleave=${this._cancelHold}
      @pointercancel=${this._cancelHold}
      @contextmenu=${(e: Event) => e.preventDefault()}
      @click=${() => { if (!this._held) this._tapDevice(device); this._held = false; }}
    ><span><ha-icon icon=${device.icon ?? "mdi:power-plug-outline"}></ha-icon></span></button>`;
  }

  private _renderDock(): TemplateResult | typeof nothing {
    const { all_lights: all, extras = [] } = this._config!;
    if (!all && extras.length === 0) return nothing;
    const allOn = all ? readEntity(all, this.hass!).on : false;
    return html`<div class="dock">
      ${extras.map((extra) => {
        const { on, unreachable } = readEntity(extra.entity, this.hass!);
        return html`<button class=${on ? "on" : ""} aria-pressed=${on} ?disabled=${unreachable}
          title=${unreachable ? `${extra.name} ist nicht erreichbar` : extra.name} @click=${() => this._toggle(extra.entity)}>
          <ha-icon icon=${extra.icon ?? "mdi:lightbulb-outline"}></ha-icon><span>${extra.name}</span>
        </button>`;
      })}
      ${all
        ? html`<button class=${allOn ? "on" : ""} @click=${() => void this._call(domainOf(all), allOn ? "turn_off" : "turn_on", { entity_id: all })}>
            <ha-icon icon="mdi:lightbulb-group-outline"></ha-icon><span>${allOn ? "Alle aus" : "Alle an"}</span>
          </button>`
        : nothing}
    </div>`;
  }

  private _renderModes(): TemplateResult {
    const modes: readonly (readonly [Mode, string])[] = [["licht", "Licht"], ["klima", "Klima"]];
    return html`<div class="modes" role="group" aria-label="Ansicht">
      ${modes.map(([mode, label]) => html`<button aria-pressed=${this._mode === mode} @click=${() => { this._mode = mode; }}>${label}</button>`)}
    </div>`;
  }

  private _renderScale(): TemplateResult | typeof nothing {
    if (this._mode !== "klima" || this._selected) return nothing;
    const [low, high] = this._config!.temperature_range;
    return html`<div class="scale">${low}°<i aria-hidden="true"></i>${high}°</div>`;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this._config || !this.hass) return nothing;
    const config = this._config;
    const hass = this.hass;
    const [w, h] = config.coordinates;
    const rooms = new Map(config.rooms.map((room) => [room.id, readRoom(room, hass)]));
    const night = nightFactor(config.night, hass.states[config.sun_entity]);
    const zoom = this._zoom();
    const unzoom = 1 / zoom.scale;
    const room = config.rooms.find((r) => r.id === this._selected);
    const fixtures = [...rooms.values()].flatMap((light) => light.fixtures);
    const shown = this._selected ? rooms.get(this._selected)!.fixtures : fixtures;
    const devices = (room ? [room] : config.rooms).flatMap((r) => r.devices ?? []);
    return html`<ha-card class=${night >= NIGHT_THEME_FROM ? "night" : ""} @keydown=${this._onKey}>
      <div class="viewport ${room ? "zoomed" : ""}" style="aspect-ratio:${w}/${h}">
        <div class="stage" style="transform:translate(${zoom.x}px,${zoom.y}px) scale(${zoom.scale});--unzoom:${unzoom}">
          ${renderScene({ uid: this._uid, config, hass, rooms, night, mode: this._mode, selected: this._selected }, (id) => this._selectRoom(id))}
          ${this._mode === "licht" ? shown.map((f) => this._renderFixture(f, unzoom)) : nothing}
          ${this._mode === "licht" ? devices.map((d) => this._renderDevice(d, unzoom)) : nothing}
          ${config.rooms.map((r) => this._renderPlaque(r, rooms.get(r.id)!, unzoom))}
        </div>
        ${this._renderModes()}
        ${room ? nothing : this._renderDock()}
        ${this._renderScale()}
        ${this._error ? html`<div class="error" role="alert">${this._error}</div>` : nothing}
      </div>
      ${room ? renderPanel(hass, room, rooms.get(room.id)!, this._locale, this._actions, this._pendingTarget?.entity === room.climate ? this._pendingTarget?.value : undefined, this._armedDevice) : nothing}
    </ha-card>`;
  }
}

if (!customElements.get("isoplan-card")) customElements.define("isoplan-card", IsoplanCard);

const registry = ((window as unknown as { customCards?: unknown[] }).customCards ??= []);
registry.push({
  type: "isoplan-card",
  name: "Isoplan Card",
  description: "Isometrischer Grundriss mit echtem Lichtverlauf, Tag/Nacht und Raumdetails.",
  preview: false,
});
