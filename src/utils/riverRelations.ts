import type { GeoElement, CategoryType } from '../types/geography';

export const isWatercourse = (category: CategoryType) => category === 'rios' || category === 'afluentes';

/** Reject self-reference and cycles, including tributaries of tributaries. */
export function availableRiverParents(elements: readonly GeoElement[], elementId: string): GeoElement[] {
  return elements.filter(candidate => {
    if (!isWatercourse(candidate.category)) return false;
    const visited = new Set([elementId]);
    let current: GeoElement | undefined = candidate;
    while (current) {
      if (visited.has(current.id)) return false;
      visited.add(current.id);
      current = elements.find(e => e.id === current!.parentRiverId);
    }
    return true;
  });
}

/** Upgrade legacy full snapshots once, without resurrecting deliberately deleted elements. */
export function migrateStoredElements(saved: unknown, defaults: readonly GeoElement[]): GeoElement[] {
  if (saved && typeof saved === 'object' && 'version' in saved && saved.version === 3 &&
      'elements' in saved && Array.isArray(saved.elements)) return saved.elements;
  if (!Array.isArray(saved)) return [...defaults];
  const result: GeoElement[] = [...saved];
  for (const element of defaults.filter(e => e.category === 'afluentes')) {
    if (!result.some(e => e.id === element.id) && result.some(e => e.id === element.parentRiverId && isWatercourse(e.category))) result.push(element);
  }
  return result;
}

/** Keep the drainage slope consistent throughout a receiver's tributary network. */
export function inheritRiverSlopes(elements: readonly GeoElement[], riverId: string): GeoElement[] {
  const result = elements.map(e => ({ ...e }));
  const pending = [riverId], visited = new Set<string>();
  while (pending.length) {
    const id = pending.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const river = result.find(e => e.id === id);
    if (!river) continue;
    for (const child of result.filter(e => e.parentRiverId === id)) {
      child.vertiente = river.vertiente;
      pending.push(child.id);
    }
  }
  return result;
}
