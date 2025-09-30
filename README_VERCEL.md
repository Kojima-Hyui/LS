# League of Legends 汎用ツール - Vercel デプロイ版

## 📋 Riot API 仕様確認済み

このプロジェクトは**Riot Games 公式 API**の正しい仕様に基づいて実装されています：

### 使用している API

- ✅ **ACCOUNT-V1**: Riot ID（ゲーム名#タグ）から PUUID を取得
- ✅ **SUMMONER-V4**: PUUID からサモナー情報を取得
- ✅ **MATCH-V5**: マッチ履歴と試合詳細を取得
- ✅ **SPECTATOR-V5**: 現在のゲーム情報を取得（ライブゲーム）
- ✅ **LEAGUE-V4**: ランク情報を取得

### API エンドポイント例

```
https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}
https://jp1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}
https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids
https://jp1.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/{puuid}
https://jp1.api.riotgames.com/lol/league/v4/entries/by-summoner/{summonerId}
```

## 🚀 Vercel へのデプロイ方法

### 1. 前提条件

- Vercel アカウント（https://vercel.com/signup）
- Riot Games API キー（https://developer.riotgames.com/）
- Git リポジトリ（GitHub, GitLab, Bitbucket）

### 2. Riot Games API キーの取得

1. https://developer.riotgames.com/ にアクセス
2. Riot アカウントでログイン
3. 「REGISTER PRODUCT」をクリック
4. 開発者キー（Development API Key）を取得
   - ⚠️ 開発者キーは 24 時間で期限切れになります
   - 本番環境には「Personal API Key」または「Production API Key」を取得してください

### 3. デプロイ手順

#### 方法 A: Vercel CLI を使用

```bash
# Vercel CLIをインストール
npm install -g vercel

# プロジェクトディレクトリに移動
cd d:\LS

# デプロイ
vercel

# 環境変数を設定
vercel env add RIOT_API_KEY
# プロンプトが表示されたらAPIキーを入力

# 本番環境にデプロイ
vercel --prod
```

#### 方法 B: Vercel Web ダッシュボードを使用

1. GitHub などにプロジェクトをプッシュ

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

2. https://vercel.com にアクセス
3. 「New Project」をクリック
4. GitHub リポジトリを選択
5. 「Environment Variables」に以下を追加：
   - **Key**: `RIOT_API_KEY`
   - **Value**: あなたの Riot API キー
6. 「Deploy」をクリック

### 4. 設定確認

デプロイ後、以下を確認してください：

- ✅ `index.html` がルートで表示される
- ✅ `/api/match_history` エンドポイントが動作する
- ✅ `/api/current_game` エンドポイントが動作する
- ✅ `/api/balance_teams` エンドポイントが動作する

## 📁 プロジェクト構成

```
d:\LS\
├── index.html              # フロントエンド（静的HTML）
├── vercel.json             # Vercel設定ファイル
├── requirements_vercel.txt # Python依存関係
├── api/
│   ├── riot_client.py      # Riot APIクライアント
│   ├── utils.py            # ユーティリティ関数
│   ├── match_history.py    # 戦績取得API
│   ├── current_game.py     # 現在のゲーム情報API
│   └── balance_teams.py    # チームバランスAPI
└── README_VERCEL.md        # このファイル
```

## 🎮 機能

### 1. 戦績表示

- サモナーネーム（ゲーム名#タグライン）を入力
- 過去の試合履歴を取得・表示
- KDA、CS、ダメージなどの詳細統計

### 2. 試合情報取得

- サモナーネームを入力
- 現在ゲーム中の場合、敵味方全プレイヤーの情報を表示
- 各プレイヤーのランク情報を表示

### 3. チームバランス組み分け

- 10 人のサモナーネームを入力
- ランク情報を基にスコア化
- 公平な 5vs5 のチーム分けを自動生成

## ⚙️ Vercel の制限と対策

### Vercel サーバーレス関数の制限

| 項目           | Hobby（無料） | Pro          |
| -------------- | ------------- | ------------ |
| 実行時間       | 10 秒         | 60 秒        |
| メモリ         | 1024 MB       | 1024 MB      |
| ファイルサイズ | 250 MB        | 250 MB       |
| リクエスト数   | 100,000/日    | 1,000,000/月 |

### 実装済みの最適化

1. **タイムアウト設定**: HTTP リクエストに 5 秒のタイムアウト
2. **リトライ削減**: 失敗時のリトライを 2 回に制限
3. **並列処理の制限**: 組み分け機能で順次処理を実装
4. **CORS 対応**: フロントエンドからの API コール対応

## 🔧 トラブルシューティング

### デプロイエラー

#### Python 関数がビルドできない

```bash
# requirements_vercel.txt を確認
# 必要最小限のパッケージのみを含める
requests==2.31.0
```

#### 環境変数が読み込まれない

- Vercel ダッシュボードで環境変数を確認
- デプロイ後に再デプロイが必要な場合があります

### 実行時エラー

#### タイムアウトエラー

- Riot API のレスポンスが遅い場合に発生
- リトライ回数を減らすか、取得する試合数を減らしてください

#### Rate Limit エラー

- Riot API のレート制限（20 リクエスト/秒、100 リクエスト/2 分）
- 連続でリクエストを送らないように注意

#### プレイヤーが見つからない

- Riot ID の形式を確認（ゲーム名#タグライン）
- リージョン設定を確認（デフォルト: jp1/asia）

## 📊 API 使用量の目安

各機能の Riot API 呼び出し回数：

- **戦績表示**: 3 + 試合数（例：10 試合なら 13 回）

  - アカウント情報: 1 回
  - サモナー情報: 1 回
  - ランク情報: 1 回
  - 試合履歴: 1 回
  - 各試合詳細: 試合数分

- **試合情報**: 3 + プレイヤー数 ×2（例：10 人なら 23 回）

  - アカウント情報: 1 回
  - 現在のゲーム: 1 回
  - 各プレイヤーのサモナー情報: 10 回
  - 各プレイヤーのランク情報: 10 回

- **組み分け**: プレイヤー数 ×3（10 人なら 30 回）
  - 各プレイヤーのアカウント情報: 10 回
  - 各プレイヤーのサモナー情報: 10 回
  - 各プレイヤーのランク情報: 10 回

## 🔐 セキュリティ

- API キーは環境変数として管理
- フロントエンドに API キーを含めない
- CORS 設定で不正なアクセスを防止

## 📝 ライセンスと利用規約

このプロジェクトは教育目的で作成されています。
使用時は必ず**Riot Games Developer Terms of Service**を遵守してください。

https://developer.riotgames.com/policies/general

## 🔗 リンク

- [Riot Developer Portal](https://developer.riotgames.com/)
- [Riot API Documentation](https://developer.riotgames.com/apis)
- [Vercel Documentation](https://vercel.com/docs)
