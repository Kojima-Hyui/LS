export interface ChampionData {
  type: string;
  format: string;
  version: string;
  data: Record<string, Champion>;
}

export interface Champion {
  version: string;
  id: string;
  key: string;
  name: string;
  title: string;
  blurb: string;
  info: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  tags: string[];
  partype: string;
  stats: ChampionStats;
}

export interface ChampionDetail extends Champion {
  skins: ChampionSkin[];
  lore: string;
  allytips: string[];
  enemytips: string[];
  spells: ChampionSpell[];
  passive: ChampionPassive;
  recommended: any[];
}

export interface ChampionSkin {
  id: string;
  num: number;
  name: string;
  chromas: boolean;
}

export interface ChampionSpell {
  id: string;
  name: string;
  description: string;
  tooltip: string;
  leveltip: {
    label: string[];
    effect: string[];
  };
  maxrank: number;
  cooldown: number[];
  cooldownBurn: string;
  cost: number[];
  costBurn: string;
  datavalues: any;
  effect: (number[] | null)[];
  effectBurn: (string | null)[];
  vars: any[];
  costType: string;
  maxammo: string;
  range: number[];
  rangeBurn: string;
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  resource: string;
}

export interface ChampionPassive {
  name: string;
  description: string;
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface ChampionStats {
  hp: number;
  hpperlevel: number;
  mp: number;
  mpperlevel: number;
  movespeed: number;
  armor: number;
  armorperlevel: number;
  spellblock: number;
  spellblockperlevel: number;
  attackrange: number;
  hpregen: number;
  hpregenperlevel: number;
  mpregen: number;
  mpregenperlevel: number;
  crit: number;
  critperlevel: number;
  attackdamage: number;
  attackdamageperlevel: number;
  attackspeedperlevel: number;
  attackspeed: number;
}

export interface ChampionFilters {
  name: string;
  roles: string[];
  lanes: string[];
  difficulty: number[];
  tags: string[];
  sortBy: 'name-asc' | 'name-desc' | 'difficulty-asc' | 'difficulty-desc' | 'attack-desc' | 'defense-desc' | 'magic-desc';
}

// Lane and Role mappings for Japanese
export const LANES = {
  TOP: 'top',
  JUNGLE: 'jungle', 
  MIDDLE: 'middle',
  BOTTOM: 'bottom',
  SUPPORT: 'utility'
} as const;

export const LANE_NAMES = {
  [LANES.TOP]: 'トップ',
  [LANES.JUNGLE]: 'ジャングル',
  [LANES.MIDDLE]: 'ミッド',
  [LANES.BOTTOM]: 'ボット',
  [LANES.SUPPORT]: 'サポート'
} as const;

export const ROLE_NAMES = {
  'Fighter': 'ファイター',
  'Tank': 'タンク',
  'Assassin': 'アサシン',
  'Mage': 'メイジ',
  'Marksman': 'マークスマン',
  'Support': 'サポート'
} as const;