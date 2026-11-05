export interface HassEntity {
  readonly entity_id: string;
  readonly state: string;
  readonly attributes: Readonly<Record<string, any>>;
}

export interface Hass {
  readonly states: Readonly<Record<string, HassEntity | undefined>>;
  readonly locale?: { readonly language?: string };
  readonly language?: string;
  callService(domain: string, service: string, data: Record<string, unknown>): Promise<unknown>;
}

export function domainOf(entityId: string): string {
  return entityId.split(".")[0];
}

export function isUnreachable(entity: HassEntity | undefined): boolean {
  return !entity || entity.state === "unavailable" || entity.state === "unknown";
}
