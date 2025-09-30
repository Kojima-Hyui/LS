# 統計シャード メンテナンス ガイド

## 📋 概要
このドキュメントは League of Legends の統計シャード（Stat Shards）データの更新・メンテナンス手順を説明します。

## 🔄 更新タイミング
- **シーズン開始時**：大きな変更の可能性あり
- **ミッドシーズン アップデート**：バランス調整
- **プレシーズン**：システム刷新の可能性

## 📖 データソース（優先順）

### 1. 公式リソース
- **Riot Games公式**: https://www.leagueoflegends.com/ja-jp/news/game-updates/
- **パッチノート**: https://www.leagueoflegends.com/ja-jp/news/tags/patch-notes/

### 2. 信頼できるコミュニティソース
- **LoL Wiki**: https://leagueoflegends.fandom.com/wiki/Rune_(League_of_Legends)
- **Mobalytics**: https://app.mobalytics.gg/lol/runes
- **U.GG**: https://u.gg/lol/runes
- **OP.GG**: https://op.gg/modes/aram

### 3. ゲーム内確認
- クライアントの「コレクション」→「ルーン」で実際の値を確認

## 🛠️ 更新手順

### Step 1: 最新情報の確認
```bash
# 1. 最新パッチバージョンを確認
# Data Dragon API から最新バージョンを取得
curl https://ddragon.leagueoflegends.com/api/versions.json

# 2. パッチノートを確認
# 統計シャードの変更があるか確認
```

### Step 2: データファイルの更新
```typescript
// src/data/statShards.ts を編集

export const STAT_SHARDS_DATA: StatShardData = {
  version: "14.2", // ← 新しいパッチバージョン
  lastUpdated: "2024-01-30", // ← 更新日
  updateNotes: "パッチ14.2での変更内容", // ← 変更内容
  
  shards: [
    // 変更されたシャードの値を更新
    {
      id: 5005,
      // ... 新しい値
      value: {
        ja: "+12% 攻撃速度", // 例：10%から12%に変更
        en: "+12% Attack Speed"
      },
      gameValue: 0.12
    }
  ]
};
```

### Step 3: テスト
```bash
# アプリケーションの動作確認
npm run dev

# ルーンページで統計シャードが正しく表示されることを確認
# - 各カテゴリーのシャードが表示される
# - 値が正しく表示される
# - 選択機能が動作する
```

### Step 4: 履歴の記録
```typescript
// 変更履歴を記録（ファイル末尾に追加）
/*
CHANGE LOG:
- 2024-01-30 (v14.2): 攻撃速度シャード 10% → 12% に変更
- 2024-01-15 (v14.1): 初回データ作成
*/
```

## 🏗️ 新シャードの追加

もし新しい統計シャードが追加された場合：

```typescript
// 新しいシャードを shards 配列に追加
{
  id: 5015, // 新しいID
  name: {
    ja: "新しいシャード名",
    en: "New Shard Name"
  },
  description: {
    ja: "効果の説明",
    en: "Effect description"
  },
  value: {
    ja: "+XX 効果値",
    en: "+XX Effect Value"
  },
  category: "offense", // または "flex", "defense"
  iconPath: "perk-images/StatMods/NewShardIcon.png",
  gameValue: "計算式または固定値"
}
```

## 🔧 関連ファイルの更新

統計シャードを変更した場合、以下のファイルも確認：

### 1. RuneAPI の更新
```typescript
// src/lib/runeApi.ts
getStatShards() {
  return getAllStatShards(); // 新しいデータ関数を使用
}
```

### 2. 型定義の確認
```typescript
// src/types/rune.ts
// 新しいプロパティが追加された場合は型定義を更新
```

## 🧪 品質チェック

### 更新前チェックリスト
- [ ] 公式ソースで変更を確認
- [ ] 複数のソースで情報を照合
- [ ] ゲーム内クライアントで実際の値を確認

### 更新後チェックリスト
- [ ] アプリが正常に起動する
- [ ] 全カテゴリーのシャードが表示される
- [ ] 値が正確に表示される
- [ ] 選択・保存機能が動作する
- [ ] 日本語表示が正しい

## 📞 問題が発生した場合

### よくある問題
1. **シャードが表示されない**
   - データ構造を確認
   - インポート文を確認

2. **値が正しく表示されない**
   - 日本語・英語両方の値を確認
   - gameValue の型を確認

3. **カテゴリー分けが正しくない**
   - category フィールドを確認
   - getStatShardsByCategory 関数をテスト

## 📝 更新例

### パッチ15.19での更新例（仮想）
```typescript
// 変更前（v15.18）
{
  id: 5005,
  value: {
    ja: "+10% 攻撃速度",
    en: "+10% Attack Speed"
  },
  gameValue: 0.1
}

// 変更後（v15.19）
{
  id: 5005,
  value: {
    ja: "+12% 攻撃速度",
    en: "+12% Attack Speed"
  },
  gameValue: 0.12
}
```

## 🚀 自動化の可能性

将来的な改善案：
- GitHub Actions による定期的なデータチェック
- Community Dragon API との比較スクリプト
- 変更検出時の自動プルリクエスト作成

---

**最終更新**: 2025-09-26  
**担当者**: 開発チーム  
**次回見直し予定**: 2025-10-15（パッチ15.19リリース後）