# 生活英文口說實驗室（階段 A：Demo）

用固定的測試對話完成四個畫面：首頁、中文聊天、英文對話、英文練習。沒有連線任何 AI，不需要 API Key，不會產生費用。

## 在電腦上啟動

1. 安裝 Node.js 20 以上（https://nodejs.org）。
2. 在這個資料夾打開終端機，執行：
   ```
   npm install
   npm run dev
   ```
3. 畫面會顯示 `Network: http://192.168.x.x:5173`。iPhone 和電腦連同一個 Wi‑Fi 時，可在 iPhone Safari 輸入這個網址。
   （注意：iPhone 用這種 http 網址時，Safari 不允許使用麥克風；錄音要等階段 C 用 https 網址測試。）

## 自動測試

```
npm test
```

檢查固定英文是否保留原本的輪次與說話者、沒有加入貨幣單位、沒有假設住戶已同意、語塊能組回整句，以及 IndexedDB 儲存、重新開啟與刪除。

## 檔案說明

- `src/demoData.ts`：固定的中文對話與英文、分段、簡單說內容
- `src/types.ts`：每一輪對話的結構化資料格式
- `src/db.ts`：IndexedDB 本機紀錄
- `src/speech.ts`：英文播放（瀏覽器內建語音）
- `src/useRecorder.ts`：錄音（只留在當次頁面）
- `src/screens/`：四個畫面
