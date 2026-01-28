import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "app": {
                "title": "OPS_MATRIX",
                "dashboard": "Dashboard",
                "configuration": "Configuration",
                "environments": "Environments",
                "groups": "Groups",
                "columns": "Columns",
                "services": "Services",
                "sync_backup": "Sync / Backup",
                "documentation": "Documentation",
                "search_placeholder": "Search services...",
                "filtered": "Filtered",
                "services_directory": "Services Directory",
                "no_services": "No services found matching",
                "scratchpad": "SCRATCHPAD.md",
                "topology": "Dependency Graph",
                "more_links": "more links"
            },
            "stats": {
                "svc": "Svc",
                "env": "Env",
                "col": "Col"
            },
            "actions": {
                "all": "ALL",
                "services": "SERVICES",
                "matrix": "MATRIX",
                "copy_url": "Copy URL",
                "view_topology": "View Topology",
                "quick_notes": "Quick Notes",
                "add_new": "Add New",
                "save": "Save Changes",
                "cancel": "Cancel",
                "delete": "Delete",
                "apply": "Apply",
                "download": "Download",
                "upload": "Upload",
                "load_current": "Load Current",
                "edit": "Edit",
                "create": "Create",
                "commit": "Commit",
                "update": "Update"
            },
            "settings": {
                "env_groups": {
                    "title": "Environment Groups",
                    "subtitle": "Organize environments into groups for easier navigation.",
                    "id_placeholder": "Group ID (e.g., lab)",
                    "name_placeholder": "Display Name (e.g., Lab Environments)",
                    "pattern_placeholder": "Pattern (e.g., lab-*) - optional",
                    "no_groups": "No environment groups defined. Environments will be auto-grouped by prefix.",
                    "tips": "Use patterns like 'lab-*' to automatically group environments. Groups appear in the dropdown."
                },
                "import_export": {
                    "title": "Import / Export Configuration",
                    "subtitle": "Manage your YAML configuration for version control or migrations.",
                    "editor_placeholder": "# Paste or load your YAML configuration here...",
                    "smart_snippets": "Quick Snippets (Smart Import)",
                    "auto_saved": "Auto-saved to local state",
                    "snippets": {
                        "monitoring_title": "Add Monitoring Stack",
                        "monitoring_desc": "Adds Prometheus & Grafana services",
                        "logging_title": "Add EFK Stack",
                        "logging_desc": "Adds Elasticsearch & Kibana",
                        "standard_title": "Apply Standard Config",
                        "standard_desc": "Sets theme and standard announcements"
                    }
                },
                "envs": {
                    "title": "Environment Management",
                    "subtitle": "Define your deployment targets and their metadata."
                },
                "columns": {
                    "title": "Column Configuration",
                    "subtitle": "Define categories for your service links."
                },
                "services": {
                    "title": "Service Definitions",
                    "subtitle": "Manage the core services and their metadata.",
                    "search_placeholder": "Search services by name, ID or group..."
                }
            },
            "form": {
                "id": "ID",
                "label": "Label",
                "group": "Namespace / Group",
                "description": "Description",
                "url": "Source URL",
                "environments": "Scope Environments",
                "icon": "Icon (emoji)"
            },
            "shortcuts": {
                "title": "Keyboard Shortcuts",
                "quick_search": "Open quick search",
                "env_selector": "Open environment selector",
                "settings": "Open settings",
                "close": "Close modals",
                "footer": "OpsBridge v1.0.0 · Built with ❤️ for DevOps teams"
            }
        }
    },
    "zh-TW": {
        translation: {
            "app": {
                "title": "運維矩陣",
                "dashboard": "控制面板",
                "configuration": "系統設定",
                "environments": "環境管理",
                "groups": "群組分類",
                "columns": "欄位設定",
                "services": "服務清單",
                "sync_backup": "同步與備份",
                "documentation": "技術文件",
                "search_placeholder": "搜尋服務...",
                "filtered": "已過濾",
                "services_directory": "服務目錄",
                "no_services": "找不到匹配的服務",
                "scratchpad": "隨手筆記.md",
                "topology": "依賴拓撲圖",
                "more_links": "個連結"
            },
            "stats": {
                "svc": "服務",
                "env": "環境",
                "col": "欄位"
            },
            "actions": {
                "all": "全部",
                "services": "服務列表",
                "matrix": "矩陣檢視",
                "copy_url": "複製連結",
                "view_topology": "檢視拓撲",
                "quick_notes": "隨手筆記",
                "add_new": "新增",
                "save": "儲存變更",
                "cancel": "取消",
                "delete": "刪除",
                "apply": "套用設定",
                "download": "下載 YAML",
                "upload": "上傳檔案",
                "load_current": "載入目前配置",
                "edit": "編輯",
                "create": "建立",
                "commit": "確認提交",
                "update": "更新設定"
            },
            "settings": {
                "env_groups": {
                    "title": "環境群組設定",
                    "subtitle": "將環境進行歸類以便於導航。支援萬用字元（如 lab-*）自動分組。",
                    "id_placeholder": "群組 ID (例如: lab)",
                    "name_placeholder": "顯示名稱 (例如: 實驗室環境)",
                    "pattern_placeholder": "識別規則 (例如: lab-*) - 選填",
                    "no_groups": "目前無手動定義的群組。系統將依據字首自動分組。",
                    "tips": "使用 'lab-*' 等規則可自動將符合的環境歸類。群組會顯示在環境切換下拉選單中。"
                },
                "import_export": {
                    "title": "同步與備份設定",
                    "subtitle": "匯出您的 YAML 配置進行版本控制，或從外部檔案匯入。",
                    "editor_placeholder": "# 在此處貼上或載入您的 YAML 配置...",
                    "smart_snippets": "快速代碼片段 (智慧匯入)",
                    "auto_saved": "已自動儲存至本地瀏覽器",
                    "snippets": {
                        "monitoring_title": "新增監控組件 (Monitoring Stack)",
                        "monitoring_desc": "快速加入 Prometheus 與 Grafana 服務定義",
                        "logging_title": "新增日誌組件 (EFK Stack)",
                        "logging_desc": "快速加入 Elasticsearch 與 Kibana 服務定義",
                        "standard_title": "套用標準系統配置",
                        "standard_desc": "設定預設佈景主題與維護公告內容"
                    }
                },
                "envs": {
                    "title": "環境管理",
                    "subtitle": "定義您的部署目標及其相關元數據。"
                },
                "columns": {
                    "title": "欄位分類設定",
                    "subtitle": "定義服務連結的分類目錄。"
                },
                "services": {
                    "title": "服務清單管理",
                    "subtitle": "管理核心服務清單及其屬性。",
                    "search_placeholder": "透過名稱、ID 或群組搜尋服務..."
                }
            },
            "form": {
                "id": "識別碼 ID",
                "label": "顯示名稱",
                "group": "命名空間 / 群組",
                "description": "描述說明",
                "url": "來源連結 URL",
                "environments": "適用環境範圍",
                "icon": "圖標 (Emoji 表情)"
            },
            "shortcuts": {
                "title": "鍵盤快速鍵",
                "quick_search": "開啟快速搜尋",
                "env_selector": "切換環境選單",
                "settings": "進入系統設定",
                "close": "關閉彈窗",
                "footer": "運維矩陣 v1.0.0 · 為 DevOps 團隊量身打造 ❤️"
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
