import { useState } from 'react'
import { Upload, Camera, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [detectionResult, setDetectionResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      setDetectionResult(null)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('image', selectedFile)

    try {
      const response = await fetch('/api/detect', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success === false) {
        throw new Error(data.error || '檢測失敗')
      }

      setDetectionResult({
        bear_detected: data.bear_detected,
        confidence: data.confidence,
        processed_image: data.processed_image,
        message: data.bear_detected 
          ? `在圖片中偵測到台灣黑熊！信心度: ${Math.round(data.confidence * 100)}%`
          : '未在圖片中偵測到台灣黑熊'
      })

    } catch (error) {
      console.error('檢測失敗:', error)
      setError(`檢測失敗: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* 標題列 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Camera className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">台灣黑熊偵測系統</h1>
            </div>
            <div className="text-sm text-gray-500">
              Taiwan Black Bear Detection
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              上傳影像進行偵測
            </CardTitle>
            <CardDescription>
              請上傳圖片，系統將自動偵測是否有台灣黑熊出沒
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">點擊上傳</span> 或拖拽檔案到此處
                  </p>
                  <p className="text-xs text-gray-500">支援 PNG, JPG, JPEG 格式</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm text-blue-700">
                  已選擇檔案: {selectedFile.name}
                </span>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      偵測中...
                    </>
                  ) : (
                    '開始偵測'
                  )}
                </Button>
              </div>
            )}

            {error && (
              <Alert className="border-red-500 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertTitle>錯誤</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {detectionResult && (
              <div className="space-y-4">
                <Alert className={detectionResult.bear_detected ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
                  {detectionResult.bear_detected ? (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <AlertTitle>
                    {detectionResult.bear_detected ? '⚠️ 偵測到台灣黑熊！' : '✅ 未偵測到黑熊'}
                  </AlertTitle>
                  <AlertDescription>
                    {detectionResult.message}
                  </AlertDescription>
                </Alert>

                {detectionResult.processed_image && (
                  <Card>
                    <CardHeader>
                      <CardTitle>處理後的圖片</CardTitle>
                      <CardDescription>
                        {detectionResult.bear_detected ? '偵測到的黑熊已用綠色框標示' : '原始圖片（未偵測到黑熊）'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <img 
                        src={`data:image/jpeg;base64,${detectionResult.processed_image}`}
                        alt="處理後的圖片"
                        className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 說明區塊 */}
        <Card>
          <CardHeader>
            <CardTitle>關於台灣黑熊偵測系統</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              本系統使用先進的 YOLOv8 深度學習模型，專門訓練用於識別台灣黑熊。
              系統可以幫助研究人員、保育工作者和民眾快速識別野外相機拍攝到的台灣黑熊影像。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">使用方法：</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>點擊上方區域選擇圖片</li>
                  <li>支援 PNG、JPG、JPEG 格式</li>
                  <li>點擊「開始偵測」按鈕</li>
                  <li>等待系統分析結果</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">注意事項：</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>建議使用清晰的圖片</li>
                  <li>圖片大小建議不超過 10MB</li>
                  <li>系統會自動標示偵測到的黑熊</li>
                  <li>結果僅供參考，請以專業判斷為準</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>台灣黑熊偵測系統 © 2024 - 致力於台灣黑熊保育工作</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

