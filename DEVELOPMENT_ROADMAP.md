# 🚀 LoL Search Tools - 開発ロードマップ

## 📋 現在の状況

### ✅ 実装済み機能
- **基本戦績表示**: サモナー検索、KDA、CS、ダメージ、ランク表示
- **現在の試合情報**: ライブゲーム参加者とランク情報
- **レーン考慮チーム組み分け**: プレイヤーの得意レーン（トップ/ジャングル/ミッド/ADC/サポート）を考慮した5vs5組み分け
- **アイテム検索システム**: フィルタリング、ビルド管理（Next.jsアプリ）
- **ルーンページ管理**: ルーン選択・保存システム

### 🎯 次期実装予定機能（優先度順）

## Phase 1: 詳細パフォーマンス分析（Week 1-2）

### 目標
- 現在の基本統計（KDA、CS、ダメージ）を詳細分析に拡張
- 総合パフォーマンススコア（0-100）導入
- レーン別・時間軸別パフォーマンス分析

### 実装内容

#### バックエンド
```python
# 新ファイル: api/performance_analysis.py
# - calculate_performance_score(): 総合スコア計算
# - calculate_farming_efficiency(): ファーム効率 (0-20点)
# - calculate_combat_effectiveness(): 戦闘効率 (0-25点)
# - calculate_vision_control(): 視界コントロール (0-20点)
# - calculate_objective_participation(): オブジェクト貢献 (0-15点)
# - calculate_gold_efficiency(): ゴールド効率 (0-20点)
```

#### フロントエンド
```javascript
// 新ファイル: static/js/performance_analysis.js
# - PerformanceAnalyzer クラス
# - displayDetailedStats(): 詳細統計表示
# - renderScoreBar(): スコアバー描画
# - 円形スコア表示、パーセンタイルランキング
```

#### データベース
```sql
-- 新テーブル: performance_scores
CREATE TABLE performance_scores (
    id SERIAL PRIMARY KEY,
    puuid VARCHAR(78) NOT NULL,
    match_id VARCHAR(20) NOT NULL,
    champion_id INT NOT NULL,
    position VARCHAR(10),
    total_score DECIMAL(5,2),
    farming_score DECIMAL(4,2),
    combat_score DECIMAL(4,2),
    vision_score DECIMAL(4,2),
    objective_score DECIMAL(4,2),
    gold_efficiency DECIMAL(4,2),
    percentile_rank DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 開始手順
1. データベースセットアップ（PostgreSQL推奨）
2. `api/performance_analysis.py` 作成
3. 既存 `api/utils.py` の `get_player_stats()` 拡張
4. フロントエンド統計表示UI追加

---

## Phase 2: チャンピオン統計ダッシュボード（Week 3-4）

### 目標
- 全チャンピオンの勝率・ピック率・バン率統計
- ロール別ランキング・ティアリスト
- パッチ別トレンド分析

### 実装内容

#### バックエンド
```python
# 新ファイル: api/champion_statistics.py
# - ChampionStatsCollector クラス
# - collect_daily_stats(): 日次統計収集
# - calculate_win_rates(): 勝率計算
# - generate_tier_list(): ティアリスト生成

# 新ファイル: api/champion_dashboard.py  
# - /api/champion-stats エンドポイント
# - /api/tier-list エンドポイント
# - /api/matchup-data エンドポイント
```

#### フロントエンド
```html
<!-- 新ページ: champion_stats.html -->
# - ポジション/期間/ランク別フィルター
# - 勝率トップ5、人気チャンピオン、バン率トップ5
# - ティアリストグリッド（S+/S/A/B/Cランク）
# - 詳細統計テーブル
```

```javascript
// 新ファイル: static/js/champion_dashboard.js
# - ChampionDashboard クラス
# - loadChampionStats(): 統計データ取得
# - renderTierList(): ティアリスト描画
# - groupChampionsByTier(): ティア分類ロジック
```

#### データベース
```sql
-- 新テーブル: champion_daily_stats
CREATE TABLE champion_daily_stats (
    champion_id INT NOT NULL,
    position VARCHAR(20),
    region VARCHAR(10),
    rank_tier VARCHAR(20),
    total_games INT,
    wins INT,
    picks INT,
    bans INT,
    avg_kills DECIMAL(4,2),
    avg_deaths DECIMAL(4,2),
    avg_assists DECIMAL(4,2),
    date_recorded DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 開始手順
1. データ収集バッチシステム構築
2. 統計API実装
3. ダッシュボードUI作成
4. `index.html` にタブ追加

---

## Phase 3: 統計ベースビルド推奨（Week 5-6）

### 目標
- 大量試合データから最適ビルドを自動生成
- 対戦相手・ゲーム状況特化ビルド
- プロビルド統合・分析

### 実装内容

#### バックエンド
```python
# 新ファイル: api/build_recommendation.py
# - BuildRecommendationEngine クラス
# - analyze_optimal_builds(): 統計ベース最適ビルド
# - recommend_situational_build(): 状況特化ビルド
# - get_item_purchase_timing(): 購入タイミング最適化

# 新ファイル: api/pro_builds.py
# - ProBuildCollector クラス
# - collect_pro_builds(): プロビルド収集
```

#### フロントエンド
```html
<!-- 新ページ: build_recommendations.html -->
# - チャンピオン・ポジション選択
# - 最適ビルド/状況別/プロビルド/購入タイミング タブ
# - 敵チーム構成入力UI
# - ビルド推奨結果表示
```

#### データベース
```sql
-- 新テーブル: item_build_stats, rune_stats
# - アイテムビルド統計
# - ルーン使用統計
# - 勝率・使用率データ
```

---

## Phase 4: ライブゲーム強化（Week 7-8）

### 目標
- 各プレイヤーの詳細統計・最近パフォーマンス
- チーム構成シナジー分析・勝率予測
- リアルタイム推奨アドバイス

### 実装内容

#### バックエンド
```python
# 拡張ファイル: api/enhanced_live_game.py
# - EnhancedLiveGameAnalyzer クラス
# - get_comprehensive_live_analysis(): 包括的分析
# - analyze_team_composition(): チーム構成分析
# - generate_predictions(): 勝敗予測
```

#### フロントエンド
```html
<!-- 拡張ファイル: enhanced_live_game.html -->
# - 勝敗予測バー
# - チーム比較グラフ
# - 個別プレイヤー分析カード
# - レーンマッチアップ予測
# - 戦略的アドバイス
```

---

## 🛠️ 技術要件

### データベース
- **推奨**: PostgreSQL（Supabase）
- **サイズ**: 初期20GB → 拡張100GB
- **接続数**: 100同時接続

### キャッシュ
- **推奨**: Redis（Upstash）
- **メモリ**: 256MB
- **TTL設定**: チャンピオン統計1h、試合データ24h

### API制限
- **現在**: Riot API Personal Key
- **必要**: Production Key（高トラフィック対応）

### 外部サービス
- **監視**: Sentry（エラートラッキング）
- **分析**: Vercel Analytics

---

## 📋 開発チェックリスト

### Phase 1 開始前
- [ ] PostgreSQL データベースセットアップ
- [ ] Redis キャッシュセットアップ
- [ ] 環境変数設定（DATABASE_URL, REDIS_URL）
- [ ] `requirements.txt` に依存関係追加

### 各Phase共通
- [ ] APIエンドポイント実装
- [ ] フロントエンドUI作成
- [ ] データベーステーブル作成
- [ ] エラーハンドリング実装
- [ ] キャッシュ戦略実装
- [ ] テスト実行

### デプロイ前
- [ ] Vercel環境変数設定
- [ ] データベースマイグレーション
- [ ] パフォーマンステスト
- [ ] セキュリティチェック

---

## 🚀 開始コマンド例

### 開発環境セットアップ
```bash
# 仮想環境作成・有効化
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係インストール
pip install -r requirements.txt
pip install psycopg2-binary redis

# 環境変数設定
export DATABASE_URL="postgresql://user:pass@host:port/dbname"
export REDIS_URL="redis://user:pass@host:port"
export RIOT_API_KEY="your_riot_api_key"

# ローカルサーバー起動
python local_server.py
```

### データベース初期化
```sql
-- PostgreSQLに接続して実行
\i database_schema.sql
```

---

## 💡 継続開発のヒント

### 優先度判断
1. **即効性**: ユーザーに即座に価値を提供
2. **差別化**: 他サイトとの差別化要素
3. **技術負債**: 将来の拡張性を考慮
4. **ユーザー要望**: フィードバックベース

### 開発Tips
- 既存コードを最大限活用
- 段階的リリース（機能ごと）
- パフォーマンス監視重要
- ユーザーフィードバック収集

### 次回開発時の確認事項
1. どのPhaseを実装中か
2. 現在のブロッカーは何か
3. データベース・インフラ状況
4. 未実装の依存関係

---

**最終更新**: 2025-01-02
**次回優先実装**: Phase 1 - 詳細パフォーマンス分析
**技術スタック**: Python + Vercel + PostgreSQL + Redis