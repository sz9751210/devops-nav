import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OpsMatrixConfig, Environment, ColumnDefinition, ServiceDefinition } from '../types/schema';
import jsyaml from 'js-yaml';

const DEFAULT_CONFIG: OpsMatrixConfig = {
    title: 'OpsBridge Matrix',
    environments: [],
    columns: [],
    services: [],
};

interface MatrixState {
    config: OpsMatrixConfig;
    currentEnv: Environment;
    isLoading: boolean;
    error: string | null;

    // Actions
    loadConfig: (url?: string) => Promise<void>;
    setConfig: (config: OpsMatrixConfig) => void;
    setEnv: (env: Environment) => void;
    parseConfig: (yamlString: string) => void;
    exportConfig: () => string;

    // Environment CRUD
    addEnvironment: (env: string) => void;
    removeEnvironment: (env: string) => void;

    // Column CRUD
    addColumn: (column: ColumnDefinition) => void;
    updateColumn: (id: string, updates: Partial<ColumnDefinition>) => void;
    removeColumn: (id: string) => void;

    // Service CRUD
    addService: (service: ServiceDefinition) => void;
    updateService: (id: string, updates: Partial<ServiceDefinition>) => void;
    removeService: (id: string) => void;
}

export const useMatrixStore = create<MatrixState>()(
    persist(
        (set, get) => ({
            config: DEFAULT_CONFIG,
            currentEnv: '',
            isLoading: false,
            error: null,

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

            setEnv: (env) => set({ currentEnv: env }),

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
        }),
        {
            name: 'opsbridge-matrix-config',
            partialize: (state) => ({ config: state.config, currentEnv: state.currentEnv }),
        }
    )
);
