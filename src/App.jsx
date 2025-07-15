// src/App.jsx (Final Corrected Version for React 18)

import { useState, useEffect } from 'react';
import { Upload, Camera, AlertTriangle, CheckCircle, Loader2, Video, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx';

// 引入 react-leaflet 和聚合套件
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster'; 

// 引入必要的 CSS
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/lib/assets/MarkerCluster.Default.css'; 

import './App.css';

// 部署前務必修改此處
const API_BASE_URL = 'https://bear-detection-backend2.onrender.com'; 

function App() {
  const [activeTab, setActiveTab] = useState('image');
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [detectionResult, setDetectionResult] = useState(null)
  const [error, setError] = useState(null)
  
  const [mapLocations, setMapLocations] = useState([]);
  const [isMapLoading, setIsMapLoading] = useState(true);

  // useEffect 現在只負責單純地獲取資料
  useEffect(() => {
    setIsMapLoading(true);
    fetch(`${API_BASE_URL}/api/map`)
      .then(res => {
        if (!res.ok) throw new Error('網路回應錯誤');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setMapLocations(data.locations);
        } else {
          console.error("獲取點位資料失敗:", data.error);
          setMapLocations([]);
        }
      })
      .catch(err => {
        console.error("載入地圖失敗:", err);
        setMapLocations([]);
      })
      .finally(() => {
        setIsMapLoading(false);
      });
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedFile(null);
    setDetectionResult(null);
    setError(null);
    setIsUploading(false);
  };
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setDetectionResult(null);
      setError(null);
    }
  };
  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    setDetectionResult(null);
    const formData = new FormData();
    const isImageMode = activeTab === 'image';
    const apiUrl = isImageMode 
        ? `${API_BASE_URL}/api/detect` 
        : `${API_BASE_URL}/api/analyze_video`;
    const formKey = isImageMode ? 'image' : 'video';
    formData.append(formKey, selectedFile);
    try {
        const response = await fetch(apiUrl, { method: 'POST', body: formData });
        if (!response.ok) throw new Error(`伺服器錯誤! 狀態碼: ${response.status}`);
        const data = await response.json();
        if (data.success === false) throw new Error(data.error || '檢測失敗');

        if (isImageMode) {
            setDetectionResult({
                type: 'image',
                bear_detected: data.bear_detected,
                confidence: data.confidence,
                processed_image: data.processed_image,
                message: data.bear_detected 
                    ? `在圖片中偵測到台灣黑熊！信心度: ${Math.round(data.confidence * 100)}%`
                    : '未在圖片中偵測到台灣黑熊'
            });
        } else { 
            setDetectionResult({
                type: 'video',
                alert_sent: data.alert_sent,
                max_duration: data.max_consecutive_duration_seconds,
            });
        }
    } catch (error) {
        console.error('檢測失敗:', error);
        setError(`檢測失敗: ${error.message}`);
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Camera className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">台灣黑熊偵測預警系統</h1>
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
                  上傳圖片或影片進行偵測
                </CardTitle>
                <CardDescription>
                  請先選擇右上方使用圖片或影片進行偵測
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
                {/* ✅ 修正後的圖片結果顯示區塊 */}
                {detectionResult && detectionResult.type === 'image' && (
                  <div className="space-y-4">
                    <Alert className={detectionResult.bear_detected ? 'border-orange-500 bg-orange-50' : 'border-green-500 bg-green-50'}>
                      {detectionResult.bear_detected ? <AlertTriangle className="h-4 w-4 text-orange-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                      <AlertTitle>{detectionResult.bear_detected ? '偵測到目標！' : '未偵測到目標'}</AlertTitle>
                      <AlertDescription>
                        {detectionResult.message}
                      </AlertDescription>
                    </Alert>
                    {/* 如果有偵測到，就顯示標示後的圖片 */}
                    {detectionResult.processed_image && (
                      <div className="border rounded-lg overflow-hidden">
                        <img src={`data:image/jpeg;base64,${detectionResult.processed_image}`} alt="Detection Result" />
                      </div>
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
                請上傳影片，系統將逐幀分析，偵測到黑熊時將發送 Telegram 提醒
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
              {/* ✅ 修正後的影片結果顯示區塊 */}
              {detectionResult && detectionResult.type === 'video' && (
                <div className="space-y-4">
                  <Alert className={detectionResult.alert_sent ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
                    {detectionResult.alert_sent ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                    <AlertTitle>{detectionResult.alert_sent ? '⚠️ 已觸發黑熊預警！' : '✅ 未觸發預警'}</AlertTitle>
                    <AlertDescription>
                      影片分析完成。
                      {detectionResult.alert_sent 
                        ? '偵測到黑熊連續出現超過3秒，系統已發送 Telegram 通知。' 
                        : `偵測到黑熊最長連續出現時間為 ${detectionResult.max_duration} 秒，未達到 3 秒預警條件。`}
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
            <CardTitle className="flex items-center">
              <MapIcon className="h-5 w-5 mr-2" />
              地圖顯示區域
            </CardTitle>
            <CardDescription>這裡將顯示台灣黑熊的分布地圖</CardDescription>
          </CardHeader>
          <CardContent className="h-96">
            {isMapLoading ? (
              <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-gray-500" /></div>
            ) : (
              <MapContainer center={[23.97565, 120.97388]} zoom={7} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MarkerClusterGroup chunkedLoading>
                  {mapLocations.map((loc, index) => (
                    <Marker key={index} position={[loc.lat, loc.lng]}>
                      <Popup>
                        <div dangerouslySetInnerHTML={{ __html: loc.popup_html }} />
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              </MapContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>關於台灣黑熊偵測預警系統</CardTitle></CardHeader>
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
          <div className="text-center text-gray-500 text-sm"><p>台灣黑熊偵測預警系統 © 2025 - 致力於人熊共榮之使命</p></div>
        </div>
      </footer>
    </div>
  )
}
export default App;
