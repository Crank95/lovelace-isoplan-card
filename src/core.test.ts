import { describe, expect, it } from "vitest";
import { resolveConfig, watchedEntities, type IsoplanConfig } from "./config";
import { nightFactor } from "./daylight";
import { boundingBox, containsPoint, separateLabels, zoomTo } from "./geometry";
import type { Hass, HassEntity } from "./hass";
import { kelvinToRgb, readEntity, readLight, readRoom } from "./light";
import { addFixture, moveFixture, placedEntities, removeFixture } from "./placement";
import { formatTemperature, readTemperature, temperatureColor } from "./temperature";

const entity = (entity_id: string, state: string, attributes: Record<string, unknown> = {}): HassEntity => ({ entity_id, state, attributes });
const hassWith = (...entities: HassEntity[]): Hass => ({
  states: Object.fromEntries(entities.map((e) => [e.entity_id, e])),
  callService: async () => undefined,
});

const base: IsoplanConfig = {
  type: "custom:isoplan-card",
  image: "/local/plan.webp",
  rooms: [
    { id: "a", name: "A", area: [[0, 0], [100, 0], [100, 100], [0, 100]], label: [50, 50] },
    { id: "b", name: "B", area: [[200, 0], [300, 0], [300, 100], [200, 100]], label: [250, 50] },
  ],
};

describe("resolveConfig", () => {
  it("fills defaults without changing the input", () => {
    const resolved = resolveConfig(base);
    expect(resolved.coordinates).toEqual([1536, 1024]);
    expect(resolved.night).toBe("auto");
    expect(base).not.toHaveProperty("night");
  });
  it.each([
    [{ ...base, image: "" }, "image fehlt"],
    [{ ...base, rooms: [] }, "rooms fehlt"],
    [{ ...base, rooms: [base.rooms[0], base.rooms[0]] }, "doppelt"],
    [{ ...base, rooms: [{ ...base.rooms[0], area: [[0, 0]] }] }, "mindestens 3"],
    [{ ...base, rooms: [{ ...base.rooms[0], label: [1] as never }] }, "Punkt"],
    [{ ...base, temperature_range: [24, 16] as const }, "kleiner"],
    [{ ...base, temperature_range: ["a", 2] as never }, "Punkt"],
    [{ ...base, coordinates: [1536, 0] as const }, "größer als 0"],
    [{ ...base, rooms: [{ ...base.rooms[0], id: 'a"b' }] }, "nur Buchstaben"],
    [{ ...base, extras: [{ name: "Balkon" } as never] }, "extras"],
    [{ ...base, all_lights: "kaputt" }, "all_lights"],
    [{ ...base, rooms: [{ ...base.rooms[0], devices: [{ entity: "switch.a", x: 1 }] }] }, "gehören zusammen"],
    [{ ...base, rooms: [{ ...base.rooms[0], devices: [{} as never] }] }, "devices"],
    [{ ...base, rooms: [{ ...base.rooms[0], lights: [{} as never] }] }, "lights"],
    [{ ...base, rooms: [{ ...base.rooms[0], fixtures: [{ entity: "light.x", type: "laser" as never, x: 1, y: 1 }] }] }, "type muss"],
  ])("rejects invalid config %#", (config, message) => {
    expect(() => resolveConfig(config as IsoplanConfig)).toThrow(message);
  });
  it("collects every watched entity", () => {
    const ids = watchedEntities(resolveConfig({
      ...base,
      all_lights: "light.all",
      extras: [{ entity: "light.b", name: "Balkon" }],
      rooms: [{ ...base.rooms[0], temperature: "sensor.t", climate: "climate.c", lights: [{ entity: "light.g" }], fixtures: [{ entity: "light.f", type: "spot", x: 1, y: 1 }] }],
    }));
    expect([...ids].sort()).toEqual(["climate.c", "light.all", "light.b", "light.f", "light.g", "sensor.t", "sun.sun"]);
  });
});

describe("readLight / readRoom", () => {
  it("uses rgb_color and lifts dim brightness", () => {
    const reading = readLight(entity("light.a", "on", { brightness: 26, rgb_color: [1, 2, 3] }));
    expect(reading.color).toEqual([1, 2, 3]);
    expect(reading.intensity).toBeGreaterThan(0.2);
  });
  it("falls back to kelvin", () => {
    expect(readLight(entity("light.a", "on", { color_temp_kelvin: 2700 })).color).toEqual(kelvinToRgb(2700));
    expect(kelvinToRgb(2700)[0]).toBe(255);
    expect(kelvinToRgb(2700)[2]).toBeLessThan(kelvinToRgb(6500)[2]);
  });
  it("treats unavailable as off and unreachable", () => {
    expect(readLight(entity("light.a", "unavailable"))).toMatchObject({ on: false, unreachable: true });
    expect(readLight(undefined)).toMatchObject({ on: false, unreachable: true });
  });
  it("treats a group as unreachable when every member is gone", () => {
    const hass = hassWith(
      entity("light.group", "on", { brightness: 255, entity_id: ["light.a", "light.b"] }),
      entity("light.a", "unavailable"),
      entity("light.b", "unavailable"),
    );
    expect(readEntity("light.group", hass)).toMatchObject({ on: false, unreachable: true });
  });

  it("keeps a group on while at least one member is reachable", () => {
    const hass = hassWith(
      entity("light.group", "on", { brightness: 255, entity_id: ["light.a", "light.b"] }),
      entity("light.a", "unavailable"),
      entity("light.b", "on"),
    );
    expect(readEntity("light.group", hass)).toMatchObject({ on: true, unreachable: false });
  });

  it("reads groups without member data as before", () => {
    expect(readEntity("light.a", hassWith(entity("light.a", "on", { brightness: 255 }))).on).toBe(true);
  });

  it("prefers fixtures over a stale group that still reports on", () => {
    const room = { ...base.rooms[0], lights: [{ entity: "light.group" }], fixtures: [{ entity: "light.m", type: "spot" as const, x: 1, y: 1 }] };
    const result = readRoom(room, hassWith(entity("light.group", "on", { brightness: 255 }), entity("light.m", "unavailable")));
    expect(result.on).toBe(false);
    expect(result.unreachableCount).toBe(1);
  });
  it("falls back to groups when no fixture is placed", () => {
    const room = { ...base.rooms[0], lights: [{ entity: "light.group" }] };
    expect(readRoom(room, hassWith(entity("light.group", "on", { brightness: 128 }))).on).toBe(true);
  });
  it("mixes colours weighted by intensity", () => {
    const room = { ...base.rooms[0], fixtures: [
      { entity: "light.r", type: "spot" as const, x: 1, y: 1 },
      { entity: "light.b", type: "spot" as const, x: 2, y: 2, reach: 50 },
    ] };
    const result = readRoom(room, hassWith(
      entity("light.r", "on", { brightness: 255, rgb_color: [255, 0, 0] }),
      entity("light.b", "on", { brightness: 255, rgb_color: [0, 0, 255] }),
    ));
    expect(result.color).toEqual([128, 0, 128]);
    expect(result.fixtures[1].reach).toBe(50);
  });
});

describe("nightFactor", () => {
  const sun = (elevation?: number, state = "above_horizon") => entity("sun.sun", state, elevation === undefined ? {} : { elevation });
  it.each([[30, 0], [6, 0], [0, 0.5], [-6, 1], [-55, 1]])("elevation %d gives %d", (elevation, expected) => {
    expect(nightFactor("auto", sun(elevation))).toBeCloseTo(expected);
  });
  it("honours fixed settings and missing data", () => {
    expect(nightFactor("on", sun(30))).toBe(1);
    expect(nightFactor("off", sun(-30))).toBe(0);
    expect(nightFactor("auto", undefined)).toBe(0);
    expect(nightFactor("auto", sun(undefined, "below_horizon"))).toBe(1);
  });
});

describe("temperature", () => {
  it("is neutral in the middle and clamps at the ends", () => {
    expect(temperatureColor(20, [16, 24])).toEqual([246, 240, 228]);
    expect(temperatureColor(0, [16, 24])).toEqual([92, 148, 222]);
    expect(temperatureColor(40, [16, 24])).toEqual([232, 112, 58]);
  });
  it("reads and formats with a German comma", () => {
    expect(readTemperature(entity("sensor.t", "20.47"))).toBe(20.47);
    expect(readTemperature(entity("sensor.t", "unavailable"))).toBeUndefined();
    expect(readTemperature(entity("sensor.t", "abc"))).toBeUndefined();
    expect(formatTemperature(20.47, "de")).toBe("20,5°");
    expect(formatTemperature(undefined)).toBe("–");
  });
});

describe("geometry", () => {
  const square = base.rooms[0].area;
  it("computes bounding box and containment", () => {
    expect(boundingBox(square)).toEqual({ x: 0, y: 0, width: 100, height: 100 });
    expect(containsPoint(square, [50, 50])).toBe(true);
    expect(containsPoint(square, [150, 50])).toBe(false);
  });
  it("centres the room in the visible area and caps zoom", () => {
    const zoom = zoomTo({ x: 0, y: 0, width: 100, height: 100 }, { x: 0, y: 0, width: 1000, height: 1000 });
    expect(zoom.scale).toBe(2.8);
    expect(zoom.x).toBeCloseTo(500 - 50 * 2.8);
  });
  it("never zooms below the overview", () => {
    expect(zoomTo({ x: 0, y: 0, width: 900, height: 900 }, { x: 0, y: 0, width: 500, height: 500 }).scale).toBe(1);
  });
  it("separates overlapping labels and keeps them in bounds", () => {
    const labels = [
      { id: "a", x: 100, y: 100, width: 80, height: 30 },
      { id: "b", x: 110, y: 104, width: 80, height: 30 },
      { id: "c", x: 118, y: 96, width: 80, height: 30 },
      { id: "d", x: 5, y: 5, width: 80, height: 30 },
    ];
    const result = separateLabels(labels, { width: 400, height: 300 });
    for (let i = 0; i < result.length; i++) {
      expect(result[i].x).toBeGreaterThanOrEqual(40);
      for (let j = i + 1; j < result.length; j++) {
        const dx = Math.abs(result[i].x - result[j].x);
        const dy = Math.abs(result[i].y - result[j].y);
        expect(dx >= 80 || dy >= 30).toBe(true);
      }
    }
  });
  it("moves labels off fixed obstacles without moving the obstacles", () => {
    const obstacle = { id: "gerät", x: 100, y: 100, width: 24, height: 24 };
    const [label] = separateLabels([{ id: "a", x: 105, y: 105, width: 80, height: 30 }], { width: 400, height: 300 }, [obstacle]);
    expect(Math.abs(label.x - obstacle.x) >= 52 || Math.abs(label.y - obstacle.y) >= 27).toBe(true);
  });

  it("leaves separate labels where they are", () => {
    const labels = [{ id: "a", x: 100, y: 100, width: 50, height: 20 }, { id: "b", x: 300, y: 100, width: 50, height: 20 }];
    expect(separateLabels(labels, { width: 500, height: 300 })).toEqual(labels);
  });
});

describe("placement", () => {
  const spot = { entity: "light.s", type: "spot" as const, x: 10, y: 10 };
  it("adds and removes immutably", () => {
    const added = addFixture(base, "a", spot);
    expect(base.rooms[0].fixtures).toBeUndefined();
    expect(placedEntities(added).has("light.s")).toBe(true);
    expect(removeFixture(added, "a", 0).rooms[0].fixtures).toEqual([]);
  });
  it("moves devices between rooms like lamps", () => {
    const placed = addFixture(base, "a", { entity: "switch.a", x: 10, y: 10 }, "devices");
    expect(placedEntities(placed).has("switch.a")).toBe(true);
    const moved = moveFixture(placed, "a", 0, [250, 50], "devices");
    expect(moved.rooms[0].devices).toEqual([]);
    expect(moved.rooms[1].devices?.[0]).toMatchObject({ entity: "switch.a", x: 250, y: 50 });
  });

  it("moves within a room and rounds", () => {
    const moved = moveFixture(addFixture(base, "a", spot), "a", 0, [20.4, 30.6]);
    expect(moved.rooms[0].fixtures?.[0]).toMatchObject({ x: 20, y: 31 });
  });
  it("hands the fixture to the room it lands in", () => {
    const moved = moveFixture(addFixture(base, "a", spot), "a", 0, [250, 50]);
    expect(moved.rooms[0].fixtures).toEqual([]);
    expect(moved.rooms[1].fixtures?.[0]).toMatchObject({ entity: "light.s", x: 250, y: 50 });
  });
  it("keeps the room when dropped outside every room and ignores unknown indexes", () => {
    const placed = addFixture(base, "a", spot);
    expect(moveFixture(placed, "a", 0, [150, 50]).rooms[0].fixtures?.[0]).toMatchObject({ x: 150 });
    expect(moveFixture(placed, "a", 5, [1, 1])).toBe(placed);
  });
});
