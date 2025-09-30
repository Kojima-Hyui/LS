# Vercel デプロイ前チェックリスト

## ✅ 必須確認事項

### 1. Riot API 仕様確認

- [x] ACCOUNT-V1 API（Riot ID → PUUID）
- [x] SUMMONER-V4 API（PUUID → サモナー情報）
- [x] MATCH-V5 API（試合履歴）
- [x] SPECTATOR-V5 API（現在のゲーム）
- [x] LEAGUE-V4 API（ランク情報）

**結論**: すべての API エンドポイントが正しい仕様で実装されています。

### 2. Vercel 対応確認

- [x] サーバーレス関数形式（BaseHTTPRequestHandler）
- [x] タイムアウト対策（5 秒）
- [x] CORS 設定
- [x] 環境変数の使用（os.environ）
- [x] 依存関係の最小化（requests のみ）

### 3. ファイル構成確認

```
✓ index.html              フロントエンド
✓ vercel.json             Vercel設定
✓ requirements_vercel.txt Python依存関係
✓ api/riot_client.py      Riot APIクライアント
✓ api/utils.py            ユーティリティ関数
✓ api/match_history.py    戦績取得API
✓ api/current_game.py     現在のゲーム情報API
✓ api/balance_teams.py    チームバランスAPI
```

## 🧪 ローカルテスト手順

### ステップ 1: 環境変数の設定

Windows PowerShell:

```powershell
$env:RIOT_API_KEY="your_api_key_here"
```

Windows CMD:

```cmd
set RIOT_API_KEY=your_api_key_here
```

Linux/Mac:

```bash
export RIOT_API_KEY=your_api_key_here
```

### ステップ 2: ローカルサーバー起動

```bash
python local_server.py
```

### ステップ 3: ブラウザでテスト

http://localhost:8000 にアクセスして以下をテスト：

1. **戦績表示**

   - [ ] ゲーム名とタグラインを入力
   - [ ] 戦績が正しく表示される
   - [ ] ランク情報が正しい
   - [ ] KDA、CS などの統計が表示される

2. **試合情報**

   - [ ] ゲーム中のプレイヤーで試行
   - [ ] 敵味方の情報が表示される
   - [ ] ランク情報が正しい
   - [ ] ゲーム中でない場合のエラーメッセージ

3. **組み分け**
   - [ ] 10 人の Riot ID を入力
   - [ ] チーム分けが実行される
   - [ ] スコア差が表示される
   - [ ] 各プレイヤーのランク情報が正しい

### ステップ 4: エラーケースのテスト

1. **無効な Riot ID**
   - [ ] 存在しないプレイヤーでエラーメッセージ表示
2. **不正な形式**
   - [ ] "#"なしの入力でエラー
3. **10 人未満/超過**
   - [ ] 組み分けで適切なエラーメッセージ

## 🚀 Vercel デプロイ手順

### 方法 A: Vercel CLI

```bash
# 1. Vercel CLIをインストール
npm install -g vercel

# 2. ログイン
vercel login

# 3. プロジェクトをデプロイ
vercel

# 4. 環境変数を設定
vercel env add RIOT_API_KEY production

# 5. 本番デプロイ
vercel --prod
```

### 方法 B: GitHub 連携

```bash
# 1. Gitリポジトリを作成
git init
git add .
git commit -m "Initial commit: LoL Tool for Vercel"

# 2. GitHubにプッシュ
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main

# 3. Vercelダッシュボードで連携
# https://vercel.com/new
# - Import Git Repository
# - Environment Variables に RIOT_API_KEY を追加
# - Deploy
```

## 🔍 デプロイ後の確認

### 1. 基本動作確認

- [ ] デプロイ URL にアクセス可能
- [ ] index.html が正しく表示される
- [ ] タブ切り替えが動作する

### 2. API 動作確認

- [ ] /api/match_history が動作
- [ ] /api/current_game が動作
- [ ] /api/balance_teams が動作

### 3. エラーハンドリング

- [ ] 無効な入力でエラーメッセージ表示
- [ ] タイムアウト時の挙動
- [ ] Rate Limit 時の挙動

## ⚠️ 既知の制限事項

### Vercel 無料プラン（Hobby）

- 実行時間: 10 秒まで
- メモリ: 1024 MB
- リクエスト数: 100,000/日

### Riot API 制限

- 開発者キー: 20 リクエスト/秒、100 リクエスト/2 分
- 24 時間で期限切れ（本番は Personal/Production API Key 推奨）

### 推奨事項

1. **試合数の制限**: 戦績表示で一度に取得する試合数を 10-20 に制限
2. **タイムアウト対策**: リクエストタイムアウトを 5 秒に設定済み
3. **Rate Limit 対策**: 連続リクエストを避ける

## 📝 環境変数一覧

Vercel ダッシュボードで設定する環境変数：

| 変数名       | 説明                | 必須 |
| ------------ | ------------------- | ---- |
| RIOT_API_KEY | Riot Games API キー | ✓    |

## 🐛 トラブルシューティング

### デプロイエラー

**症状**: Python 関数がビルドできない

```
解決策:
1. requirements_vercel.txt を確認
2. 不要なパッケージを削除
3. バージョンを固定（例: requests==2.31.0）
```

**症状**: 環境変数が読み込まれない

```
解決策:
1. Vercelダッシュボードで環境変数を確認
2. Production/Preview/Development すべてにチェック
3. 再デプロイを実行
```

### 実行時エラー

**症状**: Function timeout

```
解決策:
1. 取得する試合数を減らす
2. リトライ回数を削減（現在2回）
3. 並列処理を避ける
```

**症状**: Rate Limit Error

```
解決策:
1. リクエスト間隔を空ける
2. キャッシュを実装する
3. API使用量を監視
```

## ✨ 最適化のヒント

### パフォーマンス改善

1. **キャッシュの実装**: 頻繁にアクセスされるデータをキャッシュ
2. **並列処理**: 可能な場合は並列で API リクエスト
3. **データ圧縮**: レスポンスサイズを削減

### コスト削減

1. **リクエスト数の最小化**: 必要なデータのみ取得
2. **CDN の活用**: 静的ファイルは Vercel CDN 経由
3. **エラーハンドリング**: 無駄なリトライを避ける

## 📞 サポート

問題が発生した場合：

1. Vercel ログを確認
2. ブラウザのコンソールを確認
3. Riot API 開発者ポータルでステータス確認

---

**チェック完了後、デプロイを実行してください！** 🚀
