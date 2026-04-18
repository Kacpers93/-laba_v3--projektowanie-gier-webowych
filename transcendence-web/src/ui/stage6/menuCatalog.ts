import type { MenuNodeDefinition, MenuNodeId } from './types';

const catalogEntries: ReadonlyArray<MenuNodeDefinition> = [
  {
    id: 'ship-status',
    label: 'Ship Status',
    description: 'Status i podsystemy aktualnej jednostki.',
    hotkey: 'S',
    children: ['inventory', 'reactor', 'modules'],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    description: 'Ladownia i elementy transportowane przez obiekt.',
    hotkey: 'I',
    actionId: 'open-inventory',
  },
  {
    id: 'reactor',
    label: 'Reactor',
    description: 'Panel reaktora pozostaje otwarty na dalsze dane runtime.',
    hotkey: 'R',
    actionId: 'open-reactor',
  },
  {
    id: 'modules',
    label: 'Modules',
    description: 'Zarzadzanie slotami i modulami.',
    hotkey: 'M',
    actionId: 'open-modules',
  },
  {
    id: 'weapons',
    label: 'Weapons',
    description: 'Konfiguracja uzbrojenia i grup ognia.',
    hotkey: 'W',
    actionId: 'open-weapons',
  },
  {
    id: 'commodities',
    label: 'Commodities',
    description: 'Podglad towarow i cennikow.',
    hotkey: 'C',
    actionId: 'open-commodities',
  },
  {
    id: 'dock',
    label: 'Dock',
    description: 'Operacje dokowania i opuszczania stacji.',
    hotkey: 'D',
    actionId: 'open-dock',
  },
  {
    id: 'missions',
    label: 'Missions',
    description: 'Aktywne i dostepne kontrakty.',
    hotkey: 'N',
    actionId: 'open-missions',
  },
  {
    id: 'salvage',
    label: 'Salvage',
    description: 'Odzysk i przetwarzanie wrakow.',
    hotkey: 'V',
    actionId: 'open-salvage',
  },
  {
    id: 'repair',
    label: 'Repair',
    description: 'Naprawy kadluba i modulow.',
    hotkey: 'P',
    actionId: 'open-repair',
  },
  {
    id: 'services',
    label: 'Services',
    description: 'Serwis stacji i uslugi lokalne.',
    hotkey: 'E',
    actionId: 'open-services',
  },
  {
    id: 'trade',
    label: 'Trade',
    description: 'Szybki handel i wymiana towarowa.',
    hotkey: 'T',
    actionId: 'open-trade',
  },
  {
    id: 'help',
    label: 'Help',
    description: 'Podstawowe informacje i legenda sterowania.',
    hotkey: 'H',
    actionId: 'open-help',
  },
  {
    id: 'exit',
    label: 'Exit',
    description: 'Powrot do trybu lotu.',
    hotkey: 'Esc',
    actionId: 'exit-ui',
  },
];

export const MENU_CATALOG: Readonly<Record<MenuNodeId, MenuNodeDefinition>> = catalogEntries.reduce(
  (accumulator, entry) => {
    accumulator[entry.id] = entry;
    return accumulator;
  },
  {} as Record<MenuNodeId, MenuNodeDefinition>,
);
