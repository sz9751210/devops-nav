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

It is built with an "Engineer-First" aesthetic, prioritizing density and dark mode excellence.

### ✨ Key Features

- 🏗️ **Dynamic Navigation View**: Automatically maps service links to category columns.
- 🌍 **Contextual Environments**: One-click switching between `Dev`, `Staging`, and `Prod` with synchronized URL updates.
- � **Service Health UI**: Integrated status indicators (Healthy, Warning, Error) with pulsing alerts.
- 🏷️ **Tag Filter System**: Instantly filter your entire dashboard by functional tags (e.g., `#frontend`, `#critical`).
- 🚧 **Maintenance Mode**: Mark services as under maintenance with dedicated UI flags.
- � **Recent Links History**: Automatically tracks your most visited links for one-click access in the sidebar.
- ⚡ **Bulk Actions**: Open all environment links at once or copy them formatted to your clipboard.
- 👤 **Ownership Integration**: Link services to owners and Slack channels for faster team communication.
- 🔍 **Quick Search**: Instant access to any service or resource.
- 📝 **Scratchpad**: A built-in markdown editor for temporary notes and snippets.
-  **Announcement System**: Top-level banner for system-wide site maintenance or incident alerts.
- 💾 **YAML Sync/Backup**: Version-control your configuration with ease.
- 📚 **Interactive Tutorial**: Built-in guide to help new engineers get up to speed quickly.

---

## 🚀 Quick Start

### Run Locally
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

### Run with Docker
```bash
docker-compose up -d
```
Open [http://localhost:8080](http://localhost:8080)

---

## 📚 How to Use

### 1. Interactive Tutorial
Click the **Tutorial** tab in the sidebar for a visual guide on using the navigation hub.

### 2. Set Up Environments
Go to **Settings > Environments**. Add your targets (e.g., `dev`, `stage`, `prod`). Use **Environment Groups** to cluster them (e.g., `lab-envs` pattern matches `lab-*`).

### 3. Define Columns (Categories)
Go to **Settings > Columns**. Create categories like `Monitoring`, `Logs`, `CI/CD`. These will appear as columns in your navigation.

### 4. Add Services
Go to **Settings > Services**. Register your microservices.
- **Metadata**: Add owners, descriptions, or SSH info.
- **Direct Links**: Manually add a link that only applies to specific environments.

### 5. Configuration via YAML (Optional)
For power users, go to **Settings > Sync / Backup**. You can paste a full YAML configuration or use **Smart Snippets** to quickly inject common toolsets (Prometheus, ELK, etc.).

---

## 🎨 Design System
OpsBridge uses a custom **"Engineer High-Contrast"** theme:
- **Typography**: Optimized readability with **Pure Black** text in Light Mode and **Pure White** text in Dark Mode.
- **Accents**: Amber and Gold for high visibility.
- **Surface**: Slim borders and backdrop-blur effects for a premium feel.

---

## 📄 License
This project is licensed under the MIT License.
