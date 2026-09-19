/** Deterministic 4-digit "case file" number derived from an entity id, for the dossier motif. */
export function dossierNumber(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return `Nº ${String(hash % 9999).padStart(4, "0")}`;
}
