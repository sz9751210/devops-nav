import mongoose, { Schema } from 'mongoose';



export interface ColumnDefinition {
    id: string;
    title: string;
    type: 'link' | 'text' | 'status';
    template?: string;
    icon?: string;
}

export interface Application {
    id: string;
    name: string;
    description?: string;
    owner?: string;
    tags?: string[];
    serviceIds: string[]; // References ServiceDefinition.id
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
    parentId?: string; // Reference to parent ServiceDefinition.id
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
    applications?: Application[];
    envGroups?: EnvGroup[];
    favoriteEnvs?: string[];
    favoriteServices?: string[];
    recentServices?: string[];

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
        tags: [String],
        links: [Schema.Types.Mixed],
        metadata: { type: Map, of: String },
        overrides: { type: Map, of: String },
        variables: { type: Map, of: String },
    }],
    applications: [{
        id: String,
        name: String,
        description: String,
        owner: String,
        tags: [String],
        serviceIds: [String],
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

    updatedAt: { type: Date, default: Date.now },
}, {
    timestamps: { updatedAt: true, createdAt: false },
    strict: false,
    minimize: false,
    collection: 'navigation'
});

export const Config = mongoose.model<IConfig>('Config', ConfigSchema);
