import { css, html, LitElement, nothing, svg, type TemplateResult } from "lit";
import { FIXTURE_TYPES, type DeviceConfig, type FixtureConfig, type FixtureType, type IsoplanConfig, type Point } from "./config";
import { fixtureGlyph, FIXTURE_LABELS } from "./fixtures";
import type { Hass } from "./hass";
import { addFixture, moveFixture, placedEntities, removeFixture, roomAt, updateFixture, type PlacedKind } from "./placement";

interface Selection {
  readonly roomId: string;
  readonly index: number;
  readonly kind: PlacedKind;
}

type PlaceType = FixtureType | "device";

const DEFAULT_COORDINATES: Point = [1536, 1024];
const KEY_STEP = 4;
const ARROWS: Readonly<Record<string, Point>> = {
  ArrowLeft: [-KEY_STEP, 0], ArrowRight: [KEY_STEP, 0], ArrowUp: [0, -KEY_STEP], ArrowDown: [0, KEY_STEP],
};

/** Karten-Editor: Lampen auf den Plan setzen, ziehen und einstellen. Alles Übrige steht im YAML. */
export class IsoplanCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _selection: { state: true },
    _entity: { state: true },
    _type: { state: true },
    _armed: { state: true },
    _drag: { state: true },
    _message: { state: true },
  };

  static styles = css`
    :host { display: block; }
    .field { display: grid; gap: 4px; margin-bottom: 12px; font-size: 13px; }
    input, select { min-height: 40px; padding: 0 10px; font: inherit; border: 1px solid var(--divider-color, #bbb); border-radius: 8px; background: var(--card-background-color, #fff); color: var(--primary-text-color, #222); }
    .plan { position: relative; border-radius: 10px; overflow: hidden; cursor: default; touch-action: none; user-select: none; background: #e4e2dd; }
    .plan.armed { cursor: crosshair; outline: 2px solid var(--primary-text-color, #33363c); }
    .plan img.base, .plan svg.rooms { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
    .rooms polygon { fill: rgb(255 255 255 / 8%); stroke: #fff; stroke-width: 2; stroke-dasharray: 8 6; vector-effect: non-scaling-stroke; }
    .pin { position: absolute; width: 28px; height: 28px; padding: 0; display: grid; place-items: center; transform: translate(-50%, -50%) rotate(var(--angle, 0deg)); border: 0; border-radius: 50%; background: #fbfaf7; box-shadow: 0 2px 6px rgb(0 0 0 / 35%); cursor: grab; touch-action: none; }
    .pin.selected { outline: 2px solid var(--primary-text-color, #33363c); outline-offset: 1px; }
    .pin svg, .pin img { width: 19px; height: 19px; fill: none; stroke: #33363c; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; object-fit: contain; pointer-events: none; }
    .tools { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto; gap: 8px; margin-top: 12px; }
    .tools select { min-width: 0; }
    button.action { min-height: 40px; padding: 0 12px; white-space: nowrap; font: inherit; border: 0; border-radius: 8px; background: var(--primary-text-color, #33363c); color: var(--card-background-color, #fff); cursor: pointer; }
    button.action:disabled { opacity: 0.45; cursor: default; }
    button.quiet { background: none; color: var(--error-color, #8e2b1e); padding: 0; min-height: 40px; }
    .selected-fixture { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 10px; margin-top: 14px; }
    .selected-fixture h4 { grid-column: 1 / -1; margin: 0; font-size: 14px; }
    .selected-fixture .wide { grid-column: 1 / -1; }
    .check { min-height: 0; margin-right: 6px; }
    .hint { margin: 10px 0 0; font-size: 13px; color: var(--secondary-text-color, #555); }
    .hint[role="alert"] { color: var(--error-color, #8e2b1e); }
    @media (max-width: 480px) { .tools { grid-template-columns: minmax(0, 1fr); } }
  `;

  hass?: Hass;
  private _config?: IsoplanConfig;
  private _selection?: Selection;
  private _entity = "";
  private _type: PlaceType = "spot";
  private _armed = false;
  private _drag?: Point;
  private _message?: string;

  setConfig(config: IsoplanConfig): void {
    this._config = config;
  }

  private _commit(config: IsoplanConfig): void {
    this._config = config;
    this.dispatchEvent(new CustomEvent("config-changed", { bubbles: true, composed: true, detail: { config } }));
  }

  private get _coordinates(): Point {
    return this._config?.coordinates ?? DEFAULT_COORDINATES;
  }

  private _toImage(event: PointerEvent | MouseEvent): Point {
    const plan = this.shadowRoot!.querySelector<HTMLElement>(".plan")!;
    const rect = plan.getBoundingClientRect();
    const [w, h] = this._coordinates;
    return [((event.clientX - rect.left) / rect.width) * w, ((event.clientY - rect.top) / rect.height) * h];
  }

  private _selected(): (FixtureConfig | DeviceConfig) | undefined {
    if (!this._selection) return undefined;
    const { roomId, index, kind } = this._selection;
    return this._config?.rooms.find((r) => r.id === roomId)?.[kind]?.[index];
  }

  private _place(event: MouseEvent): void {
    if (!this._armed || !this._config) return;
    const point = this._toImage(event);
    const room = roomAt(this._config, point);
    if (!room) {
      this._message = "Diese Stelle liegt außerhalb aller Räume. Klicke in einen Raum.";
      return;
    }
    const [x, y] = point.map(Math.round);
    const kind: PlacedKind = this._type === "device" ? "devices" : "fixtures";
    const item = this._type === "device" ? { entity: this._entity, x, y } : { entity: this._entity, type: this._type, x, y };
    this._commit(addFixture(this._config, room.id, item, kind));
    this._selection = { roomId: room.id, index: room[kind]?.length ?? 0, kind };
    this._armed = false;
    this._entity = "";
    this._message = `In „${room.name}“ gesetzt. Ziehe es an die genaue Stelle.`;
  }

  private _grab(event: PointerEvent, selection: Selection): void {
    if (this._armed) return;
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this._selection = selection;
    this._drag = this._toImage(event);
  }

  private _dragTo(event: PointerEvent): void {
    if (this._drag) this._drag = this._toImage(event);
  }

  private _drop(event: PointerEvent): void {
    if (!this._drag || !this._selection || !this._config) return;
    const point = this._toImage(event);
    this._drag = undefined;
    const { roomId, index, kind } = this._selection;
    const config = moveFixture(this._config, roomId, index, point, kind);
    const target = roomAt(config, point);
    if (target && target.id !== roomId) {
      this._selection = { roomId: target.id, index: target[kind]?.length ?? 0, kind };
    }
    this._commit(config);
  }

  private _nudge(event: KeyboardEvent, selection: Selection, item: FixtureConfig | DeviceConfig): void {
    const delta = ARROWS[event.key];
    if (!delta || !this._config) return;
    event.preventDefault();
    this._commit(updateFixture(this._config, selection.roomId, selection.index, { x: (item.x ?? 0) + delta[0], y: (item.y ?? 0) + delta[1] }, selection.kind));
  }

  private _patch(patch: Partial<FixtureConfig & DeviceConfig>): void {
    if (!this._selection || !this._config) return;
    this._commit(updateFixture(this._config, this._selection.roomId, this._selection.index, patch, this._selection.kind));
  }

  private _remove(): void {
    if (!this._selection || !this._config) return;
    this._commit(removeFixture(this._config, this._selection.roomId, this._selection.index, this._selection.kind));
    this._selection = undefined;
  }

  private _candidates(): readonly string[] {
    if (!this.hass || !this._config) return [];
    const placed = placedEntities(this._config);
    const prefix = this._type === "device" ? "switch." : "light.";
    return Object.keys(this.hass.states).filter((id) => id.startsWith(prefix) && !placed.has(id)).sort();
  }

  private _renderPins(): TemplateResult[] {
    const [w, h] = this._coordinates;
    const pin = (room: { id: string }, item: FixtureConfig | DeviceConfig, index: number, kind: PlacedKind, glyph: TemplateResult): TemplateResult => {
      const fixture = item as FixtureConfig;
      const selection = { roomId: room.id, index, kind };
      const selected = this._selection?.roomId === room.id && this._selection.index === index && this._selection.kind === kind;
      const [x, y] = selected && this._drag ? this._drag : [item.x ?? 0, item.y ?? 0];
      const name = this.hass?.states[item.entity]?.attributes.friendly_name ?? item.entity;
      return html`<button class="pin ${selected ? "selected" : ""}" title=${name} aria-label="${name} verschieben"
        style="left:${(x / w) * 100}%;top:${(y / h) * 100}%;--angle:${fixture.angle ?? 0}deg"
        @pointerdown=${(e: PointerEvent) => this._grab(e, selection)}
        @pointermove=${this._dragTo}
        @pointerup=${this._drop}
        @pointercancel=${() => { this._drag = undefined; }}
        @keydown=${(e: KeyboardEvent) => this._nudge(e, selection, item)}
        @focus=${() => { this._selection = selection; }}
      >${glyph}</button>`;
    };
    return this._config!.rooms.flatMap((room) => [
      ...(room.fixtures ?? []).map((f, i) => pin(room, f, i, "fixtures", fixtureGlyph(f))),
      ...(room.devices ?? []).flatMap((d, i) => (d.x === undefined ? [] : [pin(room, d, i, "devices", html`<ha-icon icon=${d.icon ?? "mdi:power-plug-outline"}></ha-icon>`)])),
    ]);
  }

  private _renderSelected(): TemplateResult | typeof nothing {
    const selected = this._selected();
    if (!selected) return nothing;
    if (this._selection?.kind === "devices") return this._renderSelectedDevice(selected as DeviceConfig);
    const fixture = selected as FixtureConfig;
    const number = (value: string) => (value === "" ? undefined : Number(value));
    return html`<section class="selected-fixture">
      <h4>${this.hass?.states[fixture.entity]?.attributes.friendly_name ?? fixture.entity}</h4>
      <label class="field">Leuchtentyp
        <select @change=${(e: Event) => this._patch({ type: (e.target as HTMLSelectElement).value as FixtureType })}>
          ${FIXTURE_TYPES.map((type) => html`<option value=${type} ?selected=${type === fixture.type}>${FIXTURE_LABELS[type]}</option>`)}
        </select>
      </label>
      <label class="field">Lichtradius
        <input type="number" min="20" max="600" placeholder="Standard" .value=${String(fixture.reach ?? "")}
          @change=${(e: Event) => this._patch({ reach: number((e.target as HTMLInputElement).value) })} />
      </label>
      <label class="field">Drehung in Grad
        <input type="number" min="-180" max="180" placeholder="0" .value=${String(fixture.angle ?? "")}
          @change=${(e: Event) => this._patch({ angle: number((e.target as HTMLInputElement).value) })} />
      </label>
      <label class="field">Produktbild (Pfad)
        <input type="text" placeholder="/local/isoplan/hue-play.png" .value=${fixture.image ?? ""}
          @change=${(e: Event) => this._patch({ image: (e.target as HTMLInputElement).value || undefined })} />
      </label>
      <button class="quiet wide" type="button" @click=${this._remove}>Lampe vom Plan entfernen</button>
    </section>`;
  }

  private _renderSelectedDevice(device: DeviceConfig): TemplateResult {
    const text = (e: Event) => (e.target as HTMLInputElement).value || undefined;
    return html`<section class="selected-fixture">
      <h4>${device.name ?? this.hass?.states[device.entity]?.attributes.friendly_name ?? device.entity}</h4>
      <label class="field">Name
        <input type="text" .value=${device.name ?? ""} @change=${(e: Event) => this._patch({ name: text(e) })} />
      </label>
      <label class="field">Symbol
        <input type="text" placeholder="mdi:power-plug-outline" .value=${device.icon ?? ""} @change=${(e: Event) => this._patch({ icon: text(e) })} />
      </label>
      <label class="field wide">Verbrauchssensor
        <input type="text" placeholder="sensor.tv_leistung" .value=${device.power ?? ""} @change=${(e: Event) => this._patch({ power: text(e) })} />
      </label>
      <label class="wide"><input class="check" type="checkbox" .checked=${Boolean(device.confirm)}
        @change=${(e: Event) => this._patch({ confirm: (e.target as HTMLInputElement).checked || undefined })} /> Ausschalten erst nach zweitem Tipp</label>
      <button class="quiet wide" type="button" @click=${this._remove}>Gerät vom Plan entfernen</button>
    </section>`;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;
    const config = this._config;
    const [w, h] = this._coordinates;
    const armedHint = "Klicke jetzt auf die Stelle im Plan, an der die Lampe hängt.";
    return html`
      <label class="field">Grundriss (Pfad)
        <input type="text" .value=${config.image}
          @change=${(e: Event) => this._commit({ ...config, image: (e.target as HTMLInputElement).value })} />
      </label>
      <div class="plan ${this._armed ? "armed" : ""}" style="aspect-ratio:${w}/${h}" @click=${this._place}>
        <img class="base" src=${config.image} alt="Grundriss" draggable="false" />
        ${svg`<svg class="rooms" viewBox="0 0 ${w} ${h}" aria-hidden="true">
          ${config.rooms.map((room) => svg`<polygon points=${room.area.map((p) => p.join(",")).join(" ")}/>`)}
        </svg>`}
        ${this._renderPins()}
      </div>
      <div class="tools">
        <select aria-label="Lampe wählen" @change=${(e: Event) => { this._entity = (e.target as HTMLSelectElement).value; }}>
          <option value="" ?selected=${!this._entity}>Lampe wählen …</option>
          ${this._candidates().map((id) => html`<option value=${id} ?selected=${id === this._entity}>${this.hass?.states[id]?.attributes.friendly_name ?? id} (${id})</option>`)}
        </select>
        <select aria-label="Leuchtentyp" @change=${(e: Event) => { this._type = (e.target as HTMLSelectElement).value as PlaceType; this._entity = ""; }}>
          ${FIXTURE_TYPES.map((type) => html`<option value=${type} ?selected=${type === this._type}>${FIXTURE_LABELS[type]}</option>`)}
          <option value="device" ?selected=${this._type === "device"}>Gerät an Steckdose</option>
        </select>
        <button class="action" type="button" ?disabled=${!this._entity} @click=${() => { this._armed = true; this._message = armedHint; }}>Auf Plan setzen</button>
      </div>
      ${this._message ? html`<p class="hint" role="status">${this._message}</p>` : html`<p class="hint">Ziehe Lampen mit der Maus oder dem Finger. Mit den Pfeiltasten verschiebst du die gewählte Lampe genau. Räume und Sensoren stellst du im YAML-Editor ein.</p>`}
      ${this._renderSelected()}`;
  }
}

if (!customElements.get("isoplan-card-editor")) customElements.define("isoplan-card-editor", IsoplanCardEditor);
