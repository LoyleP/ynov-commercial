/**
 * DOM ids for components. One scheme everywhere: kebab case, from the outside in,
 * `<component>-<element>` and, for one record among many, `<component>-<record id>-<element>`.
 *
 *   domId("module-row", row.id)                    → "module-row-3f2a…"
 *   domId("module-row", row.id, "meeting-status")  → "module-row-3f2a…-meeting-status"
 *
 * Anything that appears twice in the document (the dashboard draws each module as a table row and
 * as a phone card) gets a different component name for each, so ids never repeat on a page.
 */
export function domId(...parts: (string | number | null | undefined)[]): string {
  return parts
    .filter((part): part is string | number => part !== null && part !== undefined)
    .map(String)
    .join("-")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
