import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OpsMatrixConfig, Environment, ColumnDefinition, ServiceDefinition, EnvGroup, EnvSpecificConfig } from '../types/schema';
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
    error: string | null;
    recentEnvs: Environment[];  // Track last 5 environments
    viewMode: 'list' | 'card';

    // Actions
    loadConfig: (url?: string) => Promise<void>;
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


export const useMatrixStore = create<MatrixState>()(
    persist(
        (set, get) => ({
            config: DEFAULT_CONFIG,
            currentEnv: '',
            isLoading: false,
            error: null,
            recentEnvs: [],
            viewMode: 'list',

            loadConfig: async (url = '/default.yaml') => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Failed to load config: ${response.statusText}`);
                    }
                    const text = await response.text();
                    get().parseConfig(text);
                } catch (err) {
                    // If load fails, just use existing/default config
                    set({ error: null });
                } finally {
                    set({ isLoading: false });
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
                // Update recent environments (max 5, most recent first)
                const newRecent = [env, ...recentEnvs.filter(e => e !== env)].slice(0, 5);

                // Restore per-environment view mode preference if set
                const envConfig = config.envConfigs?.[env];
                const viewMode = envConfig?.viewMode || get().viewMode;

                set({ currentEnv: env, recentEnvs: newRecent, viewMode });
            },

            setViewMode: (mode) => {
                set({ viewMode: mode });
                // Optional: Auto-save view mode preference to env config
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
                }
            },
            removeEnvironment: (env) => {
                const { config, currentEnv } = get();
                const newEnvs = config.environments.filter(e => e !== env);
                set({
                    config: { ...config, environments: newEnvs },
                    currentEnv: currentEnv === env ? (newEnvs[0] || '') : currentEnv,
                });
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
            },

            // Column CRUD
            addColumn: (column) => {
                const { config } = get();
                set({ config: { ...config, columns: [...config.columns, column] } });
            },
            updateColumn: (id, updates) => {
                const { config } = get();
                set({
                    config: {
                        ...config,
                        columns: config.columns.map(c => c.id === id ? { ...c, ...updates } : c),
                    },
                });
            },
            removeColumn: (id) => {
                const { config } = get();
                set({ config: { ...config, columns: config.columns.filter(c => c.id !== id) } });
            },

            // Service CRUD
            addService: (service) => {
                const { config } = get();
                set({ config: { ...config, services: [...config.services, service] } });
            },
            updateService: (id, updates) => {
                const { config } = get();
                set({
                    config: {
                        ...config,
                        services: config.services.map(s => s.id === id ? { ...s, ...updates } : s),
                    },
                });
            },
            removeService: (id) => {
                const { config } = get();
                set({ config: { ...config, services: config.services.filter(s => s.id !== id) } });
            },

            // Favorites
            toggleFavoriteEnv: (env) => {
                const { config } = get();
                const favorites = config.favoriteEnvs || [];
                const newFavorites = favorites.includes(env)
                    ? favorites.filter(e => e !== env)
                    : [...favorites, env];
                set({ config: { ...config, favoriteEnvs: newFavorites } });
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
            },

            removeEnvGroup: (id) => {
                const { config } = get();
                set({ config: { ...config, envGroups: (config.envGroups || []).filter(g => g.id !== id) } });
            },
        }),
        {
            name: 'opsbridge-matrix-config',
            partialize: (state) => ({
                config: state.config,
                currentEnv: state.currentEnv,
                recentEnvs: state.recentEnvs,
                viewMode: state.viewMode,
            }),
        }
    )
);
