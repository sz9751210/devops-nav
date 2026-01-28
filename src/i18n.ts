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
                "quick_notes": "Quick Notes"
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
                "quick_notes": "隨手筆記"
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
