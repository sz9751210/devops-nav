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
                "applications": "Applications",
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
                "all_groups": "All Groups",
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
                "create_application": "Create Application",
                "edit_application": "Edit Application",
                "add_resource_link": "Add Resource Link",
                "commit": "Commit",
                "update": "Update",
                "select_all": "Select All",
                "deselect_all": "Deselect All",
                "save_config": "Save Config",
                "move_up": "Move Up",
                "move_down": "Move Down",
                "view_card": "Card View",
                "view_list": "List View"
            },
            "service_page": {
                "subtitle": "Manage and view all service definitions and detailed dependencies",
                "count_badge": "SERVICES",
                "maintenance": "MAINTENANCE",
                "maintenance_mode": "MAINTENANCE MODE",
                "detail_view": "Service Detail",
                "common_resources": "Common Resources",
                "environment": "Environment",
                "resource_fallback": "Resource",
                "no_resources": "No infrastructure resources defined for this service.",
                "no_results": "No services found matching your criteria."
            },
            "applications": {
                "subtitle": "Manage your business applications and their infrastructure dependencies",
                "search_placeholder": "Search applications...",
                "no_results": "No applications found. Create one to get started.",
                "group": "Group",
                "ungrouped": "Ungrouped"
            },
            "app_detail": {
                "owned_by": "Owned by",
                "services": "Services",
                "tags": "Tags",
                "infrastructure_dependencies": "Infrastructure Dependencies",
                "no_links": "No links defined",
                "no_services": "No services linked to this application."
            },
            "settings": {
                "env_groups": {
                    "title": "Environment Groups",
                    "subtitle": "Organize environments into groups for easier navigation.",
                    "id_placeholder": "Group ID (e.g., lab)",
                    "name_placeholder": "Display Name (e.g., Lab Environments)",
                    "pattern_placeholder": "Pattern (e.g., lab-*) - optional",
                    "no_groups": "No environment groups defined. Environments will be auto-grouped by prefix.",
                    "tips": "Use patterns like 'lab-*' to automatically group environments. Groups appear in the dropdown.",
                    "assigned_envs": "Assigned Environments",
                    "auto_matched": "Matched by Pattern"
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
                "label_zh": "Label (Chinese)",
                "tags": "Tags",
                "metadata": "Metadata",
                "group": "Namespace / Group",
                "description": "Description",
                "url": "Source URL",
                "environments": "Scope Environments",
                "icon": "Icon (emoji)",
                "column_id_en": {
                    "label": "Column ID (English)",
                    "placeholder": "e.g. monitoring"
                },
                "placeholders": {
                    "service_name": "Service Name",
                    "group_example": "e.g. Core, Payment",
                    "description_optional": "Optional brief",
                    "link_name_example": "Main Dashboard",
                    "url_example": "https://...",
                    "owner_placeholder": "Team or Individual",
                    "environments_placeholder": "Select environments...",
                    "app_name_example": "e.g. Payment Gateway",
                    "tags_example": "comma, separated, tags",
                    "description_app": "Brief description of this application..."
                },
                "show_selected_only": "Show Selected",
                "owner": "Owner",
                "associated_services": "Associated Services",
                "search_services_to_link": "Search services to link...",
                "no_services_found": "No services found matching"
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
                "welcome_desc": "Your mission control for navigating complex service architectures. Follow the steps below to get started, then explore advanced features.",
                "quick_start_title": "Quick Start — 4 Steps to Get Running",
                "features_title": "Core Features",
                "shortcuts_title": "Keyboard Shortcuts",
                "steps": {
                    "env": {
                        "title": "Create Environments",
                        "desc": "Add your deployment targets like dev, staging, prod. Use Environment Groups to cluster them with wildcard patterns (e.g., lab-*).",
                        "path": "Settings → Environments"
                    },
                    "columns": {
                        "title": "Define Columns",
                        "desc": "Create resource categories such as Monitoring, Logs, CI/CD. These become columns in your navigation matrix.",
                        "path": "Settings → Columns"
                    },
                    "services": {
                        "title": "Register Services",
                        "desc": "Add your microservices. Assign groups, tags, and descriptions. Create parent-child hierarchies for organized nesting.",
                        "path": "Settings → Services"
                    },
                    "links": {
                        "title": "Add Resource Links",
                        "desc": "Expand a service card and add links. Each link maps to a column and optionally to specific environments. Links support nesting too.",
                        "path": "Services → Edit Links"
                    }
                },
                "features": {
                    "views": {
                        "title": "List & Grid Views",
                        "desc": "Toggle between list and card views. Both auto-group services by their group with section headers and count badges."
                    },
                    "hierarchy": {
                        "title": "Hierarchical Services",
                        "desc": "Create parent-child service relationships. Child services are displayed nested under their parent in the navigation matrix."
                    },
                    "filtering": {
                        "title": "Smart Filtering",
                        "desc": "Use the search bar, tag filters, or group dropdown to narrow down your view instantly."
                    },
                    "bilingual": {
                        "title": "Bilingual Support",
                        "desc": "Service and link names support both English and Chinese. The UI automatically displays the correct language based on your setting."
                    },
                    "inline_edit": {
                        "title": "Inline Link Editor",
                        "desc": "Edit resource links directly from both list and grid views — no page navigation required. Click 'Edit Links' to expand."
                    },
                    "yaml": {
                        "title": "YAML Sync & Backup",
                        "desc": "Export your entire configuration as YAML for version control. Import by pasting YAML or use Smart Snippets for common toolsets."
                    }
                },
                "shortcuts": {
                    "search": "Open Quick Search",
                    "env": "Toggle Environment Selector",
                    "settings": "Open Settings",
                    "close": "Close Modals / Panels"
                },
                "pro_tips": {
                    "title": "Pro Tips",
                    "tip1": "Use the environment selector in the top bar to switch contexts — all links update dynamically.",
                    "tip2": "Drag and drop services in the list view to reorder them (works when no filters are active).",
                    "tip3": "Group your environments with wildcard patterns (e.g., lab-*) for a cleaner dropdown.",
                    "tip4": "Use the import/export feature to back up your configuration as YAML — perfect for GitOps.",
                    "tip5": "Click a service row in the navigation matrix to open its detail page with all metadata and links."
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
                "applications": "應用程式",
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
                "all_groups": "所有群組",
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
                "create_application": "建立應用程式",
                "edit_application": "編輯應用程式",
                "add_resource_link": "新增資源連結",
                "commit": "確認提交",
                "update": "更新設定",
                "select_all": "全選",
                "deselect_all": "全不選",
                "save_config": "儲存配置",
                "move_up": "上移",
                "move_down": "下移",
                "view_card": "卡片視圖",
                "view_list": "列表視圖"
            },
            "service_page": {
                "subtitle": "管理並檢視所有服務定義及其詳細依賴關係",
                "count_badge": "服務數量",
                "maintenance": "維護中",
                "maintenance_mode": "維護模式",
                "detail_view": "服務詳情",
                "common_resources": "共用資源",
                "environment": "環境",
                "resource_fallback": "資源",
                "no_resources": "此服務未定義任何基礎設施資源。",
                "no_results": "找不到符合條件的服務。"
            },
            "applications": {
                "subtitle": "管理您的業務應用程式及其基礎設施依賴",
                "search_placeholder": "搜尋應用程式...",
                "no_results": "找不到應用程式。請建立一個新的應用程式。",
                "group": "應用程式群組",
                "ungrouped": "未分類"
            },
            "app_detail": {
                "owned_by": "負責人",
                "services": "服務數量",
                "tags": "標籤",
                "infrastructure_dependencies": "基礎設施依賴",
                "no_links": "未定義連結",
                "no_services": "此應用程式未關聯任何服務。"
            },
            "settings": {
                "env_groups": {
                    "title": "環境群組設定",
                    "subtitle": "將環境進行歸類以便於導航。支援萬用字元（如 lab-*）自動分組。",
                    "id_placeholder": "群組 ID (例如: lab)",
                    "name_placeholder": "顯示名稱 (例如: 實驗室環境)",
                    "pattern_placeholder": "識別規則 (例如: lab-*) - 選填",
                    "no_groups": "目前無手動定義的群組。系統將依據字首自動分組。",
                    "tips": "使用 'lab-*' 等規則可自動將符合的環境歸類。群組會顯示在環境切換下拉選單中。",
                    "assigned_envs": "指定環境",
                    "auto_matched": "自動匹配"
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
                "label_zh": "顯示名稱 (中文)",
                "tags": "標籤",
                "metadata": "元數據",
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
                    "url_example": "https://...",
                    "owner_placeholder": "團隊或個人名稱",
                    "environments_placeholder": "選擇環境...",
                    "app_name_example": "例如: Payment Gateway",
                    "tags_example": "標籤 (以逗號分隔)",
                    "description_app": "請輸入應用程式的簡短描述..."
                },
                "show_selected_only": "只顯示已選項目",
                "owner": "負責人 (Owner)",
                "associated_services": "關聯服務",
                "search_services_to_link": "搜尋欲關聯的服務...",
                "no_services_found": "找不到符合的服務:"
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
                "welcome_desc": "您的微服務架構導航中心。按照以下步驟快速上手，接著探索進階功能。",
                "quick_start_title": "快速開始 — 四步完成設定",
                "features_title": "核心功能",
                "shortcuts_title": "鍵盤快速鍵",
                "steps": {
                    "env": {
                        "title": "建立環境",
                        "desc": "新增部署目標如 dev、staging、prod。使用環境群組功能，透過萬用字元（如 lab-*）自動歸類。",
                        "path": "系統設定 → 環境管理"
                    },
                    "columns": {
                        "title": "定義欄位",
                        "desc": "建立資源分類如監控面板、日誌系統、CI/CD。這些將成為導航矩陣的直欄。",
                        "path": "系統設定 → 欄位設定"
                    },
                    "services": {
                        "title": "註冊服務",
                        "desc": "新增您的微服務，設定群組、標籤與描述。可建立父子階層關係實現巢狀管理。",
                        "path": "系統設定 → 服務清單"
                    },
                    "links": {
                        "title": "新增資源連結",
                        "desc": "展開服務卡片後新增連結。每個連結對應一個欄位，可選擇綁定特定環境。連結也支援父子巢狀。",
                        "path": "服務清單 → 編輯連結"
                    }
                },
                "features": {
                    "views": {
                        "title": "列表與卡片視圖",
                        "desc": "切換列表與卡片兩種視圖。兩者皆支援依群組自動分類，顯示區段標題與計數徽章。"
                    },
                    "hierarchy": {
                        "title": "階層式服務架構",
                        "desc": "支援父子服務關聯，子服務在導航矩陣中巢狀顯示於父服務下方。"
                    },
                    "filtering": {
                        "title": "智慧篩選",
                        "desc": "使用搜尋列、標籤過濾器或群組下拉選單，瞬間縮小檢視範圍。"
                    },
                    "bilingual": {
                        "title": "雙語支援",
                        "desc": "服務與連結名稱支援英文/中文雙語顯示，系統依語言設定自動切換。"
                    },
                    "inline_edit": {
                        "title": "原地編輯連結",
                        "desc": "在列表與卡片視圖中直接編輯連結，無需跳轉頁面。點擊「編輯連結」即可展開。"
                    },
                    "yaml": {
                        "title": "YAML 同步與備份",
                        "desc": "匯出完整配置為 YAML 以便版本控制。支援直接貼上匯入，或使用快速代碼片段。"
                    }
                },
                "shortcuts": {
                    "search": "開啟快速搜尋",
                    "env": "切換環境選單",
                    "settings": "進入系統設定",
                    "close": "關閉彈窗 / 面板"
                },
                "pro_tips": {
                    "title": "使用技巧",
                    "tip1": "使用頂部環境選擇器切換操作環境 — 所有連結會自動更新。",
                    "tip2": "在列表視圖中拖拽服務可改變排列順序（無篩選條件時可用）。",
                    "tip3": "用萬用字元將環境分組（如 lab-*），讓下拉選單更整潔。",
                    "tip4": "使用匯入/匯出功能將配置備份為 YAML — 完美適配 GitOps 工作流。",
                    "tip5": "在導航矩陣中點擊服務列，可開啟詳細頁面查看完整元數據與連結。"
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
