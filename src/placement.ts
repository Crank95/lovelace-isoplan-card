import type { DeviceConfig, FixtureConfig, IsoplanConfig, Point, RoomConfig } from "./config";
import { containsPoint } from "./geometry";

export type PlacedKind = "fixtures" | "devices";
type Placed = FixtureConfig | DeviceConfig;

export function roomAt(config: IsoplanConfig, point: Point): RoomConfig | undefined {
  return config.rooms.find((room) => containsPoint(room.area, point));
}

const itemsOf = (room: RoomConfig | undefined, kind: PlacedKind): readonly Placed[] => room?.[kind] ?? [];

const withRoom = (config: IsoplanConfig, roomId: string, kind: PlacedKind, change: (items: readonly Placed[]) => readonly Placed[]): IsoplanConfig => ({
  ...config,
  rooms: config.rooms.map((room) => (room.id === roomId ? { ...room, [kind]: change(itemsOf(room, kind)) } : room)),
});

export const addFixture = (config: IsoplanConfig, roomId: string, item: Placed, kind: PlacedKind = "fixtures"): IsoplanConfig =>
  withRoom(config, roomId, kind, (items) => [...items, item]);

export const updateFixture = (config: IsoplanConfig, roomId: string, index: number, patch: Partial<FixtureConfig & DeviceConfig>, kind: PlacedKind = "fixtures"): IsoplanConfig =>
  withRoom(config, roomId, kind, (items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

export const removeFixture = (config: IsoplanConfig, roomId: string, index: number, kind: PlacedKind = "fixtures"): IsoplanConfig =>
  withRoom(config, roomId, kind, (items) => items.filter((_, i) => i !== index));

/** Verschiebt eine Lampe oder ein Gerät; landet es in einem anderen Raum, wandert es dorthin. */
export function moveFixture(config: IsoplanConfig, roomId: string, index: number, point: Point, kind: PlacedKind = "fixtures"): IsoplanConfig {
  const [x, y] = point.map(Math.round);
  const item = itemsOf(config.rooms.find((room) => room.id === roomId), kind)[index];
  if (!item) return config;
  const target = roomAt(config, point);
  if (!target || target.id === roomId) return updateFixture(config, roomId, index, { x, y }, kind);
  return addFixture(removeFixture(config, roomId, index, kind), target.id, { ...item, x, y }, kind);
}

export function placedEntities(config: IsoplanConfig): ReadonlySet<string> {
  return new Set(config.rooms.flatMap((room) => [...(room.fixtures ?? []), ...(room.devices ?? [])].map((item) => item.entity)));
}
