import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigationStore } from '../../store/useMatrixStore';
import { Plus, Trash2, Globe, ChevronDown, ChevronRight, Check, Settings2, Pencil, X } from 'lucide-react';
import { clsx } from 'clsx';

export const EnvironmentSettings: React.FC = () => {
    const { t } = useTranslation();
    const { config, addEnvironment, updateEnvironment, removeEnvironment, setEnvConfig } = useNavigationStore();
    const [newEnv, setNewEnv] = useState('');
    const [editingEnv, setEditingEnv] = useState<string | null>(null);
    const [expandedEnv, setExpandedEnv] = useState<string | null>(null);

    const resetForm = () => {
        setNewEnv('');
        setEditingEnv(null);
    };

    const handleSave = () => {
        if (newEnv.trim()) {
            const trimmedEnv = newEnv.trim().toLowerCase();
            if (editingEnv) {
                updateEnvironment(editingEnv, trimmedEnv);
            } else if (!config.environments.includes(trimmedEnv)) {
                addEnvironment(trimmedEnv);
            }
            resetForm();
        }
    };

    const handleEdit = (env: string) => {
        setEditingEnv(env);
        setNewEnv(env);
    };

    const toggleService = (env: string, serviceId: string) => {
        const currentConfig = config.envConfigs?.[env] || {};
        const visibleServices = currentConfig.visibleServices || config.services.map((s: any) => s.id);

        const newServices = visibleServices.includes(serviceId)
            ? visibleServices.filter(id => id !== serviceId)
            : [...visibleServices, serviceId];

        setEnvConfig(env, { ...currentConfig, visibleServices: newServices });
    };

    const selectAll = (env: string) => {
        const currentConfig = config.envConfigs?.[env] || {};
        setEnvConfig(env, { ...currentConfig, visibleServices: config.services.map((s: any) => s.id) });
    };

    const deselectAll = (env: string) => {
        const currentConfig = config.envConfigs?.[env] || {};
        setEnvConfig(env, { ...currentConfig, visibleServices: [] });
    };

    const getVisibleServices = (env: string) => {
        const envConfig = config.envConfigs?.[env];
        if (!envConfig?.visibleServices) {
            return config.services.map((s: any) => s.id);
        }
        return envConfig.visibleServices;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2 font-mono">
                    <Globe className="w-5 h-5 text-amber-500" />
                    {t('settings.envs.title')}
                </h2>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">
                    {t('settings.envs.subtitle')}
                </p>
            </div>

            {/* Add/Edit Form */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    {editingEnv && (
                        <div className="absolute -top-5 left-0 text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono">
                            {t('actions.edit')}: {editingEnv}
                        </div>
                    )}
                    <input
                        type="text"
                        value={newEnv}
                        onChange={(e) => setNewEnv(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        placeholder={t('settings.envs.placeholder')}
                        className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                    />
                </div>
                {editingEnv && (
                    <button
                        onClick={resetForm}
                        className="px-4 py-2 text-slate-500 hover:text-white flex items-center gap-2 text-sm font-mono font-bold uppercase tracking-widest transition-colors"
                    >
                        <X className="w-4 h-4" />
                        {t('actions.cancel')}
                    </button>
                )}
                <button
                    onClick={handleSave}
                    disabled={!newEnv.trim()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-[var(--surface-hover)] disabled:text-slate-600 text-black rounded font-bold transition-all flex items-center gap-2 uppercase text-sm tracking-wide"
                >
                    {editingEnv ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingEnv ? t('actions.update') : t('actions.add_new')}
                </button>
            </div>

            {/* List */}
            <div className="space-y-2">
                {config.environments.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 border border-dashed border-[var(--border)] rounded bg-[var(--surface)] text-sm font-mono">
                        {t('settings.envs.no_environments')}
                    </div>
                ) : (
                    config.environments.map((env) => {
                        const isExpanded = expandedEnv === env;
                        const visibleServices = getVisibleServices(env);
                        const allServices = config.services;

                        return (
                            <div
                                key={env}
                                className="rounded border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--surface-hover)] transition-colors">
                                    <button
                                        onClick={() => setExpandedEnv(isExpanded ? null : env)}
                                        className="flex-1 flex items-center gap-3 text-left"
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="w-4 h-4 text-slate-500" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-slate-500" />
                                        )}
                                        <span className="font-bold text-slate-300 uppercase tracking-widest text-xs font-mono">{env}</span>
                                        <span className="text-[10px] text-[var(--foreground-muted)] bg-[var(--background)] px-1.5 py-0.5 rounded border border-[var(--border)] font-mono">
                                            SERVICES: {visibleServices.length}/{allServices.length}
                                        </span>
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setExpandedEnv(isExpanded ? null : env)}
                                            className="p-1.5 text-slate-600 hover:text-amber-500 rounded transition-colors"
                                        >
                                            <Settings2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(env)}
                                            className="p-1.5 text-slate-600 hover:text-amber-500 rounded transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => removeEnvironment(env)}
                                            className="p-1.5 text-slate-600 hover:text-red-500 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="border-t border-[var(--border)] p-4 bg-[var(--background)]">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs text-[var(--foreground-muted)] uppercase font-mono tracking-tighter">Visibility Configuration:</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => selectAll(env)}
                                                    className="text-[10px] text-amber-500 hover:underline font-mono"
                                                >
                                                    SELECT_ALL
                                                </button>
                                                <button
                                                    onClick={() => deselectAll(env)}
                                                    className="text-[10px] text-[var(--foreground-muted)] hover:underline font-mono"
                                                >
                                                    DESELECT_ALL
                                                </button>
                                            </div>
                                        </div>

                                        {allServices.length === 0 ? (
                                            <div className="text-center py-6 text-slate-700 text-xs font-mono border border-dashed border-[var(--border)] rounded">
                                                ERR: NO_SERVICES_CONFIGURED
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                                {allServices.map((service: any) => {
                                                    const isVisible = visibleServices.includes(service.id);
                                                    return (
                                                        <button
                                                            key={service.id}
                                                            onClick={() => toggleService(env, service.id)}
                                                            className={clsx(
                                                                "flex items-center gap-2 p-2 rounded border transition-all text-left",
                                                                isVisible
                                                                    ? "border-amber-500/30 bg-amber-500/5 text-slate-200"
                                                                    : "border-[var(--border)] hover:border-slate-700 text-[var(--foreground-muted)]"
                                                            )}
                                                        >
                                                            <div className={clsx(
                                                                "w-3.5 h-3.5 rounded-sm flex items-center justify-center shrink-0 transition-colors",
                                                                isVisible ? "bg-amber-500" : "border border-slate-700"
                                                            )}>
                                                                {isVisible && <Check className="w-3 h-3 text-black" />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="text-[11px] font-bold truncate tracking-tight">{service.name}</div>
                                                                {service.group && (
                                                                    <div className="text-[9px] text-slate-500 truncate font-mono uppercase">{service.group}</div>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
