// src/components/VideoDetector.jsx

import React, { useState } from 'react';
import axios from 'axios';
import './VideoDetector.css'; // 我們稍後會建立這個 CSS 檔案

const VideoDetector = () => {
  // --- 狀態管理 ---
  // 1. 'image' 或 'video'，用來控制目前的偵測模式，預設為圖片
  const [detectionMode, setDetectionMode] = useState('image');
  
  // 2. 儲存使用者選擇的檔案
  const [selectedFile, setSelectedFile] = useState(null);
  
  // 3. 控制 UI 狀態 ('default', 'uploading', 'completed', 'error')
  const [status, setStatus] = useState('default');
  
  // 4. 儲存後端回傳的分析結果
  const [resultData, setResultData] = useState(null);
  
  // 5. 儲存錯誤訊息
  const [errorMessage, setErrorMessage] = useState('');

  // --- 核心功能函式 ---

  // 當使用者切換模式（圖片/影片）時呼叫
  const handleModeChange = (mode) => {
    setDetectionMode(mode);
    // 重置所有狀態，回到初始畫面
    setSelectedFile(null);
    setStatus('default');
    setResultData(null);
    setErrorMessage('');
  };

  // 當使用者透過選擇框選擇了檔案
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setStatus('file-selected'); // 更新狀態為「已選擇檔案」
    }
  };

  // 當使用者點擊「開始偵測」按鈕
  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('請先選擇一個檔案！');
      setStatus('error');
      return;
    }

    setStatus('uploading'); // 進入上傳中狀態
    setErrorMessage('');

    const formData = new FormData();
    const isImageMode = detectionMode === 'image';
    
    // 根據模式，決定 API 路徑和要傳送的 FormData key
    const apiUrl = isImageMode ? '/api/detect' : '/api/detect-video';
    const formKey = isImageMode ? 'image' : 'video';
    
    // 這裡的 formKey 必須和後端 `request.files[...]` 的 key 一致
    formData.append(formKey, selectedFile);
    
    // 替換成您後端的完整 URL
    const fullApiUrl = `https://bear-detection-backend2.onrender.com${apiUrl}`;

    try {
      console.log(`準備上傳檔案到: ${fullApiUrl}`);
      const response = await axios.post(fullApiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // 可選：如果您需要上傳進度
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`上傳進度: ${percentCompleted}%`);
        },
      });
      
      setResultData(response.data);
      setStatus('completed');
    } catch (err) {
      console.error("API 請求失敗:", err);
      // 處理 CORS 或其他網路錯誤
      if (err.message.includes('Network Error')) {
        setErrorMessage('網路連線錯誤或後端伺服器無回應。請檢查您的 CORS 設定與後端狀態。');
      } else if (err.response) {
        setErrorMessage(`偵測失敗: ${err.response.data.error || '伺服器發生未知錯誤'}`);
      } else {
        setErrorMessage('偵測失敗，請稍後再試。');
      }
      setStatus('error');
    }
  };
  
  // --- 畫面渲染 ---

  return (
    <div className="detector-container">
      {/* 1. 模式切換頁籤 */}
      <div className="mode-switcher">
        <button
          className={`tab-button ${detectionMode === 'image' ? 'active' : ''}`}
          onClick={() => handleModeChange('image')}
        >
          圖片偵測
        </button>
        <button
          className={`tab-button ${detectionMode === 'video' ? 'active' : ''}`}
          onClick={() => handleModeChange('video')}
        >
          影片偵測
        </button>
      </div>

      {/* 2. 主要內容區域 */}
      <div className="content-area">
        <h2>{detectionMode === 'image' ? '圖片偵測' : '影片偵測'}</h2>
        <p>
          {detectionMode === 'image'
            ? '上傳單張圖片，系統將分析其中是否有台灣黑熊。'
            : '上傳一段影片，系統將逐幀進行分析與偵測。'}
        </p>

        {/* 上傳框 */}
        <div className="upload-box">
          {/* 如果沒有選擇檔案，顯示選擇按鈕 */}
          {!selectedFile && (
            <>
              點擊下方按鈕或將檔案拖曳至此
              <label htmlFor="file-upload" className="custom-file-upload">
                選擇{detectionMode === 'image' ? '圖片' : '影片'}檔案
              </label>
              <input 
                id="file-upload" 
                type="file" 
                accept={detectionMode === 'image' ? 'image/png, image/jpeg' : 'video/mp4, video/mov'}
                onChange={handleFileSelect}
              />
            </>
          )}

          {/* 如果已選擇檔案，顯示檔案名稱 */}
          {selectedFile && (
            <div className="file-info">
              已選擇檔案： {selectedFile.name}
            </div>
          )}
        </div>

        {/* 開始偵測按鈕 */}
        <button
          className="start-button"
          onClick={handleUpload}
          disabled={!selectedFile || status === 'uploading'}
        >
          {status === 'uploading' ? '偵測中...' : '開始偵測'}
        </button>
        
        {/* 錯誤訊息顯示區 */}
        {status === 'error' && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
        
        {/* 結果顯示區 (您可以自訂這部分的呈現方式) */}
        {status === 'completed' && resultData && (
          <div className="result-area">
            <h3>偵測結果</h3>
            <pre>{JSON.stringify(resultData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDetector;