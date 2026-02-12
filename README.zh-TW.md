# OpsBridge Navigation 🛸

> **專為現代 DevOps 團隊打造的工程師級服務導航。**

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Success-emerald.svg)]()
[![i18n](https://img.shields.io/badge/i18n-繁體中文%20%7C%20EN-blue.svg)]()

[English](./README.md) | [繁體中文](#chinese)

---

<a name="chinese"></a>
## 📖 產品介紹

**OpsBridge Navigation** 是一款以設定檔驅動 (Schema-Driven) 的維運導航中心。在複雜的微服務架構中，維護數以百計的瀏覽器書籤是一場災難。OpsBridge 提供了一個動態導航矩陣，將 **服務 (Services)** 與 **資源類型 (Columns)** 結合，並支持跨 **環境 (Environments)** 的即時切換。

本產品採「工程師優先」設計美學，強調高資料密度、豐富的鍵盤快捷鍵、以及完美的深色模式體驗。

### ✨ 核心功能

- 🏗️ **動態導航矩陣**: 自動將服務連結對應到分類欄位，結構清晰，支援互動式格狀視圖。
- 🌍 **環境感知切換**: 一鍵切換 `Dev`, `Staging`, `Prod`，所有 URL 連結會根據環境變數自動更新。
- 🧩 **階層式服務架構**: 支援父子服務關聯，自動巢狀顯示與分群視圖。
- 📊 **自動分群顯示**: 服務依群組自動分類並顯示區段標題，列表與卡片兩種視圖皆支援。
- 🌐 **雙語介面 (EN / 繁體中文)**: 完整 i18n 支援，可即時切換語言；服務名稱支援雙語顯示。
- 🟢 **服務健康狀態 UI**: 整合服務健康度指示燈（正常、警告、異常），支持動態警示。
- 🏷️ **標籤過濾系統**: 透過功能標籤（如 `#frontend`, `#critical`）瞬間篩選整個儀表板。
- 🚧 **維護模式**: 在元數據中標記維護中服務，顯示專屬 UI 標示與操作警告。
- 🕒 **最近訪問歷史**: 自動追蹤點擊行為，並在側邊欄提供「最近訪問」快速存取。
- ⚡ **批量操作工具**: 支援「一鍵打開環境所有連結」或「格式化複製連結」到剪貼簿。
- 👤 **團隊負責人整合**: 綁定負責人與 Slack 頻道，加速團隊溝通效率。
- 🔍 **快速搜尋 / 命令面板**: 毫秒級搜尋，或使用 `Ctrl+K` 快速定位服務或特定資源連結。
- 📝 **隨手筆記 (Scratchpad)**: 內建 Markdown 編輯器，方便暫存技術筆記或程式碼片段。
- 📣 **全域公告系統**: 置頂公告欄，用於發布維運通知或系統故障告警。
- 💾 **YAML 同步與備份**: 支援匯出/匯入全量 YAML 配置，完美適配版本控制 (GitOps)。
- 📚 **互動式教學**: 內建新手導覽，幫助工程師快速上手。
- 🔗 **可收合巢狀連結**: 資源連結支援父子階層，點擊即可展開/收合。
- 🎯 **原地編輯連結**: 在列表與卡片視圖中直接編輯連結，無需跳轉頁面。

---

## 🏗️ 系統架構

```
┌─────────────────────────┐
│    Frontend (Vite/React) │  ← Port 5173 (dev) / 80 (prod via Nginx)
│    TypeScript + Zustand  │
└──────────┬──────────────┘
           │ /api proxy
┌──────────▼──────────────┐
│    Backend (Node.js)     │  ← Port 3001
│    Express + TypeScript  │
└──────────┬──────────────┘
           │
┌──────────▼──────────────┐
│    MongoDB 7             │  ← Port 27017
└─────────────────────────┘
```

---

## 🚀 快速開始

### 前置需求
- Node.js 22+
- MongoDB 7+（或使用 Docker）

### 本地開發
```bash
# 前端
cd frontend
npm install
npm run dev
```
開啟 [http://localhost:5173](http://localhost:5173)

```bash
# 後端
cd backend
npm install
npm run dev
```

### 使用 Docker Compose 執行
```bash
docker compose up -d
```
開啟 [http://localhost:8080](http://localhost:8080)

啟動後會有三個容器：
| 服務 | 連接埠 | 說明 |
|------|--------|------|
| `ops-navigation` | 8080 | 前端（Nginx 靜態資源） |
| `api` | 3001 | 後端 API（Node.js） |
| `mongo` | 27017 | MongoDB 資料庫 |

### 部署至 Kubernetes
Kubernetes 部署檔案位於 `k8s/` 目錄：
```bash
kubectl apply -f k8s/
```

---

## 📚 使用指南

### 1. 互動式教學
點擊側邊欄的 **使用教學** 頁籤，查看可視化的系統操作指南。

### 2. 配置環境 (Environments)
前往 **系統設定 > 環境管理**。新增您的部署目標（如：`dev`, `stage`, `prod`）。
- 您可以使用 **群組分類** 功能，並透過萬用字元（如 `lab-*`）自動將符合名稱的環境歸類在一起。

### 3. 定義分類欄位 (Columns)
前往 **系統設定 > 欄位設定**。建立如 `監控面板`、`日誌系統`、`CI/CD` 等分類。
- 這些分類將成為導航矩陣中的「直欄」。

### 4. 新增服務 (Services)
前往 **系統設定 > 服務清單**。註冊您的微服務。
- **列表 / 卡片視圖**: 切換兩種視圖，兩者皆支援依群組自動分類，顯示區段標題與計數徽章。
- **階層式服務**: 可在父服務下建立子服務，支援巢狀顯示（例如：`GCP > GKE`, `GCP > GCE`）。
- **資源連結**: 在兩種視圖中都可直接新增/編輯連結。每個連結對應到一個欄位，並可選擇性綁定特定環境。
- **巢狀連結**: 連結本身也支援父子階層 — 在父連結下新增子連結，實現細緻的資源分層。
- **雙語名稱**: 每個服務和連結都支援英文與中文顯示名稱。
- **元數據**: 可設定群組、標籤、描述與負責人資訊。
- **拖拽排序**: 在列表視圖中（無篩選條件時），可拖拽服務改變排列順序。

### 5. 應用程式管理 (Applications)
點擊側邊欄的 **應用程式 (Applications)**。註冊應用程式並關聯至現有服務，打造統一的管理視圖。

### 6. 同步與備份 (Import/Export)
進階用戶可前往 **系統設定 > 同步與備份**。
- 匯出完整 YAML 配置至剪貼簿。
- 直接貼上 YAML 進行匯入。
- 使用 **快速代碼片段 (Smart Snippets)** 快速置入標準的 Prometheus、ELK 等工具連結定義。

---

## 🎨 設計規格
OpsBridge 採用自定義的 **「工程師高對比」** 佈景主題：
- **字體設計**: 極致的閱讀體驗，亮色模式使用 **純黑色** 字體，暗色模式使用 **純白色** 字體。
- **點綴色**: 琥珀金 (Amber/Gold)，確保視覺焦點清晰、互動元素醒目。
- **介面細節**: 精細的邊框與磨砂玻璃效果 (Backdrop-blur) 營造專業感。
- **等寬字型**: 技術性元素使用等寬字型，確保高密度資料的可讀性。

---

## ☕ 支持作者

如果你覺得這個專案對你有幫助，歡迎請我喝杯咖啡！

<a href="https://buymeacoffee.com/alanwang1207" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

---

## 📄 授權條款
本專案採用 MIT 授權條款。
