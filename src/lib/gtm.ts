const GTM_ID_RE = /^GTM-[A-Z0-9]+$/;

export function normalizeGtmId(raw?: string | null): string {
  const id = String(raw ?? "").trim().toUpperCase();
  return GTM_ID_RE.test(id) ? id : "";
}
