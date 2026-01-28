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
    envConfigs?: Record<string, EnvSpecificConfig>;
    updatedAt: Date;
}

const ConfigSchema = new Schema<IConfig>({
    _id: { type: String, default: 'default' },
    title: { type: String, required: true, default: 'OpsBridge Navigation' },
    environments: [{ type: String }],
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
    favoriteEnvs: [{ type: String }],
    envConfigs: { type: Map, of: Object },
    updatedAt: { type: Date, default: Date.now },
}, {
    _id: false,
    timestamps: { updatedAt: true, createdAt: false }
});

export const Config = mongoose.model<IConfig>('Config', ConfigSchema);
