# Railway $5プラン最適化Dockerfile
FROM python:3.12-slim

# 作業ディレクトリ設定
WORKDIR /app

# システム依存関係をインストール（最小限）
RUN apt-get update && apt-get install -y \
    --no-install-recommends \
    gcc \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Pythonの要件をインストール
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY . .

# 非rootユーザーで実行（セキュリティ向上）
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Railwayが環境変数PORTを設定するため、それを使用
EXPOSE 8000

# Uvicornでアプリケーション起動
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1