// src/App.jsx

import { useState, useEffect } from 'react'
import { Upload, Camera, AlertTriangle, CheckCircle, Loader2, Video } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx'
import './App.css'

// 👇 請將 'https://your-backend-name.onrender.com' 替換成您真實的後端網址
const API_BASE_URL = 'https://bear-detection-backend2.onrender.com';

function App() {
  const [activeTab, setActiveTab] = useState('image');
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [detectionResult, setDetectionResult] = useState(null)
  const [error, setError] = useState(null)
  const [mapHtml, setMapHtml] = useState('');
  const [isMapLoading, setIsMapLoading] = useState(true);

  // --- 地圖載入邏輯 (不變) ---
  useEffect(() => {
    const fetchMap = async () => {
        setIsMapLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/map`);
            if (!response.ok) {
                throw new Error('無法從後端獲取地圖資料');
            }
            const data = await response.json();
            if (data.success) {
                setMapHtml(data.map_html);
            } else {
                throw new Error(data.error || '獲取地圖資料失敗');
            }
        } catch (error) {
            console.error("載入地圖失敗:", error);
            setMapHtml('<p style="color: red; text-align: center;">地圖載入失敗</p>');
        } finally {
            setIsMapLoading(false);
        }
    };
    fetchMap();
}, []);

  // --- 功能函式 ---

  // 【修改】切換頁籤時，清空所有狀態，提供乾淨的介面
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedFile(null);
    setDetectionResult(null);
    setError(null);
    setIsUploading(false);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      setDetectionResult(null)
      setError(null)
    }
  }

  // 【修改】核心上傳邏輯，現在會根據 activeTab 決定行為
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setDetectionResult(null);

    const formData = new FormData();
    const isImageMode = activeTab === 'image';

    // 根據模式決定 API 路徑和表單的 key
    const apiUrl = isImageMode ? `${API_BASE_URL}/api/detect` : `${API_BASE_URL}/api/detect-video`;
    const formKey = isImageMode ? 'image' : 'video';
    formData.append(formKey, selectedFile);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`伺服器錯誤! 狀態碼: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success === false) {
        throw new Error(data.error || '檢測失敗');
      }

      // 根據模式，設定不同的結果
      if (isImageMode) {
        setDetectionResult({
          type: 'image', // 新增 type 屬性
          bear_detected: data.bear_detected,
          confidence: data.confidence,
          processed_image: data.processed_image,
          message: data.bear_detected 
            ? `在圖片中偵測到台灣黑熊！信心度: ${Math.round(data.confidence * 100)}%`
            : '未在圖片中偵測到台灣黑熊'
        });
      } else { // 影片模式的結果處理
        const framesWithBear = data.results.filter(r => r.bear_detected);
        const warningFrames = data.results.filter(r => r.bear_warning_triggered);
        setDetectionResult({
          type: 'video', // 新增 type 屬性
          total_frames: data.total_frames_processed,
          bear_frames_count: framesWithBear.length,
          warning_triggered: warningFrames.length > 0,
          results: data.results, // 保留完整結果供詳細檢視
        });
      }

    } catch (error) {
      console.error('檢測失敗:', error);
      setError(`檢測失敗: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  }

  // --- 畫面渲染 ---

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
            <nav>
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'image' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'}`}
                onClick={() => handleTabChange('image')}
              >
                圖片偵測
              </button>
              <button 
                className={`ml-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'video' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'}`}
                onClick={() => handleTabChange('video')}
              >
                影片偵測
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ===== 條件渲染邏輯開始 ===== */}
        {activeTab === 'image' ? (
          // ========================
          //   圖片偵測 UI (不變)
          // ========================
          <>
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
                {/* ... 上傳 UI ... */}
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">點擊上傳</span> 或拖拽檔案到此處</p>
                      <p className="text-xs text-gray-500">支援 PNG, JPG, JPEG 格式</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                  </label>
                </div>
                {/* ... 已選檔案與上傳按鈕 ... */}
                {selectedFile && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm text-blue-700">已選擇檔案: {selectedFile.name}</span>
                    <Button onClick={handleUpload} disabled={isUploading} className="bg-green-600 hover:bg-green-700">
                      {isUploading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />偵測中...</>) : ('開始偵測')}
                    </Button>
                  </div>
                )}
                {/* ... 錯誤與結果顯示 ... */}
                {error && (<Alert className="border-red-500 bg-red-50"><AlertTriangle className="h-4 w-4 text-red-500" /><AlertTitle>錯誤</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>)}
                {detectionResult && detectionResult.type === 'image' && (
                  <div className="space-y-4">
                    <Alert className={detectionResult.bear_detected ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
                      {detectionResult.bear_detected ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                      <AlertTitle>{detectionResult.bear_detected ? '⚠️ 偵測到台灣黑熊！' : '✅ 未偵測到黑熊'}</AlertTitle>
                      <AlertDescription>{detectionResult.message}</AlertDescription>
                    </Alert>
                    {detectionResult.processed_image && (
                      <Card><CardHeader><CardTitle>處理後的圖片</CardTitle><CardDescription>{detectionResult.bear_detected ? '偵測到的黑熊已用綠色框標示' : '原始圖片（未偵測到黑熊）'}</CardDescription></CardHeader><CardContent><img src={`data:image/jpeg;base64,${detectionResult.processed_image}`} alt="處理後的圖片" className="w-full max-w-2xl mx-auto rounded-lg shadow-lg" /></CardContent></Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          // ========================
          //  【新增】影片偵測 UI
          // ========================
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="h-5 w-5 mr-2" />
                上傳影片進行偵測
              </CardTitle>
              <CardDescription>
                請上傳影片，系統將逐幀分析，偵測到黑熊時將發送 LINE 提醒
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ... 上傳 UI ... */}
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Video className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">點擊上傳</span> 或拖拽檔案到此處</p>
                    <p className="text-xs text-gray-500">支援 MP4, MOV, AVI 等格式</p>
                  </div>
                  <input type="file" className="hidden" accept="video/*" onChange={handleFileSelect} />
                </label>
              </div>
              {/* ... 已選檔案與上傳按鈕 ... */}
              {selectedFile && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm text-blue-700">已選擇檔案: {selectedFile.name}</span>
                  <Button onClick={handleUpload} disabled={isUploading} className="bg-green-600 hover:bg-green-700">
                    {isUploading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />偵測中...</>) : ('開始偵測')}
                  </Button>
                </div>
              )}
              {/* ... 錯誤與結果顯示 ... */}
              {error && (<Alert className="border-red-500 bg-red-50"><AlertTriangle className="h-4 w-4 text-red-500" /><AlertTitle>錯誤</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>)}
              {detectionResult && detectionResult.type === 'video' && (
                <div className="space-y-4">
                  <Alert className={detectionResult.warning_triggered ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
                    {detectionResult.warning_triggered ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                    <AlertTitle>{detectionResult.warning_triggered ? '⚠️ 觸發黑熊預警！' : '✅ 未觸發預警'}</AlertTitle>
                    <AlertDescription>
                      共處理 {detectionResult.total_frames} 個影格，在 {detectionResult.bear_frames_count} 個影格中偵測到黑熊。
                      {detectionResult.warning_triggered ? ' 系統已發送 LINE 通知。' : ' 未達到預警條件。'}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* ===== 其他區塊 (地圖、關於) 保持不變 ===== */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>地圖顯示區域</CardTitle>
            <CardDescription>這裡將顯示台灣黑熊的分布地圖</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            {isMapLoading ? <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-gray-500" /></div> : <div className="w-full h-64 overflow-auto" dangerouslySetInnerHTML={{ __html: mapHtml }} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>關於台灣黑熊偵測系統</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">本系統使用先進的 YOLOv8 深度學習模型，專門訓練用於識別台灣黑熊。系統可以幫助研究人員、保育工作者和民眾快速識別野外相機拍攝到的台灣黑熊影像。</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><h4 className="font-semibold text-gray-800 mb-2">使用方法：</h4><ul className="list-disc list-inside text-gray-600 space-y-1"><li>點擊上方區域選擇圖片或影片</li><li>根據選擇的模式上傳對應檔案</li><li>點擊「開始偵測」按鈕</li><li>等待系統分析結果</li></ul></div>
              <div><h4 className="font-semibold text-gray-800 mb-2">注意事項：</h4><ul className="list-disc list-inside text-gray-600 space-y-1"><li>建議使用清晰的影像</li><li>檔案大小建議不超過 10MB</li><li>系統會自動標示偵測到的黑熊</li><li>結果僅供參考，請以專業判斷為準</li></ul></div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm"><p>台灣黑熊偵測系統 © 2024 - 致力於台灣黑熊保育工作</p></div>
        </div>
      </footer>
    </div>
  )
}

export default App;

