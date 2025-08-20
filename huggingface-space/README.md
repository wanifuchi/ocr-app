---
title: dots.ocr (GOT-OCR2_0) - 高精度OCR API
emoji: 🔍
colorFrom: blue
colorTo: purple
sdk: gradio
sdk_version: 4.0.0
app_file: app.py
pinned: false
license: apache-2.0
hardware: t4-small
---

# 🔍 dots.ocr (GOT-OCR2_0) - 高精度OCR API

HuggingFace Spaceで動作する高精度OCRアプリケーションです。

## 🌟 特徴

- **高精度OCR**: 95%以上の認識精度
- **多言語対応**: 日本語、英語、中国語など80以上の言語
- **レイアウト検出**: テキスト、テーブル、図表の構造認識
- **API対応**: RESTful API経由での利用可能
- **GPU最適化**: T4 GPU使用で高速処理

## 🚀 使用方法

### Webインターフェース
1. 画像をアップロード
2. OCRタイプを選択（ocr/format/fine-grained）
3. 処理開始ボタンをクリック

### API利用
```python
from gradio_client import Client

client = Client("your-username/dots-ocr-space")
result = client.predict(
    image_path,  # 画像ファイルパス
    api_name="/ocr_api"
)
print(result)
```

## 📊 OCRタイプ

- **ocr**: 基本的なOCR処理
- **format**: フォーマットを保持したOCR
- **fine-grained**: 詳細な解析を含むOCR

## 🔧 技術仕様

- **モデル**: ucaslcl/GOT-OCR2_0
- **フレームワーク**: PyTorch + Transformers
- **GPU**: NVIDIA T4
- **インターフェース**: Gradio 4.0

## 🌐 統合例

このSpaceは外部のWebアプリケーションから呼び出すことができます：

```python
import requests
import json

# HuggingFace Space APIエンドポイント
api_url = "https://your-username-dots-ocr-space.hf.space/api/predict"

# 画像をBase64エンコードしてPOST
response = requests.post(api_url, 
    json={"data": [image_base64]},
    headers={"Content-Type": "application/json"}
)

result = response.json()
print(result["data"][0])  # OCR結果
```

## 📝 ライセンス

Apache 2.0 License

## 🤝 貢献

Issue報告やPull Requestは歓迎です。

---

**Powered by dots.ocr (GOT-OCR2_0) • Built with Gradio**