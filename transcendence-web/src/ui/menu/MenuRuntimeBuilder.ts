/**
 * MenuRuntimeBuilder – buduje runtime payload drzewa menu.
 * Wejście: profil + katalog + kontekst.
 * Wyjście: RuntimeMenuNode[] gotowe do renderowania.
 */

import { MENU_CATALOG } from './MenuCatalog';
import type { MenuRegistry } from './MenuRegistry';
import type { CatalogEntry, MenuProfile, MenuProfileId, RuntimeMenuNode } from '../types/menuTypes';

// ---------------------------------------------------------------------------
// Resolver skrotow literowych
// ---------------------------------------------------------------------------

/**
 * Przypisuje hotkey do kazdej pozycji w liscie.
 * Algorytm: pierwsza litera nazwy, przy kolizji kolejne litery, potem pierwsza wolna litera alfabetycznie.
 */
function resolveHotkeys(nodes: Array<{ label: string }>): string[] {
  const used = new Set<string>();
  const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

  return nodes.map(({ label }) => {
    const normalized = label.toLowerCase().replace(/[^a-z]/g, '');

    for (const char of normalized) {
      if (!used.has(char)) {
        used.add(char);
        return char;
      }
    }

    // Brak wolnej litery w nazwie — pierwsza wolna litera alfabetycznie
    for (const char of ALPHABET) {
      if (!used.has(char)) {
        used.add(char);
        return char;
      }
    }

    return '?';
  });
}

// ---------------------------------------------------------------------------
// Budowanie drzewa
// ---------------------------------------------------------------------------

function buildNode(
  entryId: string,
  catalog: Map<string, CatalogEntry>,
  labelOverride: string | undefined,
  hotkey: string,
  depth: number,
): RuntimeMenuNode {
  const entry = catalog.get(entryId);
  if (!entry) {
    return {
      id: entryId,
      label: labelOverride ?? entryId,
      hotkey,
      children: [],
      isLeaf: true,
    };
  }

  const label = labelOverride ?? entry.label;
  const childIds = entry.children ?? [];

  let children: RuntimeMenuNode[] = [];

  if (childIds.length > 0 && depth < 4) {
    const childNodes = childIds.map((id) => {
      const child = catalog.get(id);
      return { id, label: child?.label ?? id };
    });

    const childHotkeys = resolveHotkeys(childNodes);

    children = childIds.map((childId, index) =>
      buildNode(childId, catalog, undefined, childHotkeys[index] ?? '?', depth + 1),
    );
  }

  return {
    id: entryId,
    label,
    hotkey,
    children,
    action: entry.action,
    description: entry.description,
    isLeaf: children.length === 0,
  };
}

// ---------------------------------------------------------------------------
// Publiczny builder
// ---------------------------------------------------------------------------

export class MenuRuntimeBuilder {
  private readonly registry: MenuRegistry;

  public constructor(registry: MenuRegistry) {
    this.registry = registry;
  }

  /**
   * Buduje runtime drzewo menu dla podanego profilu.
   * @param profileId id profilu menu
   * @param availableNodes opcjonalny filtr – jesli podany, usuwane sa wezly spoza listy
   */
  public build(profileId: MenuProfileId, availableNodes?: string[]): RuntimeMenuNode[] {
    const profile = this.registry.get(profileId);
    if (!profile) {
      console.warn(`[MenuRuntimeBuilder] Unknown profile: ${profileId}`);
      return [];
    }

    return this.buildFromProfile(profile, availableNodes);
  }

  private buildFromProfile(profile: MenuProfile, availableNodes?: string[]): RuntimeMenuNode[] {
    let rootIds = profile.rootNodes;

    if (availableNodes && availableNodes.length > 0) {
      const availableSet = new Set(availableNodes);
      rootIds = rootIds.filter((id) => availableSet.has(id));
    }

    const rootLabels = rootIds.map((id) => {
      const entry = MENU_CATALOG.get(id);
      const override = profile.labelOverrides?.[id];
      return { label: override ?? entry?.label ?? id };
    });

    const hotkeys = resolveHotkeys(rootLabels);

    return rootIds.map((id, index) =>
      buildNode(id, MENU_CATALOG, profile.labelOverrides?.[id], hotkeys[index] ?? '?', 0),
    );
  }
}
