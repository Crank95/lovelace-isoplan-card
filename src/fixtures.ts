import { html, svg, type TemplateResult } from "lit";
import type { FixtureConfig, FixtureType } from "./config";

/** Eigene Zeichnungen in der Form der echten Leuchten, Strichstärke einheitlich auf 24er-Raster. */
const SHAPES: Readonly<Record<FixtureType, TemplateResult>> = {
  spot: svg`<ellipse cx="12" cy="12" rx="9" ry="6"/><ellipse class="core" cx="12" cy="12" rx="4.5" ry="2.8"/>`,
  strip: svg`<rect x="2" y="10" width="20" height="4" rx="2"/><path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01"/>`,
  play: svg`<rect class="core" x="5" y="4" width="14" height="13" rx="1.5"/><path d="M9 21h6M12 17v4"/>`,
  tube: svg`<rect class="core" x="1.5" y="9.5" width="21" height="5" rx="2.5"/>`,
  candle: svg`<path class="core" d="M12 3c3 4 4.5 6.5 4.5 9a4.5 4.5 0 0 1-9 0c0-2.500 1.500-5 4.500-9Z"/><path d="M10 19.500h4M10.500 22h3"/>`,
  bulb: svg`<circle class="core" cx="12" cy="10" r="6.500"/><path d="M9.500 19.500h5M10.500 22h3"/>`,
};

export function fixtureGlyph(fixture: FixtureConfig): TemplateResult {
  if (fixture.image) return html`<img src=${fixture.image} alt="" draggable="false" />`;
  return html`<svg viewBox="0 0 24 24" aria-hidden="true">${SHAPES[fixture.type]}</svg>`;
}

export const FIXTURE_LABELS: Readonly<Record<FixtureType, string>> = {
  spot: "Spot (Hue color spot)",
  strip: "Lichtleiste (Hue Lightstrip)",
  play: "Play-Leuchte (Hue Play)",
  tube: "Lichtröhre (Play gradient tube)",
  candle: "Kerze (Hue color candle)",
  bulb: "Lampe (Hue color lamp)",
};
