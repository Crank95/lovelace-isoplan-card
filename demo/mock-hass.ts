import type { Hass, HassEntity } from "../src/hass";

const light = (entity_id: string, friendly_name: string, state: string, attrs: Record<string, unknown> = {}): HassEntity => ({
  entity_id, state, attributes: { friendly_name, ...attrs },
});
const entities: HassEntity[] = [
  light("sun.sun", "Sonne", "below_horizon", { elevation: -12 }),
  light("light.demo_wohnen", "Wohnen", "on", { brightness: 180, rgb_color: [255, 210, 175] }),
  light("light.demo_kueche", "Küche", "on", { brightness: 220 }),
  light("light.demo_schlafzimmer", "Schlafzimmer", "off"),
  light("light.demo_buero", "Büro", "off"),
  light("sensor.demo_wohnen", "Temperatur", "21.5", { unit_of_measurement: "°C" }),
  light("switch.demo_leselampe", "Leselampe", "off"),
];

export function createMockHass(onChange: (hass: Hass) => void): { hass: () => Hass; set: (id: string, patch: Partial<HassEntity>) => void } {
  let states = Object.fromEntries(entities.map((e) => [e.entity_id, e]));
  const build = (): Hass => ({
    states,
    locale: { language: "de" },
    callService: async (domain, service, data) => {
      console.info("callService", domain, service, data);
      const id = data.entity_id as string;
      const current = states[id];
      if (service === "toggle") set(id, { state: current.state === "on" ? "off" : "on" });
      if (service === "turn_off") set(id, { state: "off" });
      if (service === "turn_on") {
        const brightness = data.brightness_pct ? Math.round((Number(data.brightness_pct) / 100) * 255) : current.attributes.brightness ?? 255;
        set(id, { state: "on", attributes: { ...current.attributes, brightness } });
      }
      if (service === "set_temperature") set(id, { attributes: { ...current.attributes, temperature: data.temperature } });
    },
  });
  let hass = build();
  function set(id: string, patch: Partial<HassEntity>): void {
    states = { ...states, [id]: { ...states[id], ...patch } };
    hass = build();
    onChange(hass);
  }
  return { hass: () => hass, set };
}
