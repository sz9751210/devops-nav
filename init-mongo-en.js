db = db.getSiblingDB('opsbridge');

// Create the collection
db.createCollection('navigation');

// Helper to generate links (EN)
function createLink(id, columnId, name, url, icon) {
    return {
        "id": id,
        "columnId": columnId,
        "name": name,
        "url": url,
        "icon": icon
    };
}

// Insert comprehensive configuration (English)
db.navigation.insertOne({
    "_id": "default",
    "title": "OpsBridge Navigation",
    "environments": ["dev", "qa", "staging", "prod", "dr"],
    "columns": [
        {
            "id": "url",
            "title": "Service URL",
            "type": "link",
            "icon": "link"
        },
        {
            "id": "health",
            "title": "Health Check",
            "type": "status",
            "icon": "activity"
        },
        {
            "id": "logs",
            "title": "Logs (Kibana)",
            "type": "link",
            "icon": "file-text"
        },
        {
            "id": "metrics",
            "title": "Metrics (Grafana)",
            "type": "link",
            "icon": "bar-chart"
        },
        {
            "id": "repo",
            "title": "Git Repo",
            "type": "link",
            "icon": "github"
        }
    ],
    "envGroups": [
        {
            "id": "group-prod",
            "name": "Production",
            "pattern": "^(prod|dr)$",
            "color": "red",
            "icon": "shield",
            "environments": ["prod", "dr"]
        },
        {
            "id": "group-staging",
            "name": "Staging",
            "pattern": "^staging$",
            "color": "orange",
            "icon": "layers",
            "environments": ["staging"]
        },
        {
            "id": "group-dev",
            "name": "Development",
            "pattern": "^(dev|qa)$",
            "color": "green",
            "icon": "code",
            "environments": ["dev", "qa"]
        }
    ],
    "services": [
        {
            "id": "frontend-service",
            "name": "Frontend Portal",
            "group": "Core Platform",
            "description": "Main user interface for the platform",
            "tags": ["frontend", "react", "public"],
            "links": [
                createLink("fe-url", "url", "Main Entry", "https://portal.example.com", "link"),
                createLink("fe-health", "health", "Healthz", "https://portal.example.com/health", "activity"),
                createLink("fe-logs", "logs", "Kibana Logs", "https://kibana.example.com/app/discover#query=frontend", "file-text"),
                createLink("fe-repo", "repo", "Github", "https://github.com/org/frontend", "github")
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
            "name": "Authentication Service",
            "group": "Core Platform",
            "description": "Identity and Access Management",
            "tags": ["backend", "go", "security", "critical"],
            "links": [
                createLink("auth-url", "url", "Auth API", "https://auth.example.com", "lock"),
                createLink("auth-docs", "url", "Swagger Docs", "https://auth.example.com/swagger", "book"),
                createLink("auth-health", "health", "Healthz", "https://auth.example.com/health", "activity"),
                createLink("auth-metrics", "metrics", "Grafana Dashboard", "https://grafana.example.com/d/auth-service", "bar-chart")
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
            "name": "Payment Gateway",
            "group": "FinTech",
            "description": "Payment processing via Stripe/PayPal",
            "tags": ["backend", "java", "pci"],
            "links": [
                createLink("pay-logs", "logs", "Transaction Logs", "https://kibana.example.com/app/discover#query=payment", "file-text"),
                createLink("pay-metrics", "metrics", "Business Metrics", "https://grafana.example.com/d/payment-business", "bar-chart")
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
            "name": "Notification Service",
            "group": "Support",
            "description": "Email, SMS, and Push notifications",
            "tags": ["backend", "python", "async"],
            "links": [
                createLink("notif-metrics", "metrics", "Queue Depth", "https://grafana.example.com/d/notification-queue", "bar-chart")
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
            "name": "Primary Database",
            "group": "Infrastructure",
            "description": "PostgreSQL Primary Cluster",
            "tags": ["database", "postgres", "stateful"],
            "links": [
                createLink("db-admin", "url", "pgAdmin", "https://pgadmin.example.com", "database"),
                createLink("db-metrics", "metrics", "Postgres Exporter", "https://grafana.example.com/d/postgres-overview", "bar-chart")
            ],
            "metadata": {
                "version": "15.4",
                "size": "large"
            }
        },
        {
            "id": "cache-redis",
            "name": "Redis Cache",
            "group": "Infrastructure",
            "description": "Global caching layer",
            "tags": ["cache", "redis"],
            "links": [
                createLink("redis-metrics", "metrics", "Redis Overview", "https://grafana.example.com/d/redis", "bar-chart")
            ],
            "metadata": {
                "version": "7.0"
            }
        }
    ],
    "applications": [
        {
            "id": "e-commerce-app",
            "name": "E-Commerce Suite",
            "description": "Main customer facing application bundle",
            "owner": "Product Team A",
            "tags": ["revenue-generating"],
            "serviceIds": ["frontend-service", "auth-service", "payment-service"]
        },
        {
            "id": "internal-tools",
            "name": "Internal Tools",
            "description": "Back office administration tools",
            "owner": "Internal IT",
            "tags": ["internal"],
            "serviceIds": ["auth-service", "notification-service"]
        }
    ],
    "favoriteEnvs": ["prod", "dev"],
    "favoriteServices": ["frontend-service", "auth-service"],
    "announcement": {
        "message": "Maintenance scheduled for this weekend (Saturday 22:00 UTC). Expect minor downtime.",
        "level": "warning",
        "active": true
    },
    "theme": {
        "primaryColor": "blue"
    },
    "updatedAt": new Date()
});

print("Initialized opsbridge database with English configuration.");
