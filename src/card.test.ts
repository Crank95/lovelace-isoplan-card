import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { parse } from "yaml";
import { resolveConfig, watchedEntities, type IsoplanConfig } from "./config";
import type { Hass, HassEntity } from "./hass";
import "./isoplan-card";
import type { IsoplanCard } from "./isoplan-card";
import type { IsoplanCardEditor } from "./isoplan-card-editor";

const entity = (entity_id: string, state: string, attributes: Record<string, unknown> = {}): HassEntity => ({ entity_id, state, attributes });

const config: IsoplanConfig = {
  type: "custom:isoplan-card",
  image: "/plan.webp",
  all_lights: "light.alle",
  extras: [{ entity: "light.balkon", name: "Balkon" }],
  rooms: [
    {
      id: "a", name: "Küche", area: [[0, 0], [400, 0], [400, 400], [0, 400]], label: [200, 200],
      temperature: "sensor.a", climate: "climate.a",
      lights: [{ entity: "light.gruppe", name: "Küche" }],
      fixtures: [{ entity: "light.spot", type: "spot", x: 100, y: 100 }, { entity: "light.tot", type: "spot", x: 200, y: 100 }],
    },
    { id: "b", name: "Bad", area: [[500, 0], [900, 0], [900, 400], [500, 400]], label: [700, 200] },
  ],
};

function makeHass(overrides: HassEntity[] = []): Hass & { callService: ReturnType<typeof vi.fn> } {
  const list = [
    entity("sun.sun", "above_horizon", { elevation: 30 }),
    entity("light.alle", "on"),
    entity("light.balkon", "off"),
    entity("light.gruppe", "on", { brightness: 128 }),
    entity("light.spot", "on", { brightness: 255, rgb_color: [255, 0, 0] }),
    entity("light.tot", "unavailable"),
    entity("sensor.a", "20.47"),
    entity("climate.a", "heat", { temperature: 21, target_temp_step: 0.5 }),
    ...overrides,
  ];
  return { states: Object.fromEntries(list.map((e) => [e.entity_id, e])), locale: { language: "de" }, callService: vi.fn(async () => undefined) };
}

async function mount(hass = makeHass(), cfg = config): Promise<IsoplanCard> {
  const card = document.createElement("isoplan-card") as IsoplanCard;
  card.setConfig(cfg);
  card.hass = hass;
  document.body.append(card);
  await card.updateComplete;
  return card;
}

const $ = <T extends Element = HTMLElement>(card: Element, selector: string) => card.shadowRoot!.querySelector<T>(selector)!;
const $$ = <T extends Element = HTMLElement>(card: Element, selector: string) => [...card.shadowRoot!.querySelectorAll<T>(selector)];

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  customElements.define("ha-card", class extends HTMLElement {});
});

describe("isoplan-card", () => {
  it("shows exactly one plaque per room with the formatted temperature", async () => {
    const card = await mount();
    const plaques = $$(card, ".plaque");
    expect(plaques).toHaveLength(2);
    expect(plaques[0].textContent).toContain("20,5°");
    expect(plaques[1].textContent).not.toContain("°");
  });

  it("keeps the room name on plaques without a temperature", async () => {
    const card = await mount();
    const [withValue, withoutValue] = $$(card, ".plaque");
    expect(withValue.className).toContain("valued");
    expect(withoutValue.className).not.toContain("valued");
  });

  it("opens the detail panel on room tap instead of switching a light", async () => {
    const hass = makeHass();
    const card = await mount(hass);
    $(card, ".plaque").click();
    await card.updateComplete;
    expect($(card, ".panel h2").textContent).toBe("Küche");
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it("toggles a placed lamp when it is tapped", async () => {
    const hass = makeHass();
    const card = await mount(hass);
    $$(card, ".fixture")[0].click();
    expect(hass.callService).toHaveBeenCalledWith("homeassistant", "toggle", { entity_id: "light.spot" });
  });

  it("disables unreachable lamps", async () => {
    const card = await mount();
    expect($$<HTMLButtonElement>(card, ".fixture")[1].disabled).toBe(true);
  });

  it("opens more-info on hold and does not also toggle", async () => {
    vi.useFakeTimers();
    const hass = makeHass();
    const card = await mount(hass);
    const events: string[] = [];
    card.addEventListener("hass-more-info", (e) => events.push((e as CustomEvent).detail.entityId));
    const lamp = $$(card, ".fixture")[0];
    lamp.dispatchEvent(new Event("pointerdown"));
    vi.advanceTimersByTime(600);
    lamp.click();
    vi.useRealTimers();
    expect(events).toEqual(["light.spot"]);
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it("adds up quick taps on the thermostat and respects its limits", async () => {
    const hass = makeHass([entity("climate.a", "heat", { temperature: 21, target_temp_step: 0.5, max_temp: 21.5 })]);
    const card = await mount(hass);
    $(card, ".plaque").click();
    await card.updateComplete;
    $(card, '[aria-label="Wärmer"]').click();
    await card.updateComplete;
    expect($(card, ".stepper output").textContent).toBe("21,5°");
    $(card, '[aria-label="Wärmer"]').click();
    expect(hass.callService).toHaveBeenLastCalledWith("climate", "set_temperature", { entity_id: "climate.a", temperature: 21.5 });
    $(card, '[aria-label="Kälter"]').click();
    expect(hass.callService).toHaveBeenLastCalledWith("climate", "set_temperature", { entity_id: "climate.a", temperature: 21 });
  });

  it("keeps the switch on the real state until Home Assistant reports a change", async () => {
    const hass = makeHass();
    const card = await mount(hass);
    $(card, ".plaque").click();
    await card.updateComplete;
    const input = $<HTMLInputElement>(card, ".switch input");
    input.click();
    expect(input.checked).toBe(true);
    expect(hass.callService).toHaveBeenCalledWith("homeassistant", "toggle", { entity_id: "light.gruppe" });
  });

  it("forgets the selection when the open room leaves the config, and keeps the mode", async () => {
    const card = await mount();
    $(card, ".plaque").click();
    $$(card, ".modes button")[1].click();
    await card.updateComplete;
    card.setConfig({ ...config, rooms: [config.rooms[1]] });
    await card.updateComplete;
    expect(card.shadowRoot!.querySelector(".panel")).toBeNull();
    expect($(card, ".scene").getAttribute("class")).toContain("klima");
  });

  it("does not swallow the next tap after a hold that slid off the lamp", async () => {
    vi.useFakeTimers();
    const hass = makeHass();
    const card = await mount(hass);
    const lamp = $$(card, ".fixture")[0];
    lamp.dispatchEvent(new Event("pointerdown"));
    vi.advanceTimersByTime(600);
    lamp.dispatchEvent(new Event("pointerleave"));
    lamp.click();
    vi.useRealTimers();
    expect(hass.callService).toHaveBeenCalledOnce();
  });

  it("shows a stale group as unreachable in the panel", async () => {
    const hass = makeHass([entity("light.gruppe", "on", { brightness: 255, entity_id: ["light.tot"] })]);
    const card = await mount(hass);
    $(card, ".plaque").click();
    await card.updateComplete;
    expect($(card, ".row small").textContent).toBe("Nicht erreichbar");
    expect($<HTMLInputElement>(card, ".switch input").disabled).toBe(true);
  });

  it("disables a dock button whose lamps are all without power", async () => {
    const hass = makeHass([entity("light.balkon", "on", { entity_id: ["light.tot"] })]);
    const card = await mount(hass);
    const button = $$<HTMLButtonElement>(card, ".dock button").find((b) => b.textContent!.includes("Balkon"))!;
    expect(button.disabled).toBe(true);
    expect(button.className).not.toContain("on");
  });

  describe("devices", () => {
    const withDevices: IsoplanConfig = {
      ...config,
      rooms: [{ ...config.rooms[0], devices: [
        { entity: "switch.tv", name: "TV", power: "sensor.tv", x: 100, y: 200 },
        { entity: "switch.kalt", name: "Kühlschrank", confirm: true },
        { entity: "switch.weg", name: "Weg", x: 300, y: 300 },
      ] }, config.rooms[1]],
    };
    const hassWithDevices = () => makeHass([
      entity("switch.tv", "on"),
      entity("sensor.tv", "123.4", { unit_of_measurement: "W" }),
      entity("switch.kalt", "on"),
      entity("switch.weg", "unavailable"),
    ]);
    const open = async (hass: ReturnType<typeof makeHass>) => {
      const card = await mount(hass, withDevices);
      $(card, ".plaque").click();
      await card.updateComplete;
      return card;
    };

    it("marks only positioned devices on the plan", async () => {
      const card = await mount(hassWithDevices(), withDevices);
      expect($$(card, ".device")).toHaveLength(2);
    });

    it("lists every device with its consumption in the panel", async () => {
      const card = await open(hassWithDevices());
      const rows = $$(card, ".device-row");
      expect(rows).toHaveLength(3);
      expect(rows[0].textContent).toContain("123 W");
      expect(rows[2].textContent).toContain("Nicht erreichbar");
    });

    it("switches a plain device with one tap", async () => {
      const hass = hassWithDevices();
      const card = await open(hass);
      $$(card, ".device")[0].click();
      expect(hass.callService).toHaveBeenCalledWith("homeassistant", "toggle", { entity_id: "switch.tv" });
    });

    it("asks for a second tap before switching off a protected device", async () => {
      const hass = hassWithDevices();
      const card = await open(hass);
      const input = () => $$<HTMLInputElement>(card, ".device-row .switch input")[1];
      input().click();
      await card.updateComplete;
      expect(hass.callService).not.toHaveBeenCalled();
      expect($$(card, ".device-row")[1].textContent).toContain("Nochmal tippen");
      input().click();
      expect(hass.callService).toHaveBeenCalledWith("homeassistant", "toggle", { entity_id: "switch.kalt" });
    });

    it("forgets the first tap after a few seconds", async () => {
      vi.useFakeTimers();
      const hass = hassWithDevices();
      const card = await mount(hass, withDevices);
      $(card, ".plaque").click();
      await card.updateComplete;
      const input = $$<HTMLInputElement>(card, ".device-row .switch input")[1];
      input.click();
      vi.advanceTimersByTime(5000);
      input.click();
      vi.useRealTimers();
      expect(hass.callService).not.toHaveBeenCalled();
    });

    it("switches a protected device on with one tap", async () => {
      const hass = makeHass([entity("switch.kalt", "off"), entity("switch.tv", "off"), entity("switch.weg", "off")]);
      const card = await open(hass);
      $$<HTMLInputElement>(card, ".device-row .switch input")[1].click();
      expect(hass.callService).toHaveBeenCalledWith("homeassistant", "toggle", { entity_id: "switch.kalt" });
    });

    it("does not switch an unreachable device", async () => {
      const hass = hassWithDevices();
      const card = await open(hass);
      expect($$<HTMLButtonElement>(card, ".device")[1].disabled).toBe(true);
      expect($$<HTMLInputElement>(card, ".device-row .switch input")[2].disabled).toBe(true);
    });
  });

  it("closes the panel with Escape", async () => {
    const card = await mount();
    $(card, ".plaque").click();
    await card.updateComplete;
    $(card, "ha-card").dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await card.updateComplete;
    expect(card.shadowRoot!.querySelector(".panel")).toBeNull();
  });

  it("sets the target temperature by one step", async () => {
    const hass = makeHass();
    const card = await mount(hass);
    $(card, ".plaque").click();
    await card.updateComplete;
    $(card, '[aria-label="Wärmer"]').click();
    expect(hass.callService).toHaveBeenCalledWith("climate", "set_temperature", { entity_id: "climate.a", temperature: 21.5 });
  });

  it("dims through brightness_pct", async () => {
    const hass = makeHass();
    const card = await mount(hass);
    $(card, ".plaque").click();
    await card.updateComplete;
    const range = $<HTMLInputElement>(card, ".dim");
    range.value = "40";
    range.dispatchEvent(new Event("change"));
    expect(hass.callService).toHaveBeenCalledWith("light", "turn_on", { entity_id: "light.gruppe", brightness_pct: 40 });
  });

  it("reports unreachable lamps in the panel", async () => {
    const card = await mount();
    $(card, ".plaque").click();
    await card.updateComplete;
    expect($(card, ".note").textContent).toContain("1 Lampe ist nicht erreichbar");
  });

  it("switches to the climate view with a scale and hides lamps", async () => {
    const card = await mount();
    $$(card, ".modes button")[1].click();
    await card.updateComplete;
    expect($(card, ".scene").getAttribute("class")).toContain("klima");
    expect($$(card, ".fixture")).toHaveLength(0);
    expect($(card, ".scale").textContent).toContain("16°");
  });

  it("turns all lights off from the dock", async () => {
    const hass = makeHass();
    const card = await mount(hass);
    const button = $$(card, ".dock button").find((b) => b.textContent!.includes("Alle aus"))!;
    button.click();
    expect(hass.callService).toHaveBeenCalledWith("light", "turn_off", { entity_id: "light.alle" });
  });

  it("uses the night theme after sunset", async () => {
    const card = await mount(makeHass([entity("sun.sun", "below_horizon", { elevation: -20 })]));
    expect($(card, "ha-card").className).toContain("night");
    expect($(card, ".dusk").getAttribute("style")).toContain("opacity:1.000");
  });

  it("crossfades to a separate night image when one is configured", async () => {
    const card = await mount(makeHass([entity("sun.sun", "below_horizon", { elevation: -20 })]), { ...config, image_night: "/nacht.webp" });
    expect($(card, ".night-plan").getAttribute("href")).toBe("/nacht.webp");
    expect(card.shadowRoot!.querySelector(".dusk")).toBeNull();
  });

  it("shows a product image instead of the drawn lamp", async () => {
    const room = { ...config.rooms[0], fixtures: [{ entity: "light.spot", type: "play" as const, x: 10, y: 10, image: "/local/play.png" }] };
    const card = await mount(makeHass(), { ...config, rooms: [room] });
    expect($(card, ".fixture img").getAttribute("src")).toBe("/local/play.png");
  });

  it("shows a helpful error when a service call fails", async () => {
    const hass = makeHass();
    hass.callService.mockRejectedValueOnce(new Error("offline"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const card = await mount(hass);
    $$(card, ".fixture")[0].click();
    await new Promise((resolve) => setTimeout(resolve));
    await card.updateComplete;
    expect($(card, ".error").textContent).toContain("Verbindung");
    spy.mockRestore();
  });

  it("ignores hass updates that do not touch its entities", async () => {
    const hass = makeHass();
    const card = await mount(hass);
    const spy = vi.spyOn(card as unknown as { render(): unknown }, "render");
    card.hass = { ...hass, states: { ...hass.states, "sensor.fremd": entity("sensor.fremd", "1") } };
    await card.updateComplete;
    expect(spy).not.toHaveBeenCalled();
    card.hass = { ...hass, states: { ...hass.states, "light.spot": entity("light.spot", "off") } };
    await card.updateComplete;
    expect(spy).toHaveBeenCalledOnce();
  });
});

describe("isoplan-card-editor", () => {
  async function mountEditor(): Promise<{ editor: IsoplanCardEditor; changes: IsoplanConfig[] }> {
    const editor = document.createElement("isoplan-card-editor") as IsoplanCardEditor;
    editor.hass = makeHass([entity("light.neu", "off", { friendly_name: "Neu" })]);
    editor.setConfig(config);
    const changes: IsoplanConfig[] = [];
    editor.addEventListener("config-changed", (e) => changes.push((e as CustomEvent).detail.config));
    document.body.append(editor);
    await editor.updateComplete;
    const plan = editor.shadowRoot!.querySelector<HTMLElement>(".plan")!;
    plan.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1536, height: 1024 }) as DOMRect;
    return { editor, changes };
  }

  it("offers only lights that are not placed yet", async () => {
    const { editor } = await mountEditor();
    const options = [...editor.shadowRoot!.querySelectorAll("select option")].map((o) => o.getAttribute("value"));
    expect(options).toContain("light.neu");
    expect(options).not.toContain("light.spot");
  });

  it("places the chosen lamp in the room under the click", async () => {
    const { editor, changes } = await mountEditor();
    const select = editor.shadowRoot!.querySelector<HTMLSelectElement>("select")!;
    select.value = "light.neu";
    select.dispatchEvent(new Event("change"));
    await editor.updateComplete;
    editor.shadowRoot!.querySelector<HTMLButtonElement>("button.action")!.click();
    await editor.updateComplete;
    editor.shadowRoot!.querySelector<HTMLElement>(".plan")!.dispatchEvent(new MouseEvent("click", { clientX: 700, clientY: 100, bubbles: true }));
    expect(changes.at(-1)!.rooms[1].fixtures).toEqual([{ entity: "light.neu", type: "spot", x: 700, y: 100 }]);
    expect(config.rooms[1].fixtures).toBeUndefined();
  });

  it("refuses a click outside every room with a clear message", async () => {
    const { editor, changes } = await mountEditor();
    const select = editor.shadowRoot!.querySelector<HTMLSelectElement>("select")!;
    select.value = "light.neu";
    select.dispatchEvent(new Event("change"));
    await editor.updateComplete;
    editor.shadowRoot!.querySelector<HTMLButtonElement>("button.action")!.click();
    await editor.updateComplete;
    editor.shadowRoot!.querySelector<HTMLElement>(".plan")!.dispatchEvent(new MouseEvent("click", { clientX: 1200, clientY: 900, bubbles: true }));
    await editor.updateComplete;
    expect(changes).toHaveLength(0);
    expect(editor.shadowRoot!.querySelector(".hint")!.textContent).toContain("außerhalb");
  });

  it("does not grab an existing lamp while placing a new one", async () => {
    const { editor, changes } = await mountEditor();
    const select = editor.shadowRoot!.querySelector<HTMLSelectElement>("select")!;
    select.value = "light.neu";
    select.dispatchEvent(new Event("change"));
    await editor.updateComplete;
    editor.shadowRoot!.querySelector<HTMLButtonElement>("button.action")!.click();
    await editor.updateComplete;
    const pin = editor.shadowRoot!.querySelector<HTMLElement>(".pin")!;
    pin.dispatchEvent(new PointerEvent("pointerdown", { clientX: 100, clientY: 100, bubbles: true }));
    pin.dispatchEvent(new PointerEvent("pointerup", { clientX: 100, clientY: 100, bubbles: true }));
    pin.dispatchEvent(new MouseEvent("click", { clientX: 110, clientY: 110, bubbles: true }));
    expect(changes).toHaveLength(1);
    expect(changes[0].rooms[0].fixtures!.map((f) => f.entity)).toEqual(["light.spot", "light.tot", "light.neu"]);
    expect(changes[0].rooms[0].fixtures![0]).toMatchObject({ x: 100, y: 100 });
  });

  it("drops a dragged lamp where the pointer is released", async () => {
    const { editor, changes } = await mountEditor();
    const pin = editor.shadowRoot!.querySelector<HTMLElement>(".pin")!;
    pin.setPointerCapture = () => undefined;
    pin.dispatchEvent(new PointerEvent("pointerdown", { clientX: 100, clientY: 100, pointerId: 1, bubbles: true }));
    pin.dispatchEvent(new PointerEvent("pointermove", { clientX: 150, clientY: 150, pointerId: 1, bubbles: true }));
    pin.dispatchEvent(new PointerEvent("pointerup", { clientX: 200, clientY: 210, pointerId: 1, bubbles: true }));
    expect(changes.at(-1)!.rooms[0].fixtures![0]).toMatchObject({ x: 200, y: 210 });
  });

  it("nudges the focused lamp with arrow keys", async () => {
    const { editor, changes } = await mountEditor();
    const pin = editor.shadowRoot!.querySelector<HTMLElement>(".pin")!;
    pin.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(changes.at(-1)!.rooms[0].fixtures![0].x).toBe(104);
  });
});

describe("examples/beispiel.yaml", () => {
  const example = parse(readFileSync("examples/beispiel.yaml", "utf8")) as IsoplanConfig;

  it("is a valid config that covers the four example rooms", () => {
    const resolved = resolveConfig(example);
    expect(resolved.rooms.map((r) => r.id)).toEqual(["wohnen", "kueche", "schlafzimmer", "buero"]);
  });

  it("only references entities provided by the demo", async () => {
    const source = readFileSync("demo/mock-hass.ts", "utf8");
    const missing = [...watchedEntities(resolveConfig(example))].filter((id) => {
      const [, name] = id.split(".");
      return !source.includes(id) && !source.includes(name.replace(/_\d+$/, "")) && id !== "sun.sun";
    });
    expect(missing).toEqual([]);
  });

  it("places every lamp inside its room", async () => {
    const { containsPoint } = await import("./geometry");
    const outside = example.rooms.flatMap((room) =>
      [...(room.fixtures ?? []), ...(room.devices ?? [])].filter((f) => !containsPoint(room.area, [f.x!, f.y!])).map((f) => f.entity));
    expect(outside).toEqual([]);
  });
});
