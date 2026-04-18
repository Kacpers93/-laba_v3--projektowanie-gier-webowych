export type Stage6ObjectType = 'ship' | 'station' | 'wreck' | 'mission' | 'environment';

export type MenuNodeId =
  | 'ship-status'
  | 'inventory'
  | 'reactor'
  | 'modules'
  | 'weapons'
  | 'commodities'
  | 'dock'
  | 'missions'
  | 'salvage'
  | 'repair'
  | 'services'
  | 'trade'
  | 'help'
  | 'exit';

export interface MenuNodeDefinition {
  readonly id: MenuNodeId;
  readonly label: string;
  readonly description: string;
  readonly hotkey?: string;
  readonly actionId?: string;
  readonly children?: ReadonlyArray<MenuNodeId>;
}

export interface MenuProfile {
  readonly id: string;
  readonly rootNodeIds: ReadonlyArray<MenuNodeId>;
  readonly enabledNodeIds: ReadonlyArray<MenuNodeId>;
  readonly defaultExpandedPath?: ReadonlyArray<MenuNodeId>;
  readonly labelOverrides?: Readonly<Partial<Record<MenuNodeId, string>>>;
  readonly descriptionOverrides?: Readonly<Partial<Record<MenuNodeId, string>>>;
  readonly nodeExtensions?: Readonly<Partial<Record<MenuNodeId, ReadonlyArray<MenuNodeId>>>>;
}

export interface Stage6ObjectContext {
  readonly objectType: Stage6ObjectType;
  readonly menuProfile: string;
  readonly availableNodes: ReadonlyArray<MenuNodeId>;
  readonly sceneLabel: string;
  readonly sceneDescription: string;
}

export interface MenuTreeNode {
  readonly id: MenuNodeId;
  readonly label: string;
  readonly description: string;
  readonly hotkey?: string;
  readonly actionId?: string;
  readonly children: ReadonlyArray<MenuTreeNode>;
}

export interface HudTargetInfo {
  readonly id: string;
  readonly name: string;
  readonly range: number;
  readonly shield: number;
  readonly armor: number;
}

export interface HudReactorInfo {
  readonly reactorType: string;
  readonly output: string | null;
  readonly load: string | null;
  readonly notes?: string;
}

export interface HudShipInfo {
  readonly name: string;
  readonly velocity: number;
  readonly cargoUsed: number;
  readonly cargoCapacity: number;
  readonly credits: number;
  readonly reactor: HudReactorInfo;
}

export interface HudRadarContact {
  readonly id: string;
  readonly dx: number;
  readonly dy: number;
  readonly category: 'ship' | 'station' | 'wreck' | 'gate' | 'celestial' | 'environment';
}

export interface Stage6FrameModel {
  readonly mode: 'game' | 'ui';
  readonly context: Stage6ObjectContext;
  readonly ship: HudShipInfo;
  readonly target: HudTargetInfo | null;
  readonly radarRange: number;
  readonly radarContacts: ReadonlyArray<HudRadarContact>;
}
