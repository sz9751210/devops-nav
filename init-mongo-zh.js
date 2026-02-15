db = db.getSiblingDB('opsbridge');

// Create the collection
db.createCollection('navigation');

// Helper to generate links (ZH)
function createLink(id, columnId, name, url, icon) {
    return {
        "id": id,
        "columnId": columnId,
        "name": name, // Directly use Chinese name for main display in ZH mode
        "url": url,
        "icon": icon
    };
}

// Insert comprehensive configuration (Chinese)
db.navigation.insertOne({
    "_id": "default",
    "title": "運維導航 (OpsBridge)",
    "environments": ["dev", "qa", "staging", "prod", "dr"],
    "columns": [
        {
            "id": "url",
            "title": "服務連結",
            "type": "link",
            "icon": "link"
        },
        {
            "id": "health",
            "title": "健康檢查",
            "type": "status",
            "icon": "activity"
        },
        {
            "id": "logs",
            "title": "日誌 (Kibana)",
            "type": "link",
            "icon": "file-text"
        },
        {
            "id": "metrics",
            "title": "監控 (Grafana)",
            "type": "link",
            "icon": "bar-chart"
        },
        {
            "id": "repo",
            "title": "代碼倉庫",
            "type": "link",
            "icon": "github"
        }
    ],
    "envGroups": [
        {
            "id": "group-prod",
            "name": "生產環境",
            "pattern": "^(prod|dr)$",
            "color": "red",
            "icon": "shield",
            "environments": ["prod", "dr"]
        },
        {
            "id": "group-staging",
            "name": "預發布環境",
            "pattern": "^staging$",
            "color": "orange",
            "icon": "layers",
            "environments": ["staging"]
        },
        {
            "id": "group-dev",
            "name": "開發測試",
            "pattern": "^(dev|qa)$",
            "color": "green",
            "icon": "code",
            "environments": ["dev", "qa"]
        }
    ],
    "services": [
        {
            "id": "frontend-service",
            "name": "前端入口服務",
            "group": "核心平台",
            "description": "平台主要使用者介面",
            "tags": ["frontend", "react", "public"],
            "links": [
                createLink("fe-url", "url", "主入口", "https://portal.example.com", "link"),
                createLink("fe-health", "health", "健康檢查", "https://portal.example.com/health", "activity"),
                createLink("fe-logs", "logs", "Kibana 日誌", "https://kibana.example.com/app/discover#query=frontend", "file-text"),
                createLink("fe-repo", "repo", "Github 倉庫", "https://github.com/org/frontend", "github")
            ],
            "metadata": {
                "owner": "Team UI",
                "tier": "1",
                "language": "TypeScript"
            },
            "variables": {
                "service": "frontend-app"
            }
        },
        {
            "id": "auth-service",
            "name": "身份驗證服務",
            "group": "核心平台",
            "description": "身份識別與存取管理",
            "tags": ["backend", "go", "security", "critical"],
            "links": [
                createLink("auth-url", "url", "API 入口", "https://auth.example.com", "lock"),
                createLink("auth-docs", "url", "API 文件 (Swagger)", "https://auth.example.com/swagger", "book"),
                createLink("auth-health", "health", "健康檢查", "https://auth.example.com/health", "activity"),
                createLink("auth-metrics", "metrics", "監控儀表板", "https://grafana.example.com/d/auth-service", "bar-chart")
            ],
            "metadata": {
                "owner": "Team Security",
                "tier": "0",
                "language": "Go"
            },
            "variables": {
                "service": "auth-api"
            }
        },
        {
            "id": "payment-service",
            "name": "支付網關",
            "group": "金融科技",
            "description": "Stripe/PayPal 金流處理",
            "tags": ["backend", "java", "pci"],
            "links": [
                createLink("pay-logs", "logs", "交易日誌", "https://kibana.example.com/app/discover#query=payment", "file-text"),
                createLink("pay-metrics", "metrics", "業務監控", "https://grafana.example.com/d/payment-business", "bar-chart")
            ],
            "metadata": {
                "owner": "Team Payment",
                "tier": "1",
                "language": "Java"
            },
            "variables": {
                "service": "payment-api"
            }
        },
        {
            "id": "notification-service",
            "name": "通知服務",
            "group": "支援服務",
            "description": "Email, SMS 與推播通知",
            "tags": ["backend", "python", "async"],
            "links": [
                createLink("notif-metrics", "metrics", "佇列深度", "https://grafana.example.com/d/notification-queue", "bar-chart")
            ],
            "metadata": {
                "owner": "Team Platform",
                "tier": "2",
                "language": "Python"
            },
            "variables": {
                "service": "notification-worker"
            }
        },
        {
            "id": "db-primary",
            "name": "主資料庫",
            "group": "基礎設施",
            "description": "PostgreSQL 主叢集",
            "tags": ["database", "postgres", "stateful"],
            "links": [
                createLink("db-admin", "url", "管理介面 (pgAdmin)", "https://pgadmin.example.com", "database"),
                createLink("db-metrics", "metrics", "效能監控", "https://grafana.example.com/d/postgres-overview", "bar-chart")
            ],
            "metadata": {
                "version": "15.4",
                "size": "large"
            }
        },
        {
            "id": "cache-redis",
            "name": "Redis 快取",
            "group": "基礎設施",
            "description": "全域快取層",
            "tags": ["cache", "redis"],
            "links": [
                createLink("redis-metrics", "metrics", "總覽儀表板", "https://grafana.example.com/d/redis", "bar-chart")
            ],
            "metadata": {
                "version": "7.0"
            }
        }
    ],
    "applications": [
        {
            "id": "e-commerce-app",
            "name": "電商套件",
            "description": "面向客戶的主應用程式包",
            "owner": "Product Team A",
            "tags": ["revenue-generating"],
            "serviceIds": ["frontend-service", "auth-service", "payment-service"]
        },
        {
            "id": "internal-tools",
            "name": "內部工具",
            "description": "後台管理工具",
            "owner": "Internal IT",
            "tags": ["internal"],
            "serviceIds": ["auth-service", "notification-service"]
        }
    ],
    "favoriteEnvs": ["prod", "dev"],
    "favoriteServices": ["frontend-service", "auth-service"],
    "announcement": {
        "message": "本週末 (週六 22:00 UTC) 進行系統維護，預計會有短暫服務中斷。",
        "level": "warning",
        "active": true
    },
    "theme": {
        "primaryColor": "blue"
    },
    "updatedAt": new Date()
});

print("Initialized opsbridge database with Chinese configuration.");
