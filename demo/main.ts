import { mdiClose, mdiCoffeeOutline, mdiDesk, mdiDesktopTowerMonitor, mdiDishwasher, mdiFlowerOutline, mdiFridgeOutline, mdiLightbulbGroupOutline, mdiMinus, mdiPlus, mdiPowerPlugOutline, mdiTelevision, mdiWashingMachine } from "@mdi/js";
import { parse } from "yaml";
import source from "../examples/beispiel.yaml?raw";
import planUrl from "../examples/beispiel.svg?url";
import "../src/isoplan-card";
import type { IsoplanCard } from "../src/isoplan-card";
import type { IsoplanCardEditor } from "../src/isoplan-card-editor";
import type { IsoplanConfig } from "../src/config";
import { createMockHass } from "./mock-hass";

const ICONS: Record<string, string> = {
  "mdi:close": mdiClose, "mdi:minus": mdiMinus, "mdi:plus": mdiPlus,
  "mdi:coffee-outline": mdiCoffeeOutline, "mdi:desk": mdiDesk, "mdi:desktop-tower-monitor": mdiDesktopTowerMonitor,
  "mdi:dishwasher": mdiDishwasher, "mdi:fridge-outline": mdiFridgeOutline, "mdi:power-plug-outline": mdiPowerPlugOutline,
  "mdi:television": mdiTelevision, "mdi:washing-machine": mdiWashingMachine,
  "mdi:flower-outline": mdiFlowerOutline, "mdi:lightbulb-group-outline": mdiLightbulbGroupOutline,
};

/** Ersatz für das <ha-icon> aus Home Assistant, nur in der Demo. */
customElements.define("ha-icon", class extends HTMLElement {
  static observedAttributes = ["icon"];
  connectedCallback(): void {
    this.paint();
  }
  attributeChangedCallback(): void {
    this.paint();
  }
  private paint(): void {
    const path = ICONS[this.getAttribute("icon") ?? ""] ?? "";
    const root = this.shadowRoot ?? this.attachShadow({ mode: "open" });
    root.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%" style="display:block;width:var(--mdc-icon-size,20px);height:var(--mdc-icon-size,20px)" fill="currentColor"><path d="${path}"/></svg>`;
  }
});
customElements.define("ha-card", class extends HTMLElement {});

let config: IsoplanConfig = { ...parse(source), image: planUrl };
const query = new URLSearchParams(location.search);
const host = document.querySelector<HTMLElement>("#card")!;
const card = document.createElement("isoplan-card") as IsoplanCard;
const mock = createMockHass((hass) => { card.hass = hass; if (editor) editor.hass = hass; });
let editor: IsoplanCardEditor | undefined;

card.setConfig(config);
card.hass = mock.hass();
host.append(card);

function setElevation(elevation: number): void {
  document.querySelector("#elevation")!.textContent = `${elevation}°`;
  mock.set("sun.sun", { attributes: { elevation } });
}

document.querySelector<HTMLInputElement>("#sun")!.addEventListener("input", (e) => setElevation(Number((e.target as HTMLInputElement).value)));
document.querySelector("#toggle-all")!.addEventListener("click", () => {
  for (const n of ["24", "25", "26", "27", "28"]) void mock.hass().callService("homeassistant", "toggle", { entity_id: `light.wohnzimmer_decke_decke_${n}` });
});

function openEditor(): void {
  editor = document.createElement("isoplan-card-editor") as IsoplanCardEditor;
  editor.hass = mock.hass();
  editor.setConfig(config);
  editor.addEventListener("config-changed", (e) => {
    config = (e as CustomEvent).detail.config;
    editor!.setConfig(config);
    card.setConfig(config);
  });
  host.prepend(editor);
}
document.querySelector("#edit")!.addEventListener("click", openEditor);

const initial = query.get("sun");
if (initial !== null) setElevation(Number(initial));
if (query.has("editor")) openEditor();
(window as unknown as { demo: unknown }).demo = { mock, card };
