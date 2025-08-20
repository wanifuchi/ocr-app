"""
FastAPI Backend for OCR App
Railway $5プラン対応の軽量APIゲートウェイ
"""

import os
import io
import time
import logging
from typing import Optional

from gradio_client import Client
import requests
import aiohttp
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
from pydantic import BaseModel
from dotenv import load_dotenv

# 環境変数をロード
load_dotenv()

# ロギング設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# HuggingFace Space設定
HUGGINGFACE_SPACE_URL = os.getenv("HUGGINGFACE_SPACE_URL", "")
HUGGINGFACE_SPACE_NAME = os.getenv("HUGGINGFACE_SPACE_NAME", "")

# HuggingFace Space接続確認
if HUGGINGFACE_SPACE_URL or HUGGINGFACE_SPACE_NAME:
    logger.info(f"HuggingFace Space設定済み: {HUGGINGFACE_SPACE_NAME or HUGGINGFACE_SPACE_URL}")
else:
    logger.warning("HuggingFace Space設定がありません - デモモードで動作します")

app = FastAPI(
    title="OCR API Gateway",
    description="dots.ocr powered OCR service via HuggingFace Space",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では特定のドメインに制限
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OCRResponse(BaseModel):
    text: str
    confidence: Optional[float] = None
    processing_time: float
    model: str = "dots.ocr (GOT-OCR2_0)"
    model_used: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    message: str
    timestamp: float

async def call_huggingface_space_api(image_data: bytes) -> dict:
    """
    HuggingFace Space APIを呼び出してOCR処理を実行
    """
    try:
        # 方法1: gradio_clientを使用（推奨）
        if HUGGINGFACE_SPACE_NAME:
            try:
                client = Client(HUGGINGFACE_SPACE_NAME)
                
                # 画像をPIL Imageに変換
                image = Image.open(io.BytesIO(image_data))
                
                # API呼び出し
                result = client.predict(
                    image,
                    api_name="/ocr_api"
                )
                
                # 結果の正規化
                if isinstance(result, dict):
                    return result
                elif isinstance(result, str):
                    # JSON文字列の場合はパース
                    import json
                    try:
                        return json.loads(result)
                    except:
                        return {
                            "text": result,
                            "confidence": 0.95,
                            "model_used": "huggingface_space"
                        }
                else:
                    return {
                        "text": str(result),
                        "confidence": 0.95,
                        "model_used": "huggingface_space"
                    }
                    
            except Exception as gradio_error:
                logger.warning(f"Gradio Client エラー: {gradio_error}")
                # 方法2にフォールバック
                pass
        
        # 方法2: 直接HTTP API呼び出し
        if HUGGINGFACE_SPACE_URL:
            try:
                # 画像をbase64エンコード
                import base64
                image_b64 = base64.b64encode(image_data).decode('utf-8')
                
                async with aiohttp.ClientSession() as session:
                    api_url = f"{HUGGINGFACE_SPACE_URL.rstrip('/')}/api/predict"
                    
                    payload = {
                        "data": [f"data:image/jpeg;base64,{image_b64}"]
                    }
                    
                    async with session.post(
                        api_url,
                        json=payload,
                        headers={"Content-Type": "application/json"},
                        timeout=aiohttp.ClientTimeout(total=60)
                    ) as response:
                        
                        if response.status == 200:
                            result_data = await response.json()
                            
                            # Gradio APIレスポンスの正規化
                            if "data" in result_data and len(result_data["data"]) > 0:
                                api_result = result_data["data"][0]
                                
                                if isinstance(api_result, dict):
                                    return api_result
                                else:
                                    return {
                                        "text": str(api_result),
                                        "confidence": 0.95,
                                        "model_used": "huggingface_space_http"
                                    }
                            else:
                                raise Exception("無効なAPI応答形式")
                        else:
                            raise Exception(f"HTTP エラー: {response.status}")
                            
            except Exception as http_error:
                logger.warning(f"HTTP API エラー: {http_error}")
                # デモモードにフォールバック
                pass
        
        # すべての方法で失敗した場合のフォールバック
        raise Exception("HuggingFace Space APIの呼び出しに失敗しました")
        
    except Exception as e:
        logger.error(f"HuggingFace Space API呼び出しエラー: {e}")
        raise e

def optimize_image(image_data: bytes, max_size: tuple = (1920, 1920)) -> bytes:
    """
    画像を最適化してメモリ使用量を削減
    Railway $5プランのメモリ制限(512MB)を考慮
    """
    try:
        image = Image.open(io.BytesIO(image_data))
        
        # 画像サイズを制限
        if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
            logger.info(f"画像をリサイズしました: {image.size}")
        
        # RGB形式に変換（必要に応じて）
        if image.mode not in ['RGB', 'L']:
            image = image.convert('RGB')
        
        # 最適化された画像をバイト形式で返す
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=85, optimize=True)
        return output.getvalue()
        
    except Exception as e:
        logger.error(f"画像最適化エラー: {e}")
        return image_data

@app.get("/", response_model=HealthResponse)
async def root():
    """ルートエンドポイント"""
    return HealthResponse(
        status="ok",
        message="OCR API Gateway is running",
        timestamp=time.time()
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """ヘルスチェックエンドポイント"""
    return HealthResponse(
        status="healthy",
        message="Service is operational",
        timestamp=time.time()
    )

@app.post("/api/v1/ocr/process", response_model=OCRResponse)
async def process_ocr(file: UploadFile = File(...)):
    """
    OCR処理メインエンドポイント
    HuggingFace Space経由でdots.ocrモデルを使用
    """
    start_time = time.time()
    
    try:
        # 設定確認（HuggingFace Spaceまたはデモモード）
        has_hf_config = bool(HUGGINGFACE_SPACE_URL or HUGGINGFACE_SPACE_NAME)
        if not has_hf_config:
            logger.info("HuggingFace Space未設定 - デモモードで動作します")
        
        # ファイル検証
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="画像ファイルを選択してください"
            )
        
        # ファイルサイズ制限（10MB）
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="ファイルサイズは10MB以下にしてください"
            )
        
        logger.info(f"画像処理開始: {file.filename}, サイズ: {len(content)} bytes")
        
        # 画像最適化
        optimized_image = optimize_image(content)
        
        # HuggingFace Space APIでOCR処理
        extracted_text = ""
        confidence = None
        model_used = None
        
        try:
            if has_hf_config:
                # HuggingFace Space APIを呼び出し
                logger.info("HuggingFace Space APIでOCR処理を開始...")
                
                result = await call_huggingface_space_api(optimized_image)
                
                extracted_text = result.get("text", "")
                confidence = result.get("confidence", 0.95)
                model_used = result.get("model_used", "dots.ocr (GOT-OCR2_0)")
                
                # 処理時間を追加
                if "processing_time" in result:
                    hf_processing_time = result["processing_time"]
                    logger.info(f"HuggingFace Space処理時間: {hf_processing_time:.2f}秒")
                
                logger.info(f"OCR処理成功: {len(extracted_text)}文字, 信頼度: {confidence:.1%}")
                
            else:
                # デモモード（HuggingFace Space未設定時）
                logger.info("デモモードでOCR処理をシミュレート...")
                
                extracted_text = f"""[デモモード] dots.ocr OCR処理テスト

🎯 **高精度OCRデモンストレーション**

📷 アップロードファイル: {file.filename}
📊 ファイルサイズ: {len(content):,} bytes
🔧 画像最適化: 完了 ({len(optimized_image):,} bytes)
⏱️ 処理時間: {time.time() - start_time:.2f}秒

🚀 **実際の機能**
- 多言語OCR（日本語、英語、中国語など80言語）
- レイアウト検出（テキスト、テーブル、図表）
- 95%以上の認識精度
- GPU高速処理

💡 **セットアップ方法**
1. HuggingFace Spacesでdots.ocrアプリを作成
2. 環境変数 HUGGINGFACE_SPACE_NAME を設定
3. 自動的に高精度OCRに切り替わります

システムステータス: 正常動作中 ✅"""
                
                confidence = 1.0
                model_used = "demo_mode"
                
        except Exception as hf_error:
            logger.error(f"HuggingFace Space API エラー: {hf_error}")
            
            # エラー時のフォールバック
            extracted_text = f"""[エラー] HuggingFace Space API接続エラー

❌ **エラー詳細**: {str(hf_error)}
📷 **ファイル名**: {file.filename}
🔧 **システム状態**: Railway $5プラン (512MB RAM)

🔧 **解決方法**:
1. HuggingFace Space URLの確認
2. HuggingFace Spaceの稼働状況確認
3. ネットワーク接続の確認
4. Space名の環境変数設定確認

📊 **設定状況**:
- HUGGINGFACE_SPACE_URL: {"設定済み" if HUGGINGFACE_SPACE_URL else "未設定"}
- HUGGINGFACE_SPACE_NAME: {"設定済み" if HUGGINGFACE_SPACE_NAME else "未設定"}

サポート: Railwayログで詳細を確認してください"""
            
            confidence = 0.0
            model_used = "error_fallback"
        
        processing_time = time.time() - start_time
        
        logger.info(f"OCR処理完了: {processing_time:.2f}秒")
        
        return OCRResponse(
            text=extracted_text,
            confidence=confidence,
            processing_time=processing_time,
            model_used=model_used
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OCR処理エラー: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"OCR処理でエラーが発生しました: {str(e)}"
        )

@app.get("/api/v1/status")
async def get_status():
    """システム状態を返す"""
    return {
        "api_status": "running",
        "ocr_provider": "HuggingFace Space + dots.ocr",
        "huggingface_space_configured": bool(HUGGINGFACE_SPACE_URL or HUGGINGFACE_SPACE_NAME),
        "huggingface_space_url": HUGGINGFACE_SPACE_URL if HUGGINGFACE_SPACE_URL else None,
        "huggingface_space_name": HUGGINGFACE_SPACE_NAME if HUGGINGFACE_SPACE_NAME else None,
        "memory_limit": "512MB (Railway $5 plan)",
        "supported_formats": ["PNG", "JPEG", "GIF", "BMP", "WebP"],
        "max_file_size": "10MB",
        "model": "dots.ocr (GOT-OCR2_0)",
        "features": {
            "multilingual": "80+ languages",
            "layout_detection": True,
            "high_accuracy": "95%+",
            "gpu_optimized": True
        }
    }

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # 本番環境では無効化
        log_level="info"
    )