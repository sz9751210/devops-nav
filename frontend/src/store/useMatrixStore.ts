import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { OpsNavigationConfig, Environment, ColumnDefinition, ServiceDefinition, EnvGroup, EnvSpecificConfig, ServiceLink } from '../types/schema';
import { api } from '../lib/api';
import jsyaml from 'js-yaml';

const DEFAULT_CONFIG: OpsNavigationConfig = {
    title: 'OpsBridge Navigation',
    environments: [],
    columns: [],
    services: [],
    envConfigs: {},
};

interface NavigationState {
    config: OpsNavigationConfig;
    currentEnv: Environment;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    recentEnvs: Environment[];
    viewMode: 'list' | 'card';
    pendingEnvs: string[];

    // Actions
    loadConfig: () => Promise<void>;
    saveConfig: () => Promise<void>;
    setConfig: (config: OpsNavigationConfig) => void;
    setEnv: (env: Environment) => void;
    setViewMode: (mode: 'list' | 'card') => void;
    parseConfig: (yamlString: string) => void;
    exportConfig: () => string;

    // Environment CRUD
    addEnvironment: (env: string) => void;
    updateEnvironment: (oldEnv: string, newEnv: string) => void;
    removeEnvironment: (env: string) => void;
    setEnvConfig: (env: string, config: EnvSpecificConfig) => void;

    // Favorites
    toggleFavoriteEnv: (env: Environment) => void;
    isFavoriteEnv: (env: Environment) => boolean;
    toggleFavoriteService: (serviceId: string) => void;
    isFavoriteService: (serviceId: string) => boolean;
    addRecentService: (serviceId: string) => void;

    // Column CRUD
    addColumn: (column: ColumnDefinition) => void;
    updateColumn: (id: string, updates: Partial<ColumnDefinition>) => void;
    removeColumn: (id: string) => void;

    // Service CRUD
    addService: (service: ServiceDefinition) => void;
    updateService: (id: string, updates: Partial<ServiceDefinition>) => void;
    removeService: (id: string) => void;

    // Service Link CRUD
    addServiceLink: (serviceId: string, link: ServiceLink) => void;
    updateServiceLink: (serviceId: string, linkId: string, updates: Partial<ServiceLink>) => void;
    removeServiceLink: (serviceId: string, linkId: string) => void;

    // Environment Reordering
    moveEnvironment: (env: string, direction: 'up' | 'down') => void;
    reorderEnvironments: (newOrder: string[]) => void;

    // Environment Groups
    addEnvGroup: (group: Omit<EnvGroup, 'environments'> & { environments?: Environment[] }) => void;
    updateEnvGroup: (id: string, updates: Partial<Omit<EnvGroup, 'environments'>>) => void;
    reorderEnvGroups: (newOrder: EnvGroup[]) => void;
    removeEnvGroup: (id: string) => void;

    // Link Usage Tracking
    trackLinkUsage: (serviceId: string, columnId: string) => void;
}

// Debounce helper
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const debouncedSave = (saveFn: () => Promise<void>) => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveFn();
    }, 500);
};

export const useNavigationStore = create<NavigationState>()(
    subscribeWithSelector((set, get) => ({
        config: DEFAULT_CONFIG,
        currentEnv: '',
        isLoading: true,
        isSaving: false,
        error: null,
        recentEnvs: [],
        viewMode: 'list',
        pendingEnvs: [],

        loadConfig: async () => {
            console.log('useMatrixStore: Loading config...');
            set({ isLoading: true, error: null });
            try {
                const config = await api.getConfig();
                console.log('useMatrixStore: Config loaded:', config.environments);

                // Merge pending environments if any
                const { pendingEnvs } = get();
                if (pendingEnvs.length > 0) {
                    console.log('useMatrixStore: Merging pending envs:', pendingEnvs);
                    const uniqueNewEnvs = pendingEnvs.filter(env => !config.environments.includes(env));
                    if (uniqueNewEnvs.length > 0) {
                        config.environments = [...config.environments, ...uniqueNewEnvs];
                        // If we merged pending environments and we are not in read-only mode, we should save
                        // We use a slight delay to ensure setConfig happens first
                        setTimeout(() => get().saveConfig(), 100);
                    }
                    set({ pendingEnvs: [] });
                }

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
            console.log('useMatrixStore: Saving config...', config.environments);
            set({ isSaving: true });
            try {
                const response = await api.saveConfig(config);
                console.log('useMatrixStore: Save successful:', response.environments);
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
                const parsed = jsyaml.load(yamlString) as OpsNavigationConfig;
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
            const { config, isLoading } = get();

            // If currently loading, add to pending queue to prevent overwrite
            if (isLoading) {
                set(state => ({
                    pendingEnvs: state.pendingEnvs.includes(env) ? state.pendingEnvs : [...state.pendingEnvs, env]
                }));
            }

            if (!config.environments.includes(env)) {
                set({
                    config: { ...config, environments: [...config.environments, env] },
                    currentEnv: get().currentEnv || env,
                });
                // Save immediately to avoid race conditions or debounce cancellation
                get().saveConfig();
            }
        },
        updateEnvironment: (oldEnv, newEnv) => {
            const { config, currentEnv } = get();
            if (oldEnv === newEnv) return;
            if (config.environments.includes(newEnv)) {
                console.warn('Target environment name already exists');
                return;
            }

            const newConfig = { ...config };

            // 1. Update environments list
            newConfig.environments = config.environments.map(e => e === oldEnv ? newEnv : e);

            // 2. Update envConfigs keys
            if (newConfig.envConfigs && newConfig.envConfigs[oldEnv]) {
                newConfig.envConfigs[newEnv] = newConfig.envConfigs[oldEnv];
                delete newConfig.envConfigs[oldEnv];
            }

            // 3. Update Service versions & links
            newConfig.services = config.services.map(svc => {
                const newSvc = { ...svc };
                // Update versions
                if (newSvc.versions && newSvc.versions[oldEnv]) {
                    newSvc.versions[newEnv] = newSvc.versions[oldEnv];
                    delete newSvc.versions[oldEnv];
                }
                // Update link scopes
                if (newSvc.links) {
                    newSvc.links = newSvc.links.map(link => {
                        if (link.environments && link.environments.includes(oldEnv)) {
                            return {
                                ...link,
                                environments: link.environments.map(e => e === oldEnv ? newEnv : e)
                            };
                        }
                        return link;
                    });
                }
                return newSvc;
            });

            // 4. Update Env Groups
            if (newConfig.envGroups) {
                newConfig.envGroups = newConfig.envGroups.map(group => ({
                    ...group,
                    environments: group.environments.map(e => e === oldEnv ? newEnv : e)
                }));
            }

            // 5. Update Favorites
            if (newConfig.favoriteEnvs && newConfig.favoriteEnvs.includes(oldEnv)) {
                newConfig.favoriteEnvs = newConfig.favoriteEnvs.map(e => e === oldEnv ? newEnv : e);
            }

            set({
                config: newConfig,
                currentEnv: currentEnv === oldEnv ? newEnv : currentEnv
            });
            get().saveConfig();
        },
        removeEnvironment: (env) => {
            const { config, currentEnv } = get();
            const newEnvs = config.environments.filter(e => e !== env);
            set({
                config: { ...config, environments: newEnvs },
                currentEnv: currentEnv === env ? (newEnvs[0] || '') : currentEnv,
            });
            // Save immediately
            get().saveConfig();
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

        // Service Link CRUD
        addServiceLink: (serviceId, link) => {
            const { config } = get();
            set({
                config: {
                    ...config,
                    services: config.services.map(s =>
                        s.id === serviceId
                            ? { ...s, links: [...(s.links || []), link] }
                            : s
                    ),
                },
            });
            debouncedSave(() => get().saveConfig());
        },
        updateServiceLink: (serviceId, linkId, updates) => {
            const { config } = get();
            set({
                config: {
                    ...config,
                    services: config.services.map(s =>
                        s.id === serviceId
                            ? {
                                ...s,
                                links: (s.links || []).map(link =>
                                    link.id === linkId ? { ...link, ...updates } : link
                                )
                            }
                            : s
                    ),
                },
            });
            debouncedSave(() => get().saveConfig());
        },
        removeServiceLink: (serviceId, linkId) => {
            const { config } = get();
            set({
                config: {
                    ...config,
                    services: config.services.map(s =>
                        s.id === serviceId
                            ? { ...s, links: (s.links || []).filter(link => link.id !== linkId) }
                            : s
                    ),
                },
            });
            debouncedSave(() => get().saveConfig());
        },

        moveEnvironment: (env, direction) => {
            const { config } = get();
            const envs = [...config.environments];
            const index = envs.indexOf(env);
            if (index === -1) return;

            if (direction === 'up' && index > 0) {
                [envs[index - 1], envs[index]] = [envs[index], envs[index - 1]];
            } else if (direction === 'down' && index < envs.length - 1) {
                [envs[index], envs[index + 1]] = [envs[index + 1], envs[index]];
            } else {
                return;
            }

            set({ config: { ...config, environments: envs } });
            get().saveConfig();
        },

        reorderEnvironments: (newOrder) => {
            const { config } = get();
            set({ config: { ...config, environments: newOrder } });
            get().saveConfig();
        },

        // Favorites - Environments
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

        // Favorites - Services
        toggleFavoriteService: (serviceId) => {
            const { config } = get();
            const favorites = config.favoriteServices || [];
            const newFavorites = favorites.includes(serviceId)
                ? favorites.filter(id => id !== serviceId)
                : [...favorites, serviceId];
            set({ config: { ...config, favoriteServices: newFavorites } });
            debouncedSave(() => get().saveConfig());
        },
        isFavoriteService: (serviceId) => {
            const { config } = get();
            return (config.favoriteServices || []).includes(serviceId);
        },
        addRecentService: (serviceId) => {
            const { config } = get();
            const recent = config.recentServices || [];
            const newRecent = [serviceId, ...recent.filter(id => id !== serviceId)].slice(0, 8);
            set({ config: { ...config, recentServices: newRecent } });
            debouncedSave(() => get().saveConfig());
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
        updateEnvGroup: (id, updates) => {
            const { config } = get();
            const newGroups = (config.envGroups || []).map(g =>
                g.id === id ? { ...g, ...updates } : g
            );
            set({ config: { ...config, envGroups: newGroups } });
            debouncedSave(() => get().saveConfig());
        },
        reorderEnvGroups: (newOrder) => {
            const { config } = get();
            set({ config: { ...config, envGroups: newOrder } });
            debouncedSave(() => get().saveConfig());
        },
        removeEnvGroup: (id) => {
            const { config } = get();
            set({ config: { ...config, envGroups: (config.envGroups || []).filter(g => g.id !== id) } });
            debouncedSave(() => get().saveConfig());
        },

        trackLinkUsage: (serviceId, columnId) => {
            const { config } = get();
            const recent = config.recentLinks || [];
            const newEntry = { serviceId, columnId, timestamp: Date.now() };
            // Filter out existing entries for the same service-column pair and keep last 10
            const filtered = recent.filter(r => !(r.serviceId === serviceId && r.columnId === columnId));
            const newRecent = [newEntry, ...filtered].slice(0, 10);
            set({ config: { ...config, recentLinks: newRecent } });
            debouncedSave(() => get().saveConfig());
        },
    }))
);

// Load config on startup
useNavigationStore.getState().loadConfig();
