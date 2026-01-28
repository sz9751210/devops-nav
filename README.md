# OpsBridge Matrix 

[English](#english) | [中文](#chinese)

<a name="english"></a>
## English

OpsBridge Matrix is a **Dynamic Service Matrix** designed for IT/DevOps teams. Unlike static bookmark walls, it uses a schema-driven approach to generate navigation links for your microservices across multiple environments and tools (Git, CI/CD, Logs, Metrics, Cloud).

### Key Features
- **Dynamic Matrix View**: Define services (rows) and resources (columns) once; links are generated automatically.
- **Context-Aware**: Switch between `Dev`, `Staging`, `Prod` globally. All links update instantly.
- **Template Logic**: Define URL patterns like `https://grafana.internal/d/{{service_id}}?var-env={{env}}`.
- **Quick Search**: Press `Cmd+K` to search for any service or specific resource (e.g., "payment logs").
- **Ops-First**: Compact design, keyboard shortcuts, and sticky columns for handling large matrices.

### Quick Start

#### Run Locally
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

#### Run with Docker
```bash
docker-compose up -d
```
Open [http://localhost:8080](http://localhost:8080)

### Configuration
Edit `public/default.yaml` (or valid path mapped in Docker) to configure your matrix.

```yaml
services:
  - id: my-service
    name: My Service
    overrides:
      logs: "https://custom-log-url..."
```

---

<a name="chinese"></a>
## 中文 (Chinese)

OpsBridge Matrix 是一款專為 IT/DevOps 團隊設計的**動態服務矩陣**。與傳統的靜態書籤牆不同，它採用設定檔驅動 (Schema-Driven) 的方式，自動為您的微服務生成跨環境、跨工具的導航連結。

### 核心功能
- **動態矩陣視圖**: 定義一次服務 (Rows) 與資源 (Columns)，自動生成結構化連結。
- **情境感知**: 全域切換 `Dev`, `Staging`, `Prod` 環境，所有連結即時更新。
- **模板邏輯**: 支援 URL 模板，例如 `https://grafana.internal/d/{{service_id}}?var-env={{env}}`。
- **快速搜尋**: 按下 `Cmd+K` 即可搜尋任何服務或特定資源 (例如：輸入 "payment logs")。
- **維運友善**: 緊湊的介面設計、鍵盤快捷鍵支援，以及適合大量資料的凍結欄位 (Sticky Columns) 功能。

### 快速開始

#### 本地執行
```bash
npm install
npm run dev
```
開啟 [http://localhost:5173](http://localhost:5173)

#### Docker 執行
```bash
docker-compose up -d
```
開啟 [http://localhost:8080](http://localhost:8080)

### 設定說明
編輯 `public/default.yaml` (或 Docker 掛載的路徑) 即可配置您的矩陣。
