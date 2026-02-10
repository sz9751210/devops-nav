import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "app": {
                "title": "OPS_NAV",
                "dashboard": "Dashboard",
                "tutorial": "Tutorial",
                "configuration": "Configuration",
                "environments": "Environments",
                "groups": "Groups",

                "columns": "Columns",
                "services": "Services",
                "profiles": "Profiles",
                "sync_backup": "Sync / Backup",
                "documentation": "Documentation",
                "search_placeholder": "Search services...",
                "filtered": "Filtered",
                "services_directory": "Services Directory",
                "no_services": "No services found matching",
                "no_matches_found": "ERR: NO_MATCHES_FOUND",
                "scratchpad": "SCRATCHPAD.md",
                "topology": "Dependency Graph",
                "more_links": "more links"
            },
            "stats": {
                "svc": "Svc",
                "env": "Env",
                "col": "Col"
            },
            "profiles": {
                "monitoring": "MONITORING",
                "logs": "LOGS",
                "config": "CONFIG",
                "terminal": "TERMINAL",
                "status": "STATUS",
                "database": "DATABASE",
                "cicd": "CI/CD",
                "infrastructure": "INFRA",
                "security": "SECURITY",
                "documentation": "DOCS",
                "alerts": "ALERTS"
            },
            "actions": {
                "all": "ALL",
                "services": "SERVICES",
                "navigation": "NAVIGATION",
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
                "add_resource_link": "Add Resource Link",
                "commit": "Commit",
                "update": "Update",
                "select_all": "Select All",
                "deselect_all": "Deselect All",
                "save_config": "Save Config"
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
                    "subtitle": "Define your deployment targets and their metadata.",
                    "no_environments": "NO_ENVIRONMENTS_DEFINED",
                    "placeholder": "e.g. production, staging",
                    "services_count": "SERVICES",
                    "visibility_config": "Visibility Configuration",
                    "no_services_configured": "ERR: NO_SERVICES_CONFIGURED"
                },
                "columns": {
                    "title": "Column Configuration",
                    "subtitle": "Define categories for your service links.",
                    "system_info": "SYSTEM_INFO: Columns define navigation buckets. Categorize your links (e.g., Monitoring, Logs, SSH) to keep the navigation organized.",
                    "quick_profiles": "QUICK_PROFILES",
                    "no_columns_defined": "NO_COLUMNS_DEFINED"
                },
                "services": {
                    "title": "Service Definitions",
                    "subtitle": "Manage the core services and their metadata.",
                    "search_placeholder": "Search services by name, ID or group...",
                    "no_services_defined": "STAT: NO_SERVICES_DEFINED",
                    "no_links_defined": "ST_NULL: NO_LINKS_DEFINED",
                    "select_column": "SELECT_COLUMN",
                    "links_count": "LINKS"
                },
                "view_config": {
                    "title": "View Configuration",
                    "subtitle": "Customize what you see for",
                    "services_tab": "Services",
                    "columns_tab": "Columns"
                }
            },
            "form": {
                "id": "ID",
                "label": "Label",
                "group": "Namespace / Group",
                "description": "Description",
                "url": "Source URL",
                "environments": "Scope Environments",
                "icon": "Icon (emoji)",
                "placeholders": {
                    "service_name": "Service Name",
                    "group_example": "e.g. Core, Payment",
                    "description_optional": "Optional brief",
                    "link_name_example": "Main Dashboard",
                    "url_example": "https://..."
                }
            },
            "shortcuts": {
                "title": "Keyboard Shortcuts",
                "quick_search": "Open quick search",
                "env_selector": "Open environment selector",
                "settings": "Open settings",
                "close": "Close modals",
                "footer": "OpsBridge v1.0.0 · Built with ❤️ for DevOps teams"
            },
            "tutorial": {
                "welcome_title": "Welcome to OpsBridge",
                "welcome_desc": "Your mission control for navigating complex service architectures. Here is how to get the most out of it.",
                "environments": {
                    "title": "Contextual Environments",
                    "desc": "Switch between Development, Staging, and Production instantly. All links update dynamically based on your selected context."
                },
                "columns": {
                    "title": "Service Categories",
                    "desc": "Services are organized by functional columns (e.g., Monitoring, Logs, Infra). Use Settings to customize these categories."
                },
                "services": {
                    "title": "Service Directory",
                    "desc": "A unified catalog of all your microservices. Filter by tags, owners, or groups to find what you need quickly."
                },
                "filtering": {
                    "title": "Smart Filtering",
                    "desc": "Use the search bar or tag filters to narrow down the view. Type 'payment' to see only payment-related services and links."
                },
                "pro_tips": {
                    "title": "Pro Tips",
                    "tip1": "Click the environment selector in the top bar to switch contexts.",
                    "tip2": "Use the import/export feature to back up your configuration.",
                    "tip3": "Group your environments (e.g., lab-*) in Settings for better organization."
                }
            }
        }
    },
    "zh-TW": {
        translation: {
            "app": {
                "title": "運維導航",
                "dashboard": "控制面板",
                "tutorial": "使用教學",
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
                "no_matches_found": "錯誤: 找不到符合項目",
                "scratchpad": "隨手筆記.md",
                "topology": "依賴拓撲圖",
                "more_links": "個連結"
            },
            "stats": {
                "svc": "服務",
                "env": "環境",
                "col": "欄位"
            },
            "profiles": {
                "monitoring": "監控",
                "logs": "日誌",
                "config": "設定",
                "terminal": "終端機",
                "status": "狀態",
                "database": "資料庫",
                "cicd": "CI/CD 流水線",
                "infrastructure": "基礎設施",
                "security": "資安掃描",
                "documentation": "文件與 Wiki",
                "alerts": "告警通知"
            },
            "actions": {
                "all": "全部",
                "services": "服務列表",
                "navigation": "導航檢視",
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
                "add_resource_link": "新增資源連結",
                "commit": "確認提交",
                "update": "更新設定",
                "select_all": "全選",
                "deselect_all": "全不選",
                "save_config": "儲存配置"
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
                    "subtitle": "定義您的部署目標及其相關元數據。",
                    "no_environments": "未定義任何環境",
                    "placeholder": "例如: production, staging",
                    "services_count": "服務數量",
                    "visibility_config": "能見度設定",
                    "no_services_configured": "錯誤: 未配置任何服務"
                },
                "columns": {
                    "title": "欄位分類設定",
                    "subtitle": "定義服務連結的分類目錄。",
                    "system_info": "系統提示: 欄位定義導航分類。將連結歸類（如：監控、日誌、SSH）以保持導航整潔。",
                    "quick_profiles": "快速設定檔",
                    "no_columns_defined": "未定義任何欄位"
                },
                "services": {
                    "title": "服務清單管理",
                    "subtitle": "管理核心服務清單及其屬性。",
                    "search_placeholder": "透過名稱、ID 或群組搜尋服務...",
                    "no_services_defined": "狀態: 未定義任何服務",
                    "no_links_defined": "狀態: 未定義連結",
                    "select_column": "選擇欄位",
                    "links_count": "連結數量"
                },
                "view_config": {
                    "title": "視圖配置",
                    "subtitle": "自定義顯示內容：",
                    "services_tab": "服務項目",
                    "columns_tab": "顯示欄位"
                }
            },
            "form": {
                "id": "識別碼 ID",
                "label": "顯示名稱",
                "group": "命名空間 / 群組",
                "description": "描述說明",
                "url": "來源連結 URL",
                "environments": "適用環境範圍",
                "icon": "圖標 (Emoji 表情)",
                "placeholders": {
                    "service_name": "服務名稱",
                    "group_example": "例如: Core, Payment",
                    "description_optional": "選填: 簡短說明",
                    "link_name_example": "例如: 主儀表板",
                    "url_example": "https://..."
                }
            },
            "shortcuts": {
                "title": "鍵盤快速鍵",
                "quick_search": "開啟快速搜尋",
                "env_selector": "切換環境選單",
                "settings": "進入系統設定",
                "close": "關閉彈窗",
                "footer": "運維導航 v1.0.0 · 為 DevOps 團隊量身打造 ❤️"
            },
            "tutorial": {
                "welcome_title": "歡迎使用運維導航",
                "welcome_desc": "您的微服務架構導航中心。以下是使用本系統的最佳實踐指南。",
                "environments": {
                    "title": "環境上下文切換",
                    "desc": "在開發 (Dev)、測試 (Staging) 與生產 (Prod) 環境間快速切換。所有服務連結將根據當前環境自動更新。"
                },
                "columns": {
                    "title": "服務分類目錄",
                    "desc": "服務連結依據功能欄位（如：監控、日誌、基礎設施）進行分類。您可以隨時在設定中自定義這些欄位。"
                },
                "services": {
                    "title": "服務資源目錄",
                    "desc": "所有微服務的統一目錄。透過標籤、負責人或群組篩選，快速找到您需要的資源。"
                },
                "filtering": {
                    "title": "智慧篩選",
                    "desc": "使用搜尋列或標籤過濾器來縮小範圍。例如輸入 'payment' 即可查看相關支付服務的所有連結。"
                },
                "pro_tips": {
                    "title": "使用技巧",
                    "tip1": "點擊頂部欄的環境選擇器可快速切換操作環境。",
                    "tip2": "使用匯入/匯出功能備份您的 YAML 配置。",
                    "tip3": "在設定中將環境進行分組（如 lab-*）以獲得更整潔的選單。"
                }
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
