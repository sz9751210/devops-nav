import mongoose, { Schema } from 'mongoose';

// Match the frontend schema types
export interface EnvSpecificConfig {
    visibleServices?: string[];
    visibleColumns?: string[];
    viewMode?: 'list' | 'card';
}

export interface ColumnDefinition {
    id: string;
    title: string;
    type: 'link' | 'text' | 'status';
    template?: string;
    icon?: string;
}

export interface ServiceDefinition {
    id: string;
    name: string;
    group?: string;
    description?: string;
    tags?: string[];
    links?: any[];
    metadata?: Record<string, string>;
    overrides?: Record<string, string>;
    variables?: Record<string, string>;
}

export interface EnvGroup {
    id: string;
    name: string;
    pattern?: string;
    color?: string;
    icon?: string;
    environments: string[];
}

export interface IConfig {
    _id: string;
    title: string;
    environments: string[];
    columns: ColumnDefinition[];
    services: ServiceDefinition[];
    envGroups?: EnvGroup[];
    favoriteEnvs?: string[];
    favoriteServices?: string[];
    recentServices?: string[];
    envConfigs?: Record<string, EnvSpecificConfig>;
    recentLinks?: any[];
    announcement?: any;
    theme?: any;
    updatedAt: Date;
}

const ConfigSchema = new Schema<IConfig>({
    _id: { type: String, default: 'default' },
    title: { type: String, required: true, default: 'OpsBridge Navigation' },
    environments: [String],
    columns: [{
        id: String,
        title: String,
        type: { type: String, enum: ['link', 'text', 'status'] },
        template: String,
        icon: String,
    }],
    services: [{
        id: String,
        name: String,
        group: String,
        description: String,
        overrides: { type: Map, of: String },
        variables: { type: Map, of: String },
    }],
    envGroups: [{
        id: String,
        name: String,
        pattern: String,
        color: String,
        icon: String,
        environments: [String],
    }],
    favoriteEnvs: [String],
    envConfigs: { type: Map, of: Object },
    updatedAt: { type: Date, default: Date.now },
}, {
    timestamps: { updatedAt: true, createdAt: false },
    strict: false,
    minimize: false,
    collection: 'navigation'
});

export const Config = mongoose.model<IConfig>('Config', ConfigSchema);
