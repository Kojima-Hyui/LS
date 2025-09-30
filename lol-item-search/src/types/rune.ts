export interface Rune {
  id: number;
  name: string;
  shortDesc: string;
  longDesc: string;
  icon: string;
  tooltip: string;
}

export interface RuneTree {
  id: number;
  name: string;
  icon: string;
  slots: RuneSlot[];
}

export interface RuneSlot {
  runes: Rune[];
}

export interface RunePage {
  id: string;
  name: string;
  primaryTreeId: number;
  secondaryTreeId: number;
  selectedRunes: {
    primaryRunes: number[]; // 4つのメインルーン (各スロットから1つずつ)
    secondaryRunes: number[]; // 2つのサブルーン
  };
  statShards: {
    offense: number; // 攻撃系統計シャード
    flex: number; // フレックス統計シャード  
    defense: number; // 防御系統計シャード
  };
  createdAt: string;
  updatedAt: string;
}

export interface StatShard {
  id: number;
  name: string;
  icon: string;
  value: string;
  category: 'offense' | 'flex' | 'defense';
}