# OpsBridge Navigation 🛸

> **專為現代 DevOps 團隊打造的工程師級服務導航。**

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Success-emerald.svg)]()
[![i18n](https://img.shields.io/badge/i18n-繁體中文%20%7C%20EN-blue.svg)]()

[English](./README.md) | [繁體中文](#chinese)

---

<a name="chinese"></a>
## 📖 產品介紹

**OpsBridge Navigation** 是一款以設定檔驅動 (Schema-Driven) 的維運導航中心。在複雜的微服務架構中，維護數以百計的瀏覽器書籤是一場災難。OpsBridge 提供了一個動態導航，將 **服務 (Services)** 與 **資源類型 (Columns)** 結合，並支持跨 **環境 (Environments)** 的即時切換。

本產品採「工程師優先」設計美學，強調高資料密度、豐富的鍵盤快捷鍵、以及完美的深色模式體驗。

### ✨ 核心功能

- 🏗️ **動態導航視圖**: 自動將服務連結對應到分類欄位，結構清晰。
- 🌍 **環境感知切換**: 一鍵切換 `Dev`, `Staging`, `Prod`，所有 URL 連結會根據環境變數自動更新。
- 🟢 **服務健康狀態 UI**: 整合服務健康度指示燈（正常、警告、異常），支持動態警示。
- 🏷️ **標籤過濾系統**: 透過功能標籤（如 `#frontend`, `#critical`）瞬間篩選整個儀表板。
- 🚧 **維護模式**: 在元數據中標記維護中服務，顯示專屬 UI 標示與操作警告。
- 🕒 **最近訪問歷史**: 自動追蹤點擊行為，並在側邊欄提供「最近訪問」快速存取。
- ⚡ **批量操作工具**: 支援「一鍵打開環境所有連結」或「格式化複製連結」到剪貼簿。
- ⌨️ **終端命令快捷複製**: 直接從服務元數據複製 `kubectl`、`ssh` 或自定義指令。
- 👤 **團隊負責人整合**: 綁定負責人與 Slack 頻道，加速團隊溝通效率。
- 🔍 **快速搜尋 (Cmd+K)**: 毫秒級搜尋，快速定位服務或特定資源連結。
- 📝 **隨手筆記 (Scratchpad)**: 內建 Markdown 編輯器，方便暫存技術筆記或程式碼片段。
- 📣 **全域公告系統**: 置頂公告欄，用於發布維運通知或系統故障告警。
- 💾 **YAML 同步與備份**: 支援匯出/匯入全量 YAML 配置，完美適配版本控制 (GitOps)。

---

## 🚀 快速開始

### 本地執行
```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```
開啟 [http://localhost:5173](http://localhost:5173)

### 使用 Docker 執行
```bash
docker-compose up -d
```
開啟 [http://localhost:8080](http://localhost:8080)

---

## 🛠️ 操作流程說明 (新手必讀)

### 第一步：配置環境 (Environments)
前往 **系統設定 > 環境管理**。新增您的部署目標（如：`dev`, `stage`, `prod`）。
- 您可以使用 **群組分類** 功能，並透過萬用字元（如 `lab-*`）自動將符合名稱的環境歸類在一起。

### 第二步：定義分類欄位 (Columns)
前往 **系統設定 > 欄位設定**。建立如 `監控面板`、`日誌系統`、`CI/CD` 等分類。
- 這些分類將成為導航中的「直欄 (Columns)」。

### 第三步：新增服務 (Services)
前往 **系統設定 > 服務清單**。註冊您的微服務。
- **元數據**: 標記負責人、描述或 SSH 連結。
- **特定環境連結**: 如果某個連結只存在於特定環境，可以在此手動新增 overrides。

### 第四步：同步與備份 (Import/Export)
如果您是進階用戶，可以前往 **系統設定 > 同步與備份**。
- 您可以直接貼上現有的 YAML 配置。
- 內建 **快速代碼片段 (Smart Snippets)**，點擊即可快速置入標準的 Prometheus 或 ELK 連結定義。

---

## ⌨️ 鍵盤快捷鍵

| 快捷鍵 | 動作 |
| :--- | :--- |
| `Cmd + K` | 開啟快速搜尋 |
| `1` | 切換至 卡片視圖 |
| `2` | 切換至 導航 (表格) 視圖 |
| `Esc` | 關閉任何彈出視窗 |

---

## 🎨 設計規格
OpsBridge 採用自定義的 **「工程師高對比 (Engineer High-Contrast)」** 佈景主題：
- **字體設計**: 極致的閱讀體驗，亮色模式使用 **純黑色** 字體，暗色模式使用 **純白色** 字體。
- **點綴色**: 琥珀金 (Amber/Gold)，確保視覺焦點清晰。
- **介面細節**: 採用精細的邊框與磨砂玻璃效果 (Backdrop-blur) 營造專業感。

---

## 📄 授權條款
本專案採用 MIT 授權條款。
