# OCR App - dots.ocr Clone

高精度OCRモデル（dots.ocr）を使用したWebアプリケーション

## 🚀 特徴

- **高精度OCR**: dots.ocr (GOT-OCR2_0) モデルを使用
- **多言語対応**: 日本語、英語、中国語など80以上の言語に対応
- **レイアウト検出**: テキスト、テーブル、図表の構造を認識
- **リアルタイム処理**: アップロード後即座に処理結果を表示
- **Web最適化**: モバイル・デスクトップ両対応

## 🏗️ アーキテクチャ

```
Frontend (Vercel)     Backend (Railway)     OCR API (Replicate)
    Next.js     <-->     FastAPI        <-->    dots.ocr
```

## 💰 コスト構成

- **Vercel**: 無料
- **Railway**: $5/月
- **Replicate**: 従量課金（月1000枚で約$10-20）
- **合計**: 約$15-25/月

## 🛠️ 技術スタック

### フロントエンド
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion

### バックエンド
- Python 3.12
- FastAPI
- Uvicorn
- Replicate API
- Pillow

### インフラ
- Vercel (Frontend)
- Railway (Backend)
- GitHub (Repository)

## 📋 開発状況

- [x] プロジェクト初期化
- [ ] フロントエンドUI実装
- [ ] バックエンドAPI実装
- [ ] Replicate API統合
- [ ] デプロイ設定
- [ ] E2Eテスト

## 🚦 開発開始

### 必要なアカウント

1. [GitHub](https://github.com) - 無料
2. [Vercel](https://vercel.com) - 無料
3. [Railway](https://railway.app) - $5/月
4. [Replicate](https://replicate.com) - 従量課金

### ローカル開発

```bash
# リポジトリクローン
git clone <repository-url>
cd ocr

# フロントエンド
cd frontend
npm install
npm run dev

# バックエンド
cd ../backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 📄 ライセンス

MIT License

---

Built with ❤️ using dots.ocr technology