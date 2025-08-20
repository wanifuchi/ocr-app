# デプロイガイド - dots.ocr完全版

## 🎯 アーキテクチャ概要

```
Frontend (Vercel) → Railway ($5) → HuggingFace Space → dots.ocr
```

## 必要なアカウント設定

### 1. HuggingFace アカウント設定 🆕

1. [HuggingFace](https://huggingface.co) にアクセス
2. GitHubアカウントでサインアップ（無料）
3. HuggingFace Spaces（GPU T4）を利用

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
git commit -m "feat: dots.ocr完全統合実装

- Next.jsフロントエンド実装
- FastAPIバックエンド実装  
- HuggingFace Space統合
- dots.ocr直接利用対応

🤖 Generated with Claude Code"

# GitHubでリポジトリを作成後
git remote add origin https://github.com/yourusername/ocr-app.git
git push -u origin main
```

### Step 2: HuggingFace Space作成 🆕

1. [HuggingFace Spaces](https://huggingface.co/spaces) にアクセス
2. "Create new Space" をクリック
3. 設定：
   - **Space name**: `dots-ocr-space` （任意）
   - **License**: Apache 2.0
   - **SDK**: Gradio
   - **Hardware**: T4 small（無料GPU）
4. Space作成後、以下ファイルをアップロード：
   - `huggingface-space/app.py`
   - `huggingface-space/requirements.txt`  
   - `huggingface-space/README.md`
5. デプロイ完了まで待機（約5-10分）

### Step 3: Railway バックエンドデプロイ

1. [Railway Dashboard](https://railway.app/dashboard) にアクセス
2. "New Project" → "Deploy from GitHub repo"
3. 作成したリポジトリを選択
4. Root directoryを `/backend` に設定
5. 環境変数を設定：
   ```
   HUGGINGFACE_SPACE_NAME=yourusername/dots-ocr-space
   PORT=8000
   ENVIRONMENT=production
   ```
6. デプロイ完了後、生成されたURLをコピー

### Step 4: Vercel フロントエンドデプロイ

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