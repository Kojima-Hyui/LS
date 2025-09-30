# Vercelデプロイ完全ガイド

## 📋 事前準備

✅ GitHubリポジトリにコードをプッシュ済み
✅ Riot Games APIキーを取得済み

## 🚀 デプロイ手順

### ステップ1: Vercelアカウント作成

1. https://vercel.com にアクセス
2. 「Sign Up」をクリック
3. 「Continue with GitHub」を選択
4. GitHubアカウントで認証

### ステップ2: プロジェクトのインポート

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. 「Import Git Repository」セクションで、`Kojima-Hyui/LS` リポジトリを探す
3. 「Import」をクリック

### ステップ3: プロジェクト設定

**Configure Project** 画面で以下を設定：

#### Framework Preset
- **Framework Preset**: `Other` を選択

#### Root Directory
- そのまま `./` でOK

#### Build and Output Settings
- **Build Command**: 空欄のまま（静的サイトなので不要）
- **Output Directory**: 空欄のまま
- **Install Command**: `pip install -r requirements_vercel.txt`

#### Environment Variables（重要！）

「Environment Variables」セクションで以下を追加：

| Name | Value |
|------|-------|
| `RIOT_API_KEY` | あなたのRiot APIキー（RGAPI-...） |

**手順:**
1. 「Add」をクリック
2. Name: `RIOT_API_KEY`
3. Value: あなたのAPIキーを貼り付け
4. Environment: `Production`, `Preview`, `Development` すべてにチェック

### ステップ4: デプロイ実行

1. すべての設定を確認
2. 「Deploy」ボタンをクリック
3. デプロイが開始されます（約1-2分）

### ステップ5: デプロイ確認

デプロイが完了すると：
- ✅ デプロイ成功のメッセージが表示
- 🔗 URLが生成されます（例: `https://ls-xxxxx.vercel.app`）
- 「Visit」ボタンをクリックしてサイトにアクセス

---

## 🔧 トラブルシューティング

### デプロイエラーが出る場合

#### エラー: "No Python files found"
**原因**: `vercel.json`の設定問題

**解決策**: プロジェクトルートに`vercel.json`があることを確認

#### エラー: "Module not found"
**原因**: `requirements_vercel.txt`が見つからない

**解決策**: ファイルがリポジトリのルートにあることを確認

#### エラー: "Build exceeded maximum duration"
**原因**: ビルド時間が長すぎる

**解決策**: 不要なパッケージを削除（現在は`requests`のみなので問題なし）

### 実行時エラー

#### 401 Unknown apikey
**原因**: 環境変数が設定されていない

**解決策**:
1. Vercelダッシュボード → プロジェクトを選択
2. 「Settings」→「Environment Variables」
3. `RIOT_API_KEY`を追加
4. 「Redeploy」を実行

#### 404 Not Found (APIエンドポイント)
**原因**: APIルーティングの問題

**解決策**: `vercel.json`を確認（すでに正しく設定されています）

#### Function timeout
**原因**: 10秒以内に処理が完了しない

**解決策**: 
- 取得する試合数を減らす
- リージョンを確認（近い方が速い）

---

## 📊 デプロイ後の確認事項

### 1. 基本動作確認

デプロイされたURLにアクセス:
- [ ] トップページが表示される
- [ ] タブが切り替わる
- [ ] デザインが正しく表示される

### 2. API動作確認

#### 戦績表示
1. ゲーム名とタグラインを入力
2. 「戦績を取得」をクリック
3. 正しくデータが表示されることを確認

#### 試合情報
1. ゲーム中のプレイヤーで試す
2. 敵味方の情報が表示されることを確認

#### 組み分け
1. 10人のRiot IDを入力
2. チーム分けが実行されることを確認

### 3. エラーハンドリング確認

- [ ] 存在しないプレイヤーでエラーメッセージ表示
- [ ] 無効な入力でエラーメッセージ表示
- [ ] ゲーム中でない場合のメッセージ表示

---

## 🎨 カスタムドメインの設定（オプション）

### 独自ドメインを使用する場合

1. Vercelダッシュボード → プロジェクト → 「Settings」
2. 「Domains」をクリック
3. 独自ドメインを入力
4. DNSレコードを設定
   - Vercelが提供するCNAMEレコードを追加

---

## 🔄 更新方法

### コードを更新した場合

```bash
# ローカルで変更を加える
git add .
git commit -m "Update: 機能追加"
git push origin main
```

Vercelは自動的に:
1. GitHubのpushを検知
2. 自動的に再ビルド
3. 新しいバージョンをデプロイ

### 環境変数を更新した場合

1. Vercelダッシュボード → 「Settings」→「Environment Variables」
2. 変数を編集
3. 「Save」をクリック
4. 「Deployments」タブ → 最新のデプロイで「...」→「Redeploy」

---

## 📈 パフォーマンス最適化

### Vercel Analytics（オプション）

1. Vercelダッシュボード → プロジェクト → 「Analytics」
2. 「Enable Analytics」をクリック
3. アクセス数、パフォーマンスを監視

### エッジキャッシング

`vercel.json`に以下を追加（すでに設定済み）:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ]
}
```

---

## 💰 料金について

### Hobby（無料プラン）の制限

- ✅ 無制限のデプロイ
- ✅ 100GB帯域幅/月
- ✅ サーバーレス関数実行: 100,000回/月
- ✅ 実行時間: 10秒/関数

### 使用量の確認

Vercelダッシュボード → 「Settings」→「Usage」で確認可能

---

## 🔐 セキュリティ

### APIキーの保護

✅ 環境変数として設定済み
✅ フロントエンドにAPIキーを含めない
✅ GitHubにコミットしない（.gitignoreで除外済み）

### CORS設定

✅ すべてのAPIで設定済み
✅ 必要に応じて特定のドメインのみ許可可能

---

## 📞 サポート

### 問題が発生した場合

1. **Vercelのログを確認**
   - ダッシュボード → 「Deployments」→ デプロイをクリック
   - 「Functions」タブでエラーログを確認

2. **GitHubのコードを確認**
   - https://github.com/Kojima-Hyui/LS

3. **Riot API開発者ポータル**
   - https://developer.riotgames.com/
   - APIキーの有効期限を確認

---

## ✨ 完了！

デプロイが成功したら、以下を共有できます：
- 🌐 Webサイト URL
- 📱 モバイル対応
- ⚡ 高速なCDN配信
- 🔄 自動デプロイ

おめでとうございます！🎉
