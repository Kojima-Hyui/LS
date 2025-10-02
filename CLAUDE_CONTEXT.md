# 🤖 Claude Code 開発コンテキスト

## 📍 プロジェクト概要

**LoL Search Tools** - League of Legends 統計・分析プラットフォーム
- **目標**: OP.GG級の包括的LoL分析ツール
- **特徴**: 日本語UI、独自チーム組み分け、詳細パフォーマンス分析
- **技術**: Python + Vercel + Next.js + PostgreSQL

---

## 🎯 現在の開発状況

### 最新の実装
- **レーン考慮チーム組み分け機能** (2025-01-02実装)
  - プレイヤーの得意レーン選択UI
  - ランク + レーン適性考慮の最適化アルゴリズム
  - レーン配分結果の視覚表示

### 実装済み主要機能
1. **基本戦績表示**: サモナー検索、試合履歴、KDA、CS、ダメージ
2. **ライブゲーム情報**: 現在の試合参加者・ランク表示
3. **チーム組み分け**: 10人プレイヤーの5vs5バランス調整（ランク+レーン考慮）
4. **アイテム検索**: フィルタリング、ビルド管理（Next.jsアプリ）
5. **ルーンページ管理**: ルーン選択・保存システム

---

## 🚀 次期実装計画（4つの主要機能）

### 最優先実装順序
1. **詳細パフォーマンス分析** (Week 1-2)
2. **チャンピオン統計ダッシュボード** (Week 3-4)  
3. **統計ベースビルド推奨** (Week 5-6)
4. **ライブゲーム強化** (Week 7-8)

詳細は `DEVELOPMENT_ROADMAP.md` を参照

---

## 📁 重要なファイル構造

```
D:\LS\
├── DEVELOPMENT_ROADMAP.md    # 🚀 開発計画詳細
├── CLAUDE_CONTEXT.md         # 🤖 このファイル
├── index.html                # メインWebアプリ
├── api/                      # バックエンドAPI
│   ├── balance_teams.py      # チーム組み分けAPI
│   ├── current_game.py       # ライブゲームAPI
│   ├── match_detail.py       # 試合詳細API
│   ├── match_history.py      # 戦績API
│   ├── riot_client.py        # Riot API クライアント
│   └── utils.py              # ユーティリティ関数
├── static/
│   ├── css/styles.css        # メインスタイル
│   └── js/api.js             # フロントエンドJS
└── lol-item-search/          # Next.js アイテム検索アプリ
```

---

## 🔧 開発環境・技術仕様

### フロントエンド
- **メインアプリ**: HTML + CSS + JavaScript
- **アイテム検索**: Next.js + TypeScript
- **UI**: 既存デザインシステム踏襲

### バックエンド
- **ランタイム**: Python 3.9 + Vercel Serverless
- **API**: Riot Games API 統合
- **認証**: Riot API Key

### データベース（次期実装）
- **推奨**: PostgreSQL (Supabase)
- **キャッシュ**: Redis (Upstash)
- **容量**: 初期20GB → 拡張100GB

### デプロイ
- **ホスティング**: Vercel
- **ドメイン**: カスタムドメイン対応
- **地域**: 東京リージョン (nrt1)

---

## 💻 開発開始時のコマンド

### 環境確認
```bash
# 現在のディレクトリ確認
pwd  # D:\LS であることを確認

# 既存ファイル確認
ls -la

# 開発状況確認
git status
git log --oneline -5
```

### 新機能開発時
```bash
# 新しいブランチ作成（推奨）
git checkout -b feature/performance-analysis

# 開発サーバー起動
python local_server.py

# フロントエンドテスト
# ブラウザで http://localhost:5000 にアクセス
```

---

## 🎯 Claude への指示テンプレート

### 新機能実装開始時
```
DEVELOPMENT_ROADMAP.md の Phase X を実装したいです。
[実装したい具体的な機能]から始めてください。

現在の状況:
- 実装段階: [Phase1/2/3/4]
- 優先機能: [具体的な機能名]
- ブロッカー: [あれば記載]
```

### 既存機能修正時
```
[具体的な問題・修正内容]を修正してください。

対象ファイル: [ファイルパス]
現象: [具体的な問題]
期待動作: [修正後の期待動作]
```

### 継続開発時
```
前回の続きから開発を継続します。
DEVELOPMENT_ROADMAP.md と CLAUDE_CONTEXT.md を確認して、
次に実装すべき機能を提案してください。
```

---

## 📊 重要な実装詳細

### レーン考慮チーム組み分け（最新実装）
- **ファイル**: `api/balance_teams.py`, `api/utils.py`
- **アルゴリズム**: 全252通りの5vs5組み合わせ × レーン配分で最適解探索
- **スコア**: 得意レーン+100、指定なし+50、苦手+10、ランクバランス重視
- **UI**: チェックボックス式レーン選択、結果にレーン配分表示

### Riot API 統合
- **クライアント**: `api/riot_client.py`
- **主要エンドポイント**: アカウント検索、試合履歴、ライブゲーム、ランク情報
- **レート制限**: Personal Key（100req/2min, 20k/10min）

### データ構造
- **プレイヤー情報**: puuid, summoner_name, rank_score, preferred_lanes
- **試合データ**: match_id, participants, statistics, timeline
- **パフォーマンス**: KDA, CS, damage, vision, objectives

---

## 🚨 注意事項・制約

### API制限
- Riot API Personal Keyの制限内で実装
- レート制限超過時のエラーハンドリング必須
- 大量データ取得時はバッチ処理必要

### パフォーマンス
- フロントエンド応答速度重視
- 大量計算はバックエンドで実行
- キャッシュ戦略重要

### セキュリティ
- API Key の適切な管理
- ユーザー入力の検証
- XSS/インジェクション対策

### 互換性
- 既存機能への影響最小化
- UI/UX一貫性保持
- モバイル対応考慮

---

## 🔄 最新の変更履歴

### 2025-01-02
- レーン考慮チーム組み分け機能実装完了
- UI: レーン選択チェックボックス追加
- アルゴリズム: `balance_teams_with_lanes()` 実装
- CSS: レーン選択UI用スタイル追加
- 結果表示: レーン配分バッジ表示

### 開発計画策定完了
- 4つの主要機能の詳細実装計画完成
- データベース設計完了
- 技術的依存関係整理完了
- 8週間実装ロードマップ策定

---

## 📚 参考資料

- **DEVELOPMENT_ROADMAP.md**: 詳細な実装計画
- **README.md**: プロジェクト基本情報
- **API_KEY_SETUP.md**: Riot API設定手順
- **DEPLOYMENT_CHECKLIST.md**: デプロイ前チェック項目

---

**最終更新**: 2025-01-02
**実装状況**: レーン考慮チーム組み分け完了、次期4機能計画策定完了
**次回優先**: Phase 1 - 詳細パフォーマンス分析実装