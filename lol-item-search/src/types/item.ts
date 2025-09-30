export interface ItemData {
  type: string;
  version: string;
  data: Record<string, Item>;
}

export interface Item {
  name: string;
  description: string;
  colloq: string;
  plaintext: string;
  into?: string[];
  from?: string[];
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  gold: {
    base: number;
    purchasable: boolean;
    total: number;
    sell: number;
  };
  tags: string[];
  maps: Record<string, boolean>;
  stats: Record<string, number>;
  effect?: Record<string, string>;
  hideFromAll?: boolean;
  inStore?: boolean;
  requiredChampion?: string;
  requiredAlly?: string;
  depth?: number;
}

export interface ItemSet {
  title: string;
  type: string;
  map: string;
  mode: string;
  priority: boolean;
  sortrank: number;
  blocks: ItemSetBlock[];
  associatedChampions?: number[];
  associatedMaps?: number[];
  preferredItemSlots?: PreferredItemSlot[];
}

export interface ItemSetBlock {
  type: string;
  recMath: boolean;
  items: ItemSetItem[];
}

export interface ItemSetItem {
  id: string;
  count: number;
}

export interface PreferredItemSlot {
  id: string;
  preferredItemSlot: number;
}

export interface SearchFilters {
  keyword: string;
  map: string;
  priceMin: number;
  priceMax: number;
  purchasableOnly: boolean;
  sortBy: 'name-asc' | 'price-asc' | 'price-desc';
  tags: string[];
}

export interface BuildItem {
  id: string;
  item: Item;
  blockType: string;
}

export interface GroupConstraint {
  id: string;
  name: string;
  maxItems: number;
  items: string[];
}