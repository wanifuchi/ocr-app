import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 400 }
      )
    }

    // ファイルサイズ制限 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ファイルサイズは10MB以下にしてください' },
        { status: 400 }
      )
    }

    // ファイルタイプ確認
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '画像ファイルを選択してください' },
        { status: 400 }
      )
    }

    // バックエンドサーバー（Railway）のURLを環境変数から取得
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    
    // Railway APIサーバーに画像を送信
    const backendFormData = new FormData()
    backendFormData.append('file', file)

    const response = await fetch(`${backendUrl}/api/v1/ocr/process`, {
      method: 'POST',
      body: backendFormData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'バックエンドサーバーエラー' }))
      throw new Error(errorData.error || `HTTPエラー: ${response.status}`)
    }

    const result = await response.json()
    
    return NextResponse.json({
      text: result.text || '',
      confidence: result.confidence || null,
      layout: result.layout || null,
      processing_time: result.processing_time || null
    })

  } catch (error) {
    console.error('OCR API Error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'OCR処理でエラーが発生しました',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// CORS対応（必要に応じて）
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}