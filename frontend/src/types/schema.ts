export type Environment = 'dev' | 'staging' | 'prod' | string;

export type ColumnType = 'link' | 'text' | 'status';

/**
 * A link configured for a specific service.
 */
export interface ServiceLink {
    id: string;              // Unique link ID
    columnId: string;        // Which column category this belongs to (e.g., 'monitoring')
    name: string;            // Display name (e.g., 'Grafana Dashboard')
    url: string;             // Direct URL (no template, user enters full URL)
    environments?: string[]; // Limit to specific envs (empty = all)
    children?: ServiceLink[]; // Nested links
}

/**
 * Column defines a category (監控, 日誌, etc.)
 * Columns no longer contain links - links are on services.
 */
export interface ColumnDefinition {
    id: string;        // e.g., 'monitoring', 'logs'
    title: string;     // e.g., '監控', '日誌'
    type: ColumnType;
    icon?: string;     // e.g., 'activity', 'file'
}

export interface ServiceDefinition {
    id: string;
    name: string;
    group?: string;
    description?: string;
    tags?: string[]; // For flexible filtering (e.g., "java", "critical")
    metadata?: Record<string, string>; // Key-value pairs for details (e.g. SSH, Owner)
    status?: 'healthy' | 'warning' | 'error' | 'unknown'; // New: Health status
    maintenanceMode?: boolean; // New: Maintenance flag
    versions?: Record<string, string>; // New: Version per env (envId -> version)
    // Links for this service, organized by column
    links?: ServiceLink[];
    // Legacy fields (kept for backwards compatibility)
    overrides?: Record<string, string>;
    variables?: Record<string, string>;
    parentId?: string; // Reference to parent ServiceDefinition.id
}

export interface EnvGroup {
    id: string;
    name: string;
    pattern?: string;
    color?: string;
    icon?: string;
    environments: Environment[];
}

export interface EnvSpecificConfig {
    visibleServices?: string[];
    visibleColumns?: string[];
    viewMode?: 'list' | 'card';
}

export interface Application {
    id: string;
    name: string;
    group?: string; // Logical grouping (e.g., "Finance", "Internal Tools")
    description?: string;
    owner?: string;
    tags?: string[];
    serviceIds: string[]; // References ServiceDefinition.id
    environments?: Environment[];
}

export interface OpsNavigationConfig {
    title: string;
    environments: Environment[];
    columns: ColumnDefinition[];
    services: ServiceDefinition[];
    applications?: Application[];
    envGroups?: EnvGroup[];
    favoriteEnvs?: Environment[];
    favoriteServices?: string[];
    recentServices?: string[];
    envConfigs?: Record<string, EnvSpecificConfig>;
    announcement?: { // System announcement
        message: string;
        level: 'info' | 'warning' | 'error' | 'success';
        active: boolean;
        closable?: boolean;
    };
    theme?: { // Visual customization
        primaryColor: 'amber' | 'blue' | 'green' | 'purple' | 'rose' | 'cyan' | 'indigo';
    };
    // New: User preferences/tracking
    recentLinks?: Array<{ serviceId: string; columnId: string; timestamp: number }>;
}
