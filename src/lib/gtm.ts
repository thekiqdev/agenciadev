declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const GTM_ID_RE = /^GTM-[A-Z0-9]+$/;

export function normalizeGtmId(raw?: string | null): string {
  const id = String(raw ?? "").trim().toUpperCase();
  return GTM_ID_RE.test(id) ? id : "";
}

export function pushGtmEvent(event: string, payload: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
}

/** Evento único para conversões (formulário e WhatsApp). Uma tag no GTM. */
export const CONVERSION_EVENT = "conversion";

export function pushConversion(conversionType: string, payload: Record<string, unknown> = {}): void {
  pushGtmEvent(CONVERSION_EVENT, { conversion_type: conversionType, ...payload });
}
