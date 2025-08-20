# デプロイガイド

## 必要なアカウント設定

### 1. Replicate アカウント設定

1. [Replicate](https://replicate.com) にアクセス
2. アカウント作成（GitHub連携推奨）
3. [API Tokens](https://replicate.com/account/api-tokens) ページでAPIトークンを作成
4. APIトークンをコピーして保存

### 2. Railway アカウント設定

1. [Railway](https://railway.app) にアクセス
2. GitHubアカウントでサインアップ
3. $5/月のStarter Planにアップグレード

### 3. Vercel アカウント設定

1. [Vercel](https://vercel.com) にアクセス
2. GitHubアカウントでサインアップ（無料）

## デプロイ手順

### Step 1: GitHubリポジトリ作成

```bash
# 現在のディレクトリでGitリポジトリを初期化
git add .
git commit -m "feat: 初期プロジェクト作成

- Next.jsフロントエンド実装
- FastAPIバックエンド実装
- Replicate API統合準備
- Docker設定

🤖 Generated with Claude Code"

# GitHubでリポジトリを作成後
git remote add origin https://github.com/yourusername/ocr-app.git
git push -u origin main
```

### Step 2: Railway バックエンドデプロイ

1. [Railway Dashboard](https://railway.app/dashboard) にアクセス
2. "New Project" → "Deploy from GitHub repo"
3. 作成したリポジトリを選択
4. Root directoryを `/backend` に設定
5. 環境変数を設定：
   ```
   REPLICATE_API_TOKEN=your_replicate_token
   PORT=8000
   ENVIRONMENT=production
   ```
6. デプロイ完了後、生成されたURLをコピー

### Step 3: Vercel フロントエンドデプロイ

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. "New Project" → GitHubリポジトリを選択
3. Root directoryを `/frontend` に設定
4. 環境変数を設定：
   ```
   BACKEND_URL=https://your-railway-app.railway.app
   ```
5. "Deploy" をクリック

### Step 4: 動作確認

1. Vercelから提供されるURLにアクセス
2. 画像ファイルをアップロード
3. OCR処理が正常に動作することを確認

## トラブルシューティング

### Railway関連

**メモリ不足エラー**
- 画像サイズを小さくする
- リクエスト数を制限する

**起動エラー**
- 環境変数の設定を確認
- ログを確認: `railway logs`

### Vercel関連

**API接続エラー**
- BACKEND_URLの設定を確認
- CORSエラーの場合はバックエンドの設定を確認

### Replicate API関連

**APIトークンエラー**
- トークンの有効性を確認
- 課金設定を確認

**レート制限**
- リクエスト頻度を調整
- プランのアップグレードを検討

## 運用コスト

### 月1000枚処理の場合
- Railway: $5
- Vercel: $0（無料枠）
- Replicate: $10-20
- **合計: $15-25/月**

### スケーリング
処理量が増加した場合：
- Railway: より高性能なプランにアップグレード
- Replicate: 従量課金なので自動スケール
- Vercel: 無料枠内で十分