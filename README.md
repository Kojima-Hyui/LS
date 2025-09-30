# League of Legends 汎用ツール

League of Legends のプレイヤー情報を取得・分析するツールです。

## 機能

### 1. 戦績表示

- サモナーネーム（○○#××）を入力して過去の戦績を取得・表示

### 2. 敵味方情報取得

- サモナーネームを入力し、その人がゲーム中の場合に試合の敵味方情報を取得・表示

### 3. カスタムバランス組み分け

- 10 人のサモナーネームを入力し、MMR やランクを基に 5vs5 の公平なチーム分けを自動生成

## セットアップ

### 必要なもの

- Python 3.9 以上
- Riot Games API キー（https://developer.riotgames.com/ で取得）

### インストール

```bash
pip install -r requirements.txt
```

### 環境変数の設定

`.env.example`を`.env`にコピーして、必要な情報を入力してください。

```
RIOT_API_KEY=your_riot_api_key_here
DISCORD_BOT_TOKEN=your_discord_bot_token_here
FLASK_SECRET_KEY=your_secret_key_here
```

## 使い方

### Web アプリケーションとして起動

```bash
python app.py
```

ブラウザで `http://localhost:5000` にアクセス

### Discord Bot として起動

```bash
python discord_bot.py
```

## 使用技術

- Python
- Flask (Web アプリケーション)
- Discord.py (Discord Bot)
- Riot Games API
