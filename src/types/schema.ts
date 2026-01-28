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
    tags?: string[]; // New: For flexible filtering (e.g., "java", "critical")
    metadata?: Record<string, string>; // New: Key-value pairs for details (e.g. SSH, Owner)
    // Links for this service, organized by column
    links?: ServiceLink[];
    // Legacy fields (kept for backwards compatibility)
    overrides?: Record<string, string>;
    variables?: Record<string, string>;
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

export interface OpsMatrixConfig {
    title: string;
    environments: Environment[];
    columns: ColumnDefinition[];
    services: ServiceDefinition[];
    envGroups?: EnvGroup[];
    favoriteEnvs?: Environment[];
    favoriteServices?: string[];
    recentServices?: string[];
    envConfigs?: Record<string, EnvSpecificConfig>;
    announcement?: { // New: System announcement
        message: string;
        level: 'info' | 'warning' | 'error';
        active: boolean;
    };
    theme?: { // New: Visual customization
        primaryColor: 'amber' | 'blue' | 'green' | 'purple' | 'rose' | 'cyan';
    };
}
