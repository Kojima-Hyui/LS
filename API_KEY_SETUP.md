# 🔑 API キー設定ガイド

## 手順 1: Riot Games API キーを取得

1. https://developer.riotgames.com/ にアクセス
2. Riot アカウントでログイン
3. 画面上部の「REGENERATE API KEY」をクリック
4. 表示された API キーをコピー（例: RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx）

⚠️ **重要**: 開発者キーは 24 時間で期限切れになります

## 手順 2: .env ファイルに API キーを設定

`d:\LS\.env` ファイルを開いて、以下のように編集してください：

```
RIOT_API_KEY=ここに実際のAPIキーを貼り付け
```

例:

```
RIOT_API_KEY=RGAPI-12345678-1234-1234-1234-123456789abc
```

## 手順 3: サーバーを再起動

```powershell
# 現在のサーバーを停止（Ctrl+C）
# その後、再度起動
python local_server.py
```

## トラブルシューティング

### エラー: 401 Unknown apikey

**原因**: API キーが正しく設定されていない、または期限切れ

**解決策**:

1. .env ファイルの API キーを確認
2. Riot Developer Portal で新しいキーを生成
3. サーバーを再起動

### API キーの確認方法

PowerShell で以下を実行:

```powershell
# .envファイルの内容を確認
Get-Content .env | Select-String "RIOT_API_KEY"
```

### API キーを PowerShell で直接設定（一時的）

```powershell
$env:RIOT_API_KEY = "RGAPI-your-actual-api-key-here"
python local_server.py
```

## 現在の状態

✅ .env ファイル作成済み
✅ python-dotenv インストール済み
✅ local_server.py 修正済み
⚠️ **API キーを実際の値に置き換えてください**

## 次のステップ

1. **Riot Developer Portal**で API キーを取得・コピー
2. `d:\LS\.env`ファイルを開く
3. `RIOT_API_KEY=your_riot_api_key_here` を実際のキーに置き換え
4. ファイルを保存
5. サーバーを再起動

これで 401 エラーが解決します！🎉
