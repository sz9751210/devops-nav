export type Environment = 'dev' | 'staging' | 'prod' | string;

export type ColumnType = 'link' | 'text' | 'status';

export interface ColumnDefinition {
    id: string;        // e.g., 'source', 'logs', 'apm'
    title: string;     // e.g., 'Source Code', 'Kibana Logs'
    type: ColumnType;
    template?: string; // Default template, e.g., 'https://github.com/org/{{service_id}}'
    icon?: string;     // e.g., 'github', 'aws', 'datadog'
}

export interface ServiceDefinition {
    id: string;        // e.g., 'user-service'
    name: string;      // e.g., 'User Service'
    group?: string;    // e.g., 'Core Platform'
    description?: string;
    /**
     * Overrides for specific columns.
     * Key is the column.id, Value is the specific URL for this service.
     */
    overrides?: Record<string, string>;

    /**
     * Additional service-specific variables for substitution.
     * e.g. { "db_name": "users_db_v1" }
     */
    variables?: Record<string, string>;
}

export interface EnvGroup {
    id: string;           // e.g., 'lab', 'platform', 'prod'
    name: string;         // e.g., 'Lab Environments'
    pattern?: string;     // e.g., 'lab-*' (glob pattern)
    color?: string;       // e.g., 'blue', 'green', 'red'
    icon?: string;        // e.g., '📦', '🚀', '🔥'
    environments: Environment[]; // Manually assigned envs if no pattern
}

export interface EnvSpecificConfig {
    visibleServices?: string[]; // IDs of services visible in this environment
    visibleColumns?: string[];  // IDs of columns visible in this environment
    viewMode?: 'list' | 'card'; // Preferred view mode for this enviroment
}

export interface OpsMatrixConfig {
    title: string;
    environments: Environment[];
    columns: ColumnDefinition[];
    services: ServiceDefinition[];
    envGroups?: EnvGroup[];        // Optional environment grouping
    favoriteEnvs?: Environment[];  // User's favorite environments
    envConfigs?: Record<string, EnvSpecificConfig>; // Per-environment configuration
}
