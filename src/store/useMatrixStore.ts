import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { OpsMatrixConfig, Environment, ColumnDefinition, ServiceDefinition, EnvGroup, EnvSpecificConfig } from '../types/schema';
import { api } from '../lib/api';
import jsyaml from 'js-yaml';

const DEFAULT_CONFIG: OpsMatrixConfig = {
    title: 'OpsBridge Matrix',
    environments: [],
    columns: [],
    services: [],
    envConfigs: {},
};

interface MatrixState {
    config: OpsMatrixConfig;
    currentEnv: Environment;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    recentEnvs: Environment[];
    viewMode: 'list' | 'card';

    // Actions
    loadConfig: () => Promise<void>;
    saveConfig: () => Promise<void>;
    setConfig: (config: OpsMatrixConfig) => void;
    setEnv: (env: Environment) => void;
    setViewMode: (mode: 'list' | 'card') => void;
    parseConfig: (yamlString: string) => void;
    exportConfig: () => string;

    // Environment CRUD
    addEnvironment: (env: string) => void;
    removeEnvironment: (env: string) => void;
    setEnvConfig: (env: string, config: EnvSpecificConfig) => void;

    // Favorites
    toggleFavoriteEnv: (env: Environment) => void;
    isFavoriteEnv: (env: Environment) => boolean;

    // Column CRUD
    addColumn: (column: ColumnDefinition) => void;
    updateColumn: (id: string, updates: Partial<ColumnDefinition>) => void;
    removeColumn: (id: string) => void;

    // Service CRUD
    addService: (service: ServiceDefinition) => void;
    updateService: (id: string, updates: Partial<ServiceDefinition>) => void;
    removeService: (id: string) => void;

    // Environment Groups
    addEnvGroup: (group: Omit<EnvGroup, 'environments'> & { environments?: Environment[] }) => void;
    removeEnvGroup: (id: string) => void;
}

// Debounce helper
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const debouncedSave = (saveFn: () => Promise<void>) => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveFn();
    }, 500);
};

export const useMatrixStore = create<MatrixState>()(
    subscribeWithSelector((set, get) => ({
        config: DEFAULT_CONFIG,
        currentEnv: '',
        isLoading: true,
        isSaving: false,
        error: null,
        recentEnvs: [],
        viewMode: 'list',

        loadConfig: async () => {
            set({ isLoading: true, error: null });
            try {
                const config = await api.getConfig();
                get().setConfig(config);
            } catch (err) {
                console.error('Failed to load config from API:', err);
                set({ error: 'Failed to load configuration' });
            } finally {
                set({ isLoading: false });
            }
        },

        saveConfig: async () => {
            const { config } = get();
            set({ isSaving: true });
            try {
                await api.saveConfig(config);
            } catch (err) {
                console.error('Failed to save config:', err);
                set({ error: 'Failed to save configuration' });
            } finally {
                set({ isSaving: false });
            }
        },

        setConfig: (config) => {
            const state = get();
            let nextEnv = state.currentEnv;
            if (config.environments.length > 0 && !config.environments.includes(state.currentEnv)) {
                nextEnv = config.environments[0];
            }
            set({ config, currentEnv: nextEnv, error: null });
        },

        setEnv: (env) => {
            const { recentEnvs, config } = get();
            const newRecent = [env, ...recentEnvs.filter(e => e !== env)].slice(0, 5);
            const envConfig = config.envConfigs?.[env];
            const viewMode = envConfig?.viewMode || get().viewMode;
            set({ currentEnv: env, recentEnvs: newRecent, viewMode });
        },

        setViewMode: (mode) => {
            set({ viewMode: mode });
            const { currentEnv, config } = get();
            if (currentEnv) {
                const currentConfig = config.envConfigs?.[currentEnv] || {};
                get().setEnvConfig(currentEnv, { ...currentConfig, viewMode: mode });
            }
        },

        parseConfig: (yamlString) => {
            try {
                const parsed = jsyaml.load(yamlString) as OpsMatrixConfig;
                if (!parsed.services) parsed.services = [];
                if (!parsed.columns) parsed.columns = [];
                if (!parsed.environments) parsed.environments = [];
                get().setConfig(parsed);
                debouncedSave(() => get().saveConfig());
            } catch (err) {
                set({ error: `Failed to parse YAML: ${(err as Error).message}` });
            }
        },

        exportConfig: () => {
            const { config } = get();
            return jsyaml.dump(config);
        },

        // Environment CRUD
        addEnvironment: (env) => {
            const { config } = get();
            if (!config.environments.includes(env)) {
                set({
                    config: { ...config, environments: [...config.environments, env] },
                    currentEnv: get().currentEnv || env,
                });
                debouncedSave(() => get().saveConfig());
            }
        },
        removeEnvironment: (env) => {
            const { config, currentEnv } = get();
            const newEnvs = config.environments.filter(e => e !== env);
            set({
                config: { ...config, environments: newEnvs },
                currentEnv: currentEnv === env ? (newEnvs[0] || '') : currentEnv,
            });
            debouncedSave(() => get().saveConfig());
        },

        setEnvConfig: (env, envConfig) => {
            const { config } = get();
            set({
                config: {
                    ...config,
                    envConfigs: {
                        ...(config.envConfigs || {}),
                        [env]: envConfig
                    }
                }
            });
            debouncedSave(() => get().saveConfig());
        },

        // Column CRUD
        addColumn: (column) => {
            const { config } = get();
            set({ config: { ...config, columns: [...config.columns, column] } });
            debouncedSave(() => get().saveConfig());
        },
        updateColumn: (id, updates) => {
            const { config } = get();
            set({
                config: {
                    ...config,
                    columns: config.columns.map(c => c.id === id ? { ...c, ...updates } : c),
                },
            });
            debouncedSave(() => get().saveConfig());
        },
        removeColumn: (id) => {
            const { config } = get();
            set({ config: { ...config, columns: config.columns.filter(c => c.id !== id) } });
            debouncedSave(() => get().saveConfig());
        },

        // Service CRUD
        addService: (service) => {
            const { config } = get();
            set({ config: { ...config, services: [...config.services, service] } });
            debouncedSave(() => get().saveConfig());
        },
        updateService: (id, updates) => {
            const { config } = get();
            set({
                config: {
                    ...config,
                    services: config.services.map(s => s.id === id ? { ...s, ...updates } : s),
                },
            });
            debouncedSave(() => get().saveConfig());
        },
        removeService: (id) => {
            const { config } = get();
            set({ config: { ...config, services: config.services.filter(s => s.id !== id) } });
            debouncedSave(() => get().saveConfig());
        },

        // Favorites
        toggleFavoriteEnv: (env) => {
            const { config } = get();
            const favorites = config.favoriteEnvs || [];
            const newFavorites = favorites.includes(env)
                ? favorites.filter(e => e !== env)
                : [...favorites, env];
            set({ config: { ...config, favoriteEnvs: newFavorites } });
            debouncedSave(() => get().saveConfig());
        },

        isFavoriteEnv: (env) => {
            const { config } = get();
            return (config.favoriteEnvs || []).includes(env);
        },

        // Environment Groups
        addEnvGroup: (group) => {
            const { config } = get();
            const newGroup: EnvGroup = {
                ...group,
                environments: group.environments || []
            };
            set({ config: { ...config, envGroups: [...(config.envGroups || []), newGroup] } });
            debouncedSave(() => get().saveConfig());
        },

        removeEnvGroup: (id) => {
            const { config } = get();
            set({ config: { ...config, envGroups: (config.envGroups || []).filter(g => g.id !== id) } });
            debouncedSave(() => get().saveConfig());
        },
    }))
);

// Load config on startup
useMatrixStore.getState().loadConfig();
