# League of Legends 汎用ツール - セットアップガイド

## 必要なもの

1. **Python 3.9 以上**

   - https://www.python.org/downloads/ からダウンロード

2. **Riot Games API キー**

   - https://developer.riotgames.com/ にアクセス
   - Riot アカウントでログイン
   - 「REGISTER PRODUCT」から開発者キーを取得

3. **Discord Bot トークン（Discord Bot 機能を使う場合）**
   - https://discord.com/developers/applications にアクセス
   - 「New Application」をクリック
   - アプリケーション名を入力
   - 左メニューから「Bot」を選択
   - 「Add Bot」をクリック
   - 「TOKEN」の下の「Copy」をクリックしてトークンをコピー
   - 「MESSAGE CONTENT INTENT」を有効化
   - 左メニューから「OAuth2」→「URL Generator」を選択
   - 「SCOPES」で「bot」を選択
   - 「BOT PERMISSIONS」で必要な権限を選択（推奨: Send Messages, Embed Links, Read Message History）
   - 生成された URL で Bot をサーバーに招待

## セットアップ手順

### 1. 依存パッケージのインストール

```bash
pip install -r requirements.txt
```

### 2. 環境変数の設定

`.env.example`ファイルを`.env`にコピーして編集します：

```bash
copy .env.example .env  # Windowsの場合
# または
cp .env.example .env    # macOS/Linuxの場合
```

`.env`ファイルを開いて、以下の情報を入力：

```
RIOT_API_KEY=RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DISCORD_BOT_TOKEN=MTxxxxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxx
FLASK_SECRET_KEY=任意のランダムな文字列
DEFAULT_REGION=jp1
DEFAULT_ROUTING=asia
```

#### リージョン設定について

**DEFAULT_REGION**: プラットフォームリージョン

- `jp1`: 日本
- `kr`: 韓国
- `na1`: 北米
- `euw1`: ヨーロッパ西部
- `eun1`: ヨーロッパ北東部
- `br1`: ブラジル
- `la1`: ラテンアメリカ北部
- `la2`: ラテンアメリカ南部
- `oc1`: オセアニア
- `tr1`: トルコ
- `ru`: ロシア

**DEFAULT_ROUTING**: ルーティング地域

- `asia`: アジア（日本、韓国など）
- `americas`: 南北アメリカ
- `europe`: ヨーロッパ
- `sea`: 東南アジア

## 使い方

### Web アプリケーションとして使用

1. アプリケーションを起動：

```bash
python app.py
```

2. ブラウザで以下の URL にアクセス：

```
http://localhost:5000
```

3. 各機能を使用：
   - **戦績表示**: サモナーネーム（ゲーム名#タグライン）を入力して過去の戦績を確認
   - **試合情報**: サモナーネームを入力して現在の試合情報を取得
   - **組み分け**: 10 人のサモナーネームを入力して 5vs5 に自動組み分け

### Discord Bot として使用

1. Bot を起動：

```bash
python discord_bot.py
```

2. Discord サーバーで以下のコマンドを使用：

```
# ヘルプを表示
!lol help

# 戦績を表示（デフォルト10試合）
!lol 戦績 Hide#on#Bush

# 戦績を表示（試合数指定）
!lol 戦績 Hide#on#Bush 20

# 現在の試合情報を取得
!lol 試合情報 Hide#on#Bush

# 10人を5vs5に組み分け
!lol 組み分け Player1#JP1 Player2#JP1 Player3#JP1 Player4#JP1 Player5#JP1 Player6#JP1 Player7#JP1 Player8#JP1 Player9#JP1 Player10#JP1
```

## トラブルシューティング

### API キーが無効と表示される

- Riot Developer Portal でキーが有効か確認
- 開発者キーは 24 時間で期限切れになるため、定期的に更新が必要
- 本番環境では「Personal API Key」または「Production API Key」を取得

### Discord Bot が応答しない

- `.env`ファイルの DISCORD_BOT_TOKEN が正しいか確認
- Bot に「MESSAGE CONTENT INTENT」権限が付与されているか確認
- Bot が Discord サーバーに招待されているか確認
- Bot に適切な権限（メッセージ送信など）があるか確認

### プレイヤーが見つからない

- Riot ID の形式が正しいか確認（ゲーム名#タグライン）
- リージョン設定が正しいか確認
- プレイヤー名のスペースや特殊文字に注意

### レート制限エラー

- Riot API には 1 秒あたりのリクエスト数に制限があります
- 開発者キー: 20 リクエスト/秒、100 リクエスト/2 分
- 連続して多数のリクエストを送らないように注意

## 機能の詳細

### 1. 戦績表示

- 指定したプレイヤーの最近の試合履歴を表示
- 表示内容：
  - プレイヤー情報（レベル、ランク）
  - 各試合の勝敗、使用チャンピオン
  - KDA（キル/デス/アシスト）
  - CS（クリープスコア）
  - ダメージ量、視界スコア

### 2. 敵味方情報取得

- 指定したプレイヤーが現在ゲーム中の場合、その試合の情報を表示
- 表示内容：
  - ゲームモード
  - 青チームと赤チームのプレイヤー
  - 各プレイヤーのランク情報

### 3. カスタムバランス組み分け

- 10 人のプレイヤーを公平な 5vs5 のチームに自動分割
- アルゴリズム：
  - 各プレイヤーのランク情報を取得
  - ランクをスコア化（IRON=0〜CHALLENGER=3600）
  - 両チームの合計スコアが最も近くなる組み合わせを計算
  - 公平性を重視した組み分けを実現

## 開発者向け情報

### ファイル構成

```
LS/
├── app.py              # Flask Webアプリケーション
├── discord_bot.py      # Discord Bot
├── riot_api.py         # Riot API クライアント
├── game_utils.py       # ゲームロジックとデータ処理
├── requirements.txt    # Pythonパッケージ依存関係
├── .env               # 環境変数（作成必要）
├── .env.example       # 環境変数のテンプレート
├── .gitignore         # Git無視ファイル
├── README.md          # プロジェクト説明
├── SETUP_GUIDE.md     # このファイル
└── templates/
    └── index.html     # Webアプリケーションのフロントエンド
```

### API エンドポイント

**POST /api/match-history**

- リクエスト: `{ "game_name": "...", "tag_line": "...", "count": 20 }`
- レスポンス: プレイヤー情報と試合履歴

**POST /api/current-game**

- リクエスト: `{ "game_name": "...", "tag_line": "..." }`
- レスポンス: 現在のゲーム情報

**POST /api/balance-teams**

- リクエスト: `{ "riot_ids": ["Player1#JP1", ...] }`
- レスポンス: バランスされた 2 チーム

## ライセンス

このプロジェクトは教育目的で作成されています。
Riot Games の利用規約を遵守してください。
