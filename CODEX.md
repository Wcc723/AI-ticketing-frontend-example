# 專案結構說明（CODEX）

本文件說明此 Vite + Vue 3 專案的基本結構、進入點與開發腳本，協助快速理解與導航程式碼。

## 目錄樹概覽

```
vite-project/
├─ .vscode/                 # VS Code 開發設定
├─ node_modules/            # 相依套件（安裝後產生）
├─ public/
│  └─ favicon.ico           # 靜態資源（原樣拷貝到最終輸出）
├─ src/
│  ├─ App.vue               # 根元件
│  ├─ main.js               # 前端程式進入點（掛載 Vue 應用）
│  └─ router/
│     └─ index.js           # Vue Router 設定（目前 routes 為空）
├─ .gitignore
├─ index.html               # 應用 HTML 模板，載入 /src/main.js
├─ jsconfig.json            # 路徑別名設定（@ 指向 ./src）
├─ package.json             # 專案資訊、腳本與相依
├─ pnpm-lock.yaml           # 鎖定相依版本（使用 pnpm）
├─ README.md                # Vite + Vue 範本說明
├─ vite.config.js           # Vite 設定（含 @ 路徑別名、Vue/DevTools 外掛）
└─ dist/                    # 產出目錄（build 後產生）
```

## 關鍵檔案與角色

- `index.html`: 基本 HTML 模板，透過 `<script type="module" src="/src/main.js">` 載入前端程式。
- `src/main.js`: 建立並掛載 Vue 應用，註冊 `router`，將 `App.vue` 掛載至 `#app`。
- `src/App.vue`: 應用的根元件（目前為簡單展示）。
- `src/router/index.js`: 建立 `createRouter` 與 `createWebHistory`，目前 `routes: []` 可自行擴充。
- `vite.config.js`: 啟用 `@vitejs/plugin-vue` 與 `vite-plugin-vue-devtools`，設定 `@ -> ./src` 別名。
- `jsconfig.json`: 與 IDE 對齊的路徑別名設定，避免導入路徑相對層級過深。

## 相依與版本

- 前端: `vue@^3.5`, `vue-router@^4.5`
- 建置: `vite@^7`, `@vitejs/plugin-vue`, `vite-plugin-vue-devtools`
- Node 版本（engines）: `^20.19.0 || >=22.12.0`

## NPM 腳本

- `npm run dev`: 啟動開發伺服器（含熱重載）。
- `npm run build`: 建置專案至 `dist/`。
- `npm run preview`: 本機預覽 `dist/` 內容。

## 路徑別名與導入

- 於程式中可使用 `@/...` 導入 `src` 下的檔案。
  例：`import App from '@/App.vue'`

## 常見擴充建議（放置位置）

- 共用元件: `src/components/`
- 頁面模組: `src/views/` 或 `src/pages/`
- 靜態資源: `public/`（直接拷貝）或 `src/assets/`（經由打包器處理）
- 狀態管理: 視需求加入 Pinia（`src/stores/`）
- API 客戶端: `src/services/` 或 `src/api/`

以上為本專案的基本骨架與使用方式，可依實際需求擴充路由、頁面與模組。

