'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Image as ImageIcon, Download, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface OCRResult {
  text: string
  confidence?: number
  layout?: unknown
  processing_time?: number
  model_used?: string
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type.startsWith('image/')) {
      setFile(file)
      setError('')
      
      // プレビュー画像を作成
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setError('画像ファイルを選択してください')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: false
  })

  const processOCR = async () => {
    if (!file) return

    setIsProcessing(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ocr-app-production-91fe.up.railway.app'}/api/v1/ocr/process`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('OCR処理に失敗しました')
      }

      const result = await response.json()
      setOcrResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OCR処理でエラーが発生しました')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadResult = () => {
    if (!ocrResult) return

    const blob = new Blob([ocrResult.text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ocr-result-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const resetAll = () => {
    setFile(null)
    setImagePreview('')
    setOcrResult(null)
    setError('')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            OCR App
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            高精度OCRモデル (dots.ocr) による画像からテキスト抽出
          </p>
          <p className="text-sm text-gray-500">
            日本語、英語、中国語など80以上の言語に対応
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：画像アップロード */}
          <div className="space-y-6">
            {/* ファイルドロップゾーン */}
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400 bg-white'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">ファイルをドロップしてください</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    画像をドラッグ&ドロップするか、クリックして選択
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, JPEG, GIF, BMP, WebP
                  </p>
                </div>
              )}
            </div>

            {/* 画像プレビュー */}
            {imagePreview && (
              <div className="bg-white rounded-lg p-4 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <ImageIcon className="mr-2 h-5 w-5" />
                    プレビュー
                  </h3>
                  <button
                    onClick={resetAll}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    リセット
                  </button>
                </div>
                <Image
                  src={imagePreview}
                  alt="アップロードされた画像"
                  width={800}
                  height={600}
                  className="max-w-full h-auto rounded-lg shadow-sm"
                  unoptimized
                />
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={processOCR}
                    disabled={isProcessing}
                    className="
                      flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg
                      hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors
                    "
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        処理中...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        OCR処理開始
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 右側：結果表示 */}
          <div className="space-y-6">
            {/* エラー表示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* OCR結果 */}
            {ocrResult && (
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    OCR結果
                  </h3>
                  <button
                    onClick={downloadResult}
                    className="
                      flex items-center px-4 py-2 bg-green-600 text-white rounded-lg
                      hover:bg-green-700 transition-colors
                    "
                  >
                    <Download className="mr-2 h-4 w-4" />
                    ダウンロード
                  </button>
                </div>
                
                {/* メタデータ表示 */}
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ocrResult.confidence && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">信頼度</span>
                        <span className="text-sm font-medium">
                          {Math.round(ocrResult.confidence * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${ocrResult.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {ocrResult.processing_time && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">処理時間</span>
                        <span className="text-sm font-medium">
                          {ocrResult.processing_time.toFixed(2)}秒
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {ocrResult.model_used && (
                          <>使用モデル: {ocrResult.model_used}</>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">
                    {ocrResult.text}
                  </pre>
                </div>
              </div>
            )}

            {/* 処理中インジケーター */}
            {isProcessing && (
              <div className="bg-white rounded-lg p-8 shadow-md text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600">OCR処理中...</p>
                <p className="text-sm text-gray-500 mt-2">
                  画像の内容によって数秒〜数十秒かかる場合があります
                </p>
              </div>
            )}

            {/* 使用方法ガイド */}
            {!file && !ocrResult && (
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-medium mb-4">使用方法</h3>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">
                      1
                    </span>
                    左側のエリアに画像をドラッグ&ドロップまたはクリックして選択
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">
                      2
                    </span>
                    「OCR処理開始」ボタンをクリック
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">
                      3
                    </span>
                    処理完了後、抽出されたテキストが表示されます
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">
                      4
                    </span>
                    「ダウンロード」ボタンでテキストファイルとして保存可能
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* フッター */}
        <footer className="text-center mt-12 py-8 text-gray-500 text-sm">
          <p>Powered by dots.ocr (GOT-OCR2_0) • Built with Next.js & Replicate API</p>
        </footer>
      </div>
    </main>
  )
}
