/**
 * League of Legends 統計シャード (Stat Shards) データ
 * 
 * 最新パッチ情報: https://leagueoflegends.fandom.com/wiki/Rune_(League_of_Legends)
 * 更新時の参考: https://app.mobalytics.gg/lol/runes
 */

export interface StatShardData {
  version: string;
  lastUpdated: string;
  updateNotes: string;
  shards: StatShard[];
}

export interface StatShard {
  id: number;
  name: {
    ja: string;
    en: string;
  };
  description: {
    ja: string;
    en: string;
  };
  value: {
    ja: string;
    en: string;
  };
  category: 'offense' | 'flex' | 'defense';
  iconPath: string;
  gameValue: number | string; // ゲーム内での実際の値
}

export const STAT_SHARDS_DATA: StatShardData = {
  version: "15.18", // 2025年9月現在の最新パッチ
  lastUpdated: "2025-09-26",
  updateNotes: "2025年シーズン15最新パッチでの統計シャード値（体力固定値シャード修正）",
  
  shards: [
    // ===================
    // 攻撃系統計シャード (Offense)
    // ===================
    {
      id: 5005,
      name: {
        ja: "攻撃速度",
        en: "Attack Speed"
      },
      description: {
        ja: "攻撃速度を増加させます",
        en: "Increases attack speed"
      },
      value: {
        ja: "+10% 攻撃速度",
        en: "+10% Attack Speed"
      },
      category: "offense",
      iconPath: "perk-images/StatMods/StatModsAttackSpeedIcon.png",
      gameValue: 0.1
    },
    {
      id: 5007,
      name: {
        ja: "適応攻撃力",
        en: "Adaptive Force"
      },
      description: {
        ja: "攻撃力または魔力を増加させます（高い方に適用）",
        en: "Increases Attack Damage or Ability Power (whichever is higher)"
      },
      value: {
        ja: "+9 適応攻撃力",
        en: "+9 Adaptive Force"
      },
      category: "offense",
      iconPath: "perk-images/StatMods/StatModsAdaptiveForceIcon.png",
      gameValue: 9
    },
    {
      id: 5008,
      name: {
        ja: "適応攻撃力",
        en: "Adaptive Force"
      },
      description: {
        ja: "攻撃力または魔力を増加させます（高い方に適用）",
        en: "Increases Attack Damage or Ability Power (whichever is higher)"
      },
      value: {
        ja: "+9 適応攻撃力",
        en: "+9 Adaptive Force"
      },
      category: "offense",
      iconPath: "perk-images/StatMods/StatModsAdaptiveForceIcon.png",
      gameValue: 9
    },

    // ===================
    // フレックス統計シャード (Flex)
    // ===================
    {
      id: 5002,
      name: {
        ja: "適応攻撃力",
        en: "Adaptive Force"
      },
      description: {
        ja: "攻撃力または魔力を増加させます（高い方に適用）",
        en: "Increases Attack Damage or Ability Power (whichever is higher)"
      },
      value: {
        ja: "+9 適応攻撃力",
        en: "+9 Adaptive Force"
      },
      category: "flex",
      iconPath: "perk-images/StatMods/StatModsAdaptiveForceIcon.png",
      gameValue: 9
    },
    {
      id: 5003,
      name: {
        ja: "適応攻撃力",
        en: "Adaptive Force"
      },
      description: {
        ja: "攻撃力または魔力を増加させます（高い方に適用）",
        en: "Increases Attack Damage or Ability Power (whichever is higher)"
      },
      value: {
        ja: "+9 適応攻撃力",
        en: "+9 Adaptive Force"
      },
      category: "flex",
      iconPath: "perk-images/StatMods/StatModsAdaptiveForceIcon.png",
      gameValue: 9
    },
    {
      id: 5001,
      name: {
        ja: "体力",
        en: "Health"
      },
      description: {
        ja: "最大体力を固定値で増加させます",
        en: "Increases maximum health by a flat amount"
      },
      value: {
        ja: "+65 体力",
        en: "+65 Health"
      },
      category: "flex",
      iconPath: "perk-images/StatMods/StatModsHealthIcon.png",
      gameValue: 65
    },

    // ===================
    // 防御系統計シャード (Defense)
    // ===================
    {
      id: 5011,
      name: {
        ja: "体力",
        en: "Health"
      },
      description: {
        ja: "最大体力を固定値で増加させます",
        en: "Increases maximum health by a flat amount"
      },
      value: {
        ja: "+65 体力",
        en: "+65 Health"
      },
      category: "defense",
      iconPath: "perk-images/StatMods/StatModsHealthIcon.png",
      gameValue: 65
    },
    {
      id: 5012,
      name: {
        ja: "体力 (スケール)",
        en: "Health (Scaling)"
      },
      description: {
        ja: "最大体力を増加させます（レベルに応じてスケール）",
        en: "Increases maximum health (scales with level)"
      },
      value: {
        ja: "+15-140 体力 (レベルに応じて)",
        en: "+15-140 Health (based on level)"
      },
      category: "defense",
      iconPath: "perk-images/StatMods/StatModsHealthScalingIcon.png",
      gameValue: "15 + (7.4 * (level - 1))"
    },
    {
      id: 5013,
      name: {
        ja: "物理防御",
        en: "Armor"
      },
      description: {
        ja: "物理ダメージに対する防御力を増加させます",
        en: "Increases defense against physical damage"
      },
      value: {
        ja: "+6 物理防御",
        en: "+6 Armor"
      },
      category: "defense",
      iconPath: "perk-images/StatMods/StatModsArmorIcon.png",
      gameValue: 6
    },
    {
      id: 5014,
      name: {
        ja: "魔法防御",
        en: "Magic Resistance"
      },
      description: {
        ja: "魔法ダメージに対する防御力を増加させます",
        en: "Increases defense against magic damage"
      },
      value: {
        ja: "+8 魔法防御",
        en: "+8 Magic Resistance"
      },
      category: "defense",
      iconPath: "perk-images/StatMods/StatModsMagicResIcon.png",
      gameValue: 8
    }
  ]
};

// ===================
// ヘルパー関数
// ===================

/**
 * カテゴリー別に統計シャードを取得
 */
export function getStatShardsByCategory(category: 'offense' | 'flex' | 'defense'): StatShard[] {
  return STAT_SHARDS_DATA.shards.filter(shard => shard.category === category);
}

/**
 * IDで統計シャードを取得
 */
export function getStatShardById(id: number): StatShard | undefined {
  return STAT_SHARDS_DATA.shards.find(shard => shard.id === id);
}

/**
 * 全カテゴリーの統計シャードを取得（従来のAPI互換）
 */
export function getAllStatShards(): Array<{
  id: number;
  name: string;
  icon: string;
  value: string;
  category: 'offense' | 'flex' | 'defense';
}> {
  return STAT_SHARDS_DATA.shards.map(shard => ({
    id: shard.id,
    name: shard.name.ja,
    icon: shard.iconPath,
    value: shard.value.ja,
    category: shard.category
  }));
}

/**
 * パッチ情報を取得
 */
export function getStatShardsVersion(): {
  version: string;
  lastUpdated: string;
  updateNotes: string;
} {
  return {
    version: STAT_SHARDS_DATA.version,
    lastUpdated: STAT_SHARDS_DATA.lastUpdated,
    updateNotes: STAT_SHARDS_DATA.updateNotes
  };
}

/*
CHANGE LOG:
- 2025-09-26 (v15.18): 体力固定値シャード（+65体力）とスケール体力シャード（+15-140体力）を正しく分離
- 2024-01-15 (v14.1): 初回データ作成（過去データ）
*/