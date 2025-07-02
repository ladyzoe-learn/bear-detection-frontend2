// src/App.test.jsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // 確保這個也被導入，才能使用 toBeInTheDocument 等匹配器
import App from './App'; // 根據您的App.jsx的路徑調整

describe('App Component', () => {
  test('renders the main application title or some key element', () => {
    render(<App />);

    // 這裡您需要根據您的 App.jsx 實際渲染的內容來調整。
    // 例如，如果您的App組件中顯示了 "熊熊偵測系統" 這樣的標題，您可以這樣寫：
    const mainHeading = screen.getByRole('heading', { name: /台灣黑熊偵測系統/i, level: 1 });
    expect(mainHeading).toBeInTheDocument();

    // 或者，如果您的App組件中有一個按鈕，您可以這樣寫：
    // const buttonElement = screen.getByRole('button', { name: /開始偵測/i });
    // expect(buttonElement).toBeInTheDocument();
  });

  // 您可以在這裡添加更多測試用例，例如：
  // test('performs an action and updates the UI', async () => {
  //   render(<App />);
  //   // 模擬使用者操作
  //   // 斷言 UI 變化
  // });
});