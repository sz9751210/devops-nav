# OpsBridge Matrix 🛸

> **The Engineer-Ready Service Matrix for Modern DevOps Teams.**

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Success-emerald.svg)]()
[![i18n](https://img.shields.io/badge/i18n-EN%20%7C%20ZH--TW-blue.svg)]()

[English](#english) | [繁體中文](./README.zh-TW.md)

---

<a name="english"></a>
## 📖 Introduction

**OpsBridge Matrix** is a schema-driven navigation hub designed for complex microservice architectures. Instead of maintaining hundreds of static bookmarks, it provides a dynamic grid where **Services (Rows)** meet **Categories (Columns)** across multiple **Environments**.

It is built with an "Engineer-First" aesthetic, prioritizing density, keyboard shortcuts, and dark mode excellence.

### ✨ Key Features

- 🏗️ **Dynamic Matrix View**: Automatically maps service links to category columns.
- 🌍 **Contextual Environments**: One-click switching between `Dev`, `Staging`, and `Prod` with synchronized URL updates.
- 📂 **Environment Grouping**: Organize environments (e.g., `Lab`, `Internal`, `Public`) for cleaner navigation.
- 🛠️ **Full Management UI**: Add, Edit, or Remove environments, columns, and services directly from the browser.
- 🔗 **Smart Link Templates**: Use `{{service_id}}` and `{{env}}` variables to generate thousands of links with a single rule.
- 🔍 **Quick Search (Cmd+K)**: Instant access to any service or resource.
- 📝 **Scratchpad**: A built-in markdown editor for temporary notes and snippets.
- 🕸️ **Topology Graph**: Visualize service dependencies and metadata.
- 💾 **YAML Sync/Backup**: Version-control your configuration with ease.

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

## 🛠️ Operating Instructions

### 1. Set Up Environments
Go to **Settings > Environments**. Add your targets (e.g., `dev`, `stage`, `prod`). Use **Environment Groups** to cluster them (e.g., `lab-envs` pattern matches `lab-*`).

### 2. Define Columns (Categories)
Go to **Settings > Columns**. Create categories like `Monitoring`, `Logs`, `CI/CD`. These will appear as columns in your matrix.

### 3. Add Services
Go to **Settings > Services**. Register your microservices.
- **Metadata**: Add owners, descriptions, or SSH info.
- **Direct Links**: Manually add a link that only applies to specific environments.

### 4. Configuration via YAML (Optional)
For power users, go to **Settings > Sync / Backup**. You can paste a full YAML configuration or use **Smart Snippets** to quickly inject common toolsets (Prometheus, ELK, etc.).

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Cmd + K` | Open Quick Search |
| `1` | Card View Mode |
| `2` | Matrix (Table) Mode |
| `Esc` | Close any modal |

---

## 🎨 Design System
OpsBridge uses a custom **"Engineer Dark"** theme:
- **Surface**: High-contrast slate backgrounds.
- **Accents**: Amber and Gold for high visibility.
- **Typography**: Monospace hints for technical IDs.

---

## 📄 License
This project is licensed under the MIT License.
