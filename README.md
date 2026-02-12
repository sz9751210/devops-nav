# OpsBridge Navigation 🛸

> **The Engineer-Ready Service Navigation for Modern DevOps Teams.**

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Success-emerald.svg)]()
[![i18n](https://img.shields.io/badge/i18n-EN%20%7C%20ZH--TW-blue.svg)]()

[English](#english) | [繁體中文](./README.zh-TW.md)

---

<a name="english"></a>
## 📖 Introduction

**OpsBridge Navigation** is a schema-driven navigation hub designed for complex microservice architectures. Instead of maintaining hundreds of static bookmarks, it provides a dynamic grid where **Services (Rows)** meet **Categories (Columns)** across multiple **Environments**.

Built with an "Engineer-First" aesthetic — high data density, rich keyboard shortcuts, and a polished dark mode experience.

### ✨ Key Features

- 🏗️ **Dynamic Navigation Matrix**: Automatically maps service links to category columns in an interactive grid.
- 🌍 **Contextual Environments**: One-click switching between `Dev`, `Staging`, `Prod` with synchronized URL updates.
- 🧩 **Hierarchical Services**: Support for parent-child service relationships with nested display and grouped views.
- 📊 **Grouped Views**: Services auto-categorized by group with section headers, available in both List and Grid views.
- 🌐 **Bilingual UI (EN / 繁體中文)**: Full i18n support with runtime language switching; service names support bilingual display.
- 🟢 **Service Health UI**: Integrated status indicators (Healthy, Warning, Error) with pulsing alerts.
- 🏷️ **Tag Filter System**: Instantly filter your entire dashboard by functional tags (e.g., `#frontend`, `#critical`).
- 🚧 **Maintenance Mode**: Mark services as under maintenance with dedicated UI flags.
- 🕒 **Recent Links History**: Automatically tracks your most visited links for one-click access in the sidebar.
- ⚡ **Bulk Actions**: Open all environment links at once or copy them formatted to your clipboard.
- 👤 **Ownership Integration**: Link services to owners and Slack channels for faster team communication.
- 🔍 **Quick Search / Command Palette**: Instant access to any service or resource via search or `Ctrl+K`.
- 📝 **Scratchpad**: A built-in markdown editor for temporary notes and snippets.
- 📣 **Announcement System**: Top-level banner for system-wide site maintenance or incident alerts.
- 💾 **YAML Sync/Backup**: Version-control your configuration with ease. Supports full export/import.
- 📚 **Interactive Tutorial**: Built-in guide to help new engineers get up to speed quickly.
- 🔗 **Collapsible Nested Links**: Resource links support parent-child hierarchy with expand/collapse.
- 🎯 **Inline Link Editor**: Edit resource links directly from both List and Grid views without navigating away.

---

## 🏗️ Architecture

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

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- MongoDB 7+ (or use Docker)

### Run Locally (Development)
```bash
# Frontend
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

```bash
# Backend
cd backend
npm install
npm run dev
```

### Run with Docker Compose
```bash
docker compose up -d
```
Open [http://localhost:8080](http://localhost:8080)

This spins up three containers:
| Service | Port | Description |
|---------|------|-------------|
| `ops-navigation` | 8080 | Frontend (Nginx) |
| `api` | 3001 | Backend API (Node.js) |
| `mongo` | 27017 | MongoDB |

### Deploy to Kubernetes
Kubernetes manifests are available in the `k8s/` directory:
```bash
kubectl apply -f k8s/
```

---

## 📚 How to Use

### 1. Interactive Tutorial
Click **使用教學 (Tutorial)** in the sidebar for a visual guide on using the navigation hub.

### 2. Set Up Environments
Go to **系統設定 > 環境管理 (Settings > Environments)**. Add your deployment targets (e.g., `dev`, `stage`, `prod`).
- Use **Environment Groups** to cluster environments with wildcard patterns (e.g., `lab-*` matches `lab-01`, `lab-02`).

### 3. Define Columns (Categories)
Go to **系統設定 > 欄位設定 (Settings > Columns)**. Create categories like `Monitoring`, `Logs`, `CI/CD`.
- These become the columns in your navigation matrix.

### 4. Add Services
Go to **系統設定 > 服務清單 (Settings > Services)**. Register your microservices.
- **List View / Grid View**: Toggle between list and card views. Both support auto-grouping by service group with section headers and count badges.
- **Hierarchical Services**: Create child services under a parent for organized nesting (e.g., `GCP > GKE`, `GCP > GCE`).
- **Resource Links**: Add links inline from both views. Each link maps to a column and optionally to specific environments.
- **Child Links**: Links themselves support nesting — add sub-links under a parent link for detailed resource hierarchies.
- **Bilingual Names**: Each service and link supports both English and Chinese (繁體中文) display names.
- **Metadata**: Add groups, tags, descriptions, and owners.
- **Drag & Drop Reordering**: In list view (without filters), drag services to reorder them.

### 5. Applications
Go to **應用程式 (Applications)** in the sidebar. Register your applications and link them to existing services for a unified view.

### 6. Configuration via YAML
For power users, go to **系統設定 > 同步與備份 (Settings > Sync/Backup)**.
- Export your entire configuration as YAML.
- Import by pasting YAML directly.
- Use **Smart Snippets** to quickly inject common toolset definitions (Prometheus, ELK, etc.).

---

## 🎨 Design System
OpsBridge uses a custom **"Engineer High-Contrast"** theme:
- **Typography**: Optimized readability with **Pure Black** text in Light Mode and **Pure White** text in Dark Mode.
- **Accents**: Amber and Gold for high visibility and interactive elements.
- **Surface**: Slim borders with backdrop-blur effects for a premium feel.
- **Mono Font**: Technical elements use monospace fonts for data-dense readability.

---

## 📄 License
This project is licensed under the MIT License.
