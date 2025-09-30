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
  version: "15.24", // 2025年9月現在の最新パッチ
  lastUpdated: "2025-09-30",
  updateNotes: "シャード値の更新: アダプティブフォースの詳細化、スキルヘイスト/移動速度/行動妨害耐性追加",
  
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
        ja: "+5.4 ADまたは+9 AP（アダプティブ）",
        en: "+5.4 AD or +9 AP (Adaptive)"
      },
      category: "offense",
      iconPath: "perk-images/StatMods/StatModsAdaptiveForceIcon.png",
      gameValue: "5.4 AD / 9 AP"
    },
    {
      id: 5007,
      name: {
        ja: "スキルヘイスト",
        en: "Ability Haste"
      },
      description: {
        ja: "スキルのクールダウンを短縮します",
        en: "Reduces cooldown of abilities"
      },
      value: {
        ja: "+8 スキルヘイスト",
        en: "+8 Ability Haste"
      },
      category: "offense",
      iconPath: "perk-images/StatMods/StatModsCDRScalingIcon.png",
      gameValue: 8
    },

    // ===================
    // フレックス統計シャード (Flex)
    // ===================
    // フレックス統計シャード (Flex)
    // ===================
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
        ja: "+5.4 ADまたは+9 AP（アダプティブ）",
        en: "+5.4 AD or +9 AP (Adaptive)"
      },
      category: "flex",
      iconPath: "perk-images/StatMods/StatModsAdaptiveForceIcon.png",
      gameValue: "5.4 AD / 9 AP"
    },
    {
      id: 5004,
      name: {
        ja: "移動速度",
        en: "Movement Speed"
      },
      description: {
        ja: "移動速度を増加させます",
        en: "Increases movement speed"
      },
      value: {
        ja: "+2% 移動速度",
        en: "+2% Movement Speed"
      },
      category: "flex",
      iconPath: "perk-images/StatMods/StatModsMovementSpeedIcon.png",
      gameValue: 0.02
    },
    {
      id: 5001,
      name: {
        ja: "体力 (スケール)",
        en: "Health (Scaling)"
      },
      description: {
        ja: "最大体力を増加させます（レベルに応じてスケール）",
        en: "Increases maximum health (scales with level)"
      },
      value: {
        ja: "+10～180 HP（Lv1-18で増加）",
        en: "+10-180 HP (Lv1-18)"
      },
      category: "flex",
      iconPath: "perk-images/StatMods/StatModsHealthScalingIcon.png",
      gameValue: "10 + (10 * (level - 1))"
    },

    // ===================
    // 防御系統計シャード (Defense)
    // ===================
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
        ja: "+65 HP",
        en: "+65 HP"
      },
      category: "defense",
      iconPath: "perk-images/StatMods/StatModsHealthIcon.png",
      gameValue: 65
    },
    {
      id: 5002,
      name: {
        ja: "行動妨害耐性&Slow耐性",
        en: "Tenacity and Slow Resist"
      },
      description: {
        ja: "行動妨害効果とスロウの効果時間を短縮します",
        en: "Reduces duration of disables and slows"
      },
      value: {
        ja: "+10% 行動妨害耐性&Slow耐性",
        en: "+10% Tenacity and Slow Resist"
      },
      category: "defense",
      iconPath: "perk-images/StatMods/StatModsTenacityIcon.png",
      gameValue: 0.1
    },
    {
      id: 5003,
      name: {
        ja: "体力 (スケール)",
        en: "Health (Scaling)"
      },
      description: {
        ja: "最大体力を増加させます（レベルに応じてスケール）",
        en: "Increases maximum health (scales with level)"
      },
      value: {
        ja: "+10～180 HP（Lv1-18で増加）",
        en: "+10-180 HP (Lv1-18)"
      },
      category: "defense",
      iconPath: "perk-images/StatMods/StatModsHealthScalingIcon.png",
      gameValue: "10 + (10 * (level - 1))"
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
- 2025-09-30 (v15.24): 統計シャード大幅更新
  * アダプティブフォース: +9 → +5.4 ADまたは+9 AP に詳細化
  * 攻撃シャード: スキルヘイスト +8 を追加
  * フレックスシャード: 移動速度 +2% MS を追加
  * フレックス/防御: 体力スケール +10～180 HP (Lv1-18) に変更
  * 防御シャード: 行動妨害耐性&Slow耐性 +10% を追加
  * 物理防御・魔法防御シャードを削除
- 2025-09-26 (v15.18): 体力固定値シャード（+65体力）とスケール体力シャード（+15-140体力）を正しく分離
- 2024-01-15 (v14.1): 初回データ作成（過去データ）
*/