import type { Point } from "./config";

export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface Zoom {
  readonly scale: number;
  readonly x: number;
  readonly y: number;
}

export interface Label {
  readonly id: string;
  /** Mittelpunkt in Pixeln. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export const NO_ZOOM: Zoom = { scale: 1, x: 0, y: 0 };

const ZOOM_PADDING = 1.18;
const MAX_ZOOM = 2.8;
const LABEL_GAP = 6;
const MAX_ITERATIONS = 24;

export function boundingBox(points: readonly Point[]): Box {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

export function containsPoint(polygon: readonly Point[], [px, py]: Point): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * Transformation (Ursprung oben links), die `box` in den Bereich `visible` der Bühne einpasst.
 * `box` in Pixeln der ungezoomten Bühne.
 */
export function zoomTo(box: Box, visible: Box): Zoom {
  const scale = Math.min(
    MAX_ZOOM,
    visible.width / (box.width * ZOOM_PADDING),
    visible.height / (box.height * ZOOM_PADDING),
  );
  const fitted = Math.max(1, scale);
  return {
    scale: fitted,
    x: visible.x + visible.width / 2 - (box.x + box.width / 2) * fitted,
    y: visible.y + visible.height / 2 - (box.y + box.height / 2) * fitted,
  };
}

const overlap = (a: Label, b: Label): { x: number; y: number } => ({
  x: (a.width + b.width) / 2 + LABEL_GAP - Math.abs(a.x - b.x),
  y: (a.height + b.height) / 2 + LABEL_GAP - Math.abs(a.y - b.y),
});

function clampInto(label: Label, bounds: { width: number; height: number }): Label {
  const halfW = label.width / 2;
  const halfH = label.height / 2;
  return {
    ...label,
    x: Math.min(bounds.width - halfW, Math.max(halfW, label.x)),
    y: Math.min(bounds.height - halfH, Math.max(halfH, label.y)),
  };
}

function clearObstacles(label: Label, obstacles: readonly Label[], bounds: { width: number; height: number }): Label {
  return obstacles.reduce((current, obstacle) => {
    const gap = overlap(current, obstacle);
    if (gap.x <= 0 || gap.y <= 0) return current;
    const onX = gap.x < gap.y;
    const sign = (onX ? current.x - obstacle.x : current.y - obstacle.y) >= 0 ? 1 : -1;
    return clampInto({ ...current, x: current.x + (onX ? gap.x * sign : 0), y: current.y + (onX ? 0 : gap.y * sign) }, bounds);
  }, label);
}

/** Schiebt Plaketten auf der kürzesten Achse auseinander, weg von festen Hindernissen und hält sie in der Bühne. */
export function separateLabels(labels: readonly Label[], bounds: { width: number; height: number }, obstacles: readonly Label[] = []): readonly Label[] {
  let current = labels.map((label) => clampInto(label, bounds));
  for (let round = 0; round < MAX_ITERATIONS; round++) {
    let moved = false;
    for (let i = 0; i < current.length; i++) {
      for (let j = i + 1; j < current.length; j++) {
        const gap = overlap(current[i], current[j]);
        if (gap.x <= 0 || gap.y <= 0) continue;
        moved = true;
        const onX = gap.x < gap.y;
        const push = (onX ? gap.x : gap.y) / 2;
        const sign = (onX ? current[i].x - current[j].x : current[i].y - current[j].y) >= 0 ? 1 : -1;
        const shift = (label: Label, direction: number) =>
          clampInto({ ...label, x: label.x + (onX ? push * direction : 0), y: label.y + (onX ? 0 : push * direction) }, bounds);
        current = current.map((label, index) => (index === i ? shift(label, sign) : index === j ? shift(label, -sign) : label));
      }
    }
    const cleared = current.map((label) => clearObstacles(label, obstacles, bounds));
    moved = moved || cleared.some((label, index) => label !== current[index]);
    current = cleared;
    if (!moved) break;
  }
  return current;
}
