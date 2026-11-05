export type Point = readonly [number, number];
export type FixtureType = "spot" | "strip" | "play" | "tube" | "candle" | "bulb";
export type Mode = "licht" | "klima";
export type NightSetting = "auto" | "on" | "off";

export const FIXTURE_TYPES: readonly FixtureType[] = ["spot", "strip", "play", "tube", "candle", "bulb"];

export interface FixtureConfig {
  readonly entity: string;
  readonly type: FixtureType;
  readonly x: number;
  readonly y: number;
  readonly name?: string;
  /** Eigenes Produktbild, z. B. /local/isoplan/hue-play.png */
  readonly image?: string;
  /** Lichtradius in Bildkoordinaten. */
  readonly reach?: number;
  /** Drehung des Symbols in Grad, für Lichtleisten entlang einer Wand. */
  readonly angle?: number;
}

export interface DeviceConfig {
  readonly entity: string;
  readonly name?: string;
  readonly icon?: string;
  /** Sensor mit dem aktuellen Verbrauch. */
  readonly power?: string;
  /** Ausschalten erst nach einem zweiten Tipp, etwa beim Kühlschrank. */
  readonly confirm?: boolean;
  readonly x?: number;
  readonly y?: number;
}

export interface LightGroupConfig {
  readonly entity: string;
  readonly name?: string;
}

export interface RoomConfig {
  readonly id: string;
  readonly name: string;
  readonly icon?: string;
  readonly area: readonly Point[];
  readonly label: Point;
  readonly temperature?: string;
  readonly climate?: string;
  readonly lights?: readonly LightGroupConfig[];
  readonly fixtures?: readonly FixtureConfig[];
  readonly devices?: readonly DeviceConfig[];
}

export interface ExtraConfig {
  readonly entity: string;
  readonly name: string;
  readonly icon?: string;
}

export interface IsoplanConfig {
  readonly type: string;
  readonly image: string;
  readonly image_night?: string;
  readonly coordinates?: Point;
  readonly night?: NightSetting;
  readonly sun_entity?: string;
  readonly default_mode?: Mode;
  readonly temperature_range?: Point;
  readonly all_lights?: string;
  readonly extras?: readonly ExtraConfig[];
  readonly rooms: readonly RoomConfig[];
}

export type ResolvedConfig = IsoplanConfig &
  Required<Pick<IsoplanConfig, "coordinates" | "night" | "sun_entity" | "default_mode" | "temperature_range">>;

const MIN_AREA_POINTS = 3;
const ROOM_ID = /^[\w-]+$/;

function assertPoint(value: unknown, where: string): asserts value is Point {
  const ok = Array.isArray(value) && value.length === 2 && value.every((n) => Number.isFinite(n));
  if (!ok) throw new Error(`${where} muss ein Punkt [x, y] sein.`);
}

function assertEntity(value: unknown, where: string): void {
  if (typeof value !== "string" || !value.includes(".")) throw new Error(`${where}: entity fehlt oder ist ungültig.`);
}

function validateFixture(fixture: FixtureConfig, roomId: string): void {
  const where = `Raum „${roomId}“, Lampe ${fixture?.entity ?? "ohne entity"}`;
  if (!fixture?.entity) throw new Error(`${where}: entity fehlt.`);
  if (!FIXTURE_TYPES.includes(fixture.type)) {
    throw new Error(`${where}: type muss einer von ${FIXTURE_TYPES.join(", ")} sein.`);
  }
  assertPoint([fixture.x, fixture.y], `${where}: x/y`);
}

function validateDevice(device: DeviceConfig, roomId: string): void {
  const where = `Raum „${roomId}“, devices`;
  assertEntity(device?.entity, where);
  if ((device.x === undefined) !== (device.y === undefined)) throw new Error(`${where}: x und y gehören zusammen.`);
  if (device.x !== undefined) assertPoint([device.x, device.y], `${where}: x/y`);
}

function validateRoom(room: RoomConfig, seen: Set<string>): void {
  if (!room?.id) throw new Error("Jeder Raum braucht eine id.");
  if (!ROOM_ID.test(room.id)) throw new Error(`Raum-id „${room.id}“: nur Buchstaben, Ziffern, _ und - sind erlaubt.`);
  if (seen.has(room.id)) throw new Error(`Raum-id „${room.id}“ kommt doppelt vor.`);
  seen.add(room.id);
  if (!room.name) throw new Error(`Raum „${room.id}“ braucht einen name.`);
  if (!Array.isArray(room.area) || room.area.length < MIN_AREA_POINTS) {
    throw new Error(`Raum „${room.id}“: area braucht mindestens ${MIN_AREA_POINTS} Punkte.`);
  }
  room.area.forEach((p) => assertPoint(p, `Raum „${room.id}“, area`));
  assertPoint(room.label, `Raum „${room.id}“, label`);
  room.fixtures?.forEach((f) => validateFixture(f, room.id));
  room.lights?.forEach((l) => assertEntity(l?.entity, `Raum „${room.id}“, lights`));
  room.devices?.forEach((d) => validateDevice(d, room.id));
}

/** Prüft die Kartenkonfiguration und füllt Standardwerte, ohne die Eingabe zu verändern. */
export function resolveConfig(config: IsoplanConfig): ResolvedConfig {
  if (!config?.image) throw new Error("image fehlt: Pfad zum Grundriss angeben, z. B. /local/isoplan/wohnung.webp.");
  if (!Array.isArray(config.rooms) || config.rooms.length === 0) throw new Error("rooms fehlt: mindestens einen Raum angeben.");
  const seen = new Set<string>();
  config.rooms.forEach((room) => validateRoom(room, seen));
  const range = config.temperature_range ?? ([16, 24] as const);
  assertPoint(range, "temperature_range");
  const coordinates = config.coordinates ?? ([1536, 1024] as const);
  assertPoint(coordinates, "coordinates");
  if (coordinates[0] <= 0 || coordinates[1] <= 0) throw new Error("coordinates: Breite und Höhe müssen größer als 0 sein.");
  if (config.all_lights !== undefined) assertEntity(config.all_lights, "all_lights");
  config.extras?.forEach((e) => assertEntity(e?.entity, "extras"));
  if (range[0] >= range[1]) throw new Error("temperature_range: der erste Wert muss kleiner als der zweite sein.");
  return {
    ...config,
    coordinates,
    night: config.night ?? "auto",
    sun_entity: config.sun_entity ?? "sun.sun",
    default_mode: config.default_mode ?? "licht",
    temperature_range: range,
  };
}

/** Alle Entitäten, deren Änderung ein neues Rendern auslöst. */
export function watchedEntities(config: ResolvedConfig): ReadonlySet<string> {
  const ids = [
    config.sun_entity,
    config.all_lights,
    ...(config.extras ?? []).map((e) => e.entity),
    ...config.rooms.flatMap((room) => [
      room.temperature,
      room.climate,
      ...(room.lights ?? []).map((l) => l.entity),
      ...(room.fixtures ?? []).map((f) => f.entity),
      ...(room.devices ?? []).flatMap((d) => [d.entity, d.power]),
    ]),
  ];
  return new Set(ids.filter((id): id is string => Boolean(id)));
}
