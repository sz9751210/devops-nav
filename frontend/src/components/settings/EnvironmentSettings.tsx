import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigationStore } from '../../store/useMatrixStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, Globe, ChevronDown, ChevronRight, Check, Settings2, Pencil, X } from 'lucide-react';
import { clsx } from 'clsx';

interface SortableEnvironmentItemProps {
    env: string;
    isExpanded: boolean;
    visibleServices: string[];
    allServices: { id: string, name: string, group?: string }[];
    onExpand: () => void;
    onEdit: () => void;
    onRemove: () => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onToggleService: (serviceId: string) => void;
    getVisibleServices: (env: string) => string[];
    t: any;
}

const SortableEnvironmentItem = ({
    env,
    isExpanded,
    visibleServices,
    allServices,
    onExpand,
    onEdit,
    onRemove,
    onSelectAll,
    onDeselectAll,
    onToggleService,
    getVisibleServices,
    t
}: SortableEnvironmentItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: env });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="rounded border border-[var(--border)] bg-[var(--surface)] overflow-hidden hover:shadow-md transition-shadow mb-2"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--surface-hover)] transition-colors">
                <div
                    {...attributes}
                    {...listeners}
                    className="mr-3 cursor-grab active:cursor-grabbing text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                >
                    <GripVertical className="w-5 h-5" />
                </div>
                <button
                    onClick={onExpand}
                    className="flex-1 flex items-center gap-3 text-left"
                >
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-[var(--foreground-muted)]" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)]" />
                    )}
                    <span className="font-bold text-[var(--foreground)] uppercase tracking-widest text-sm font-mono">{env}</span>
                    <span className="text-xs text-[var(--foreground-muted)] bg-[var(--background)] px-1.5 py-0.5 rounded border border-[var(--border)] font-mono">
                        {t('settings.envs.services_count')}: {visibleServices.length}/{allServices.length}
                    </span>
                </button>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onExpand}
                        className="p-1.5 text-[var(--foreground-muted)] hover:text-amber-600 dark:hover:text-amber-500 rounded transition-colors"
                    >
                        <Settings2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-1.5 text-[var(--foreground-muted)] hover:text-amber-600 dark:hover:text-amber-500 rounded transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onRemove}
                        className="p-1.5 text-[var(--foreground-muted)] hover:text-red-500 rounded transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-[var(--border)] p-4 bg-[var(--background)]">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-[var(--foreground-muted)] uppercase font-mono tracking-tighter">{t('settings.envs.visibility_config')}:</span>
                        <div className="flex gap-2">
                            <button
                                onClick={onSelectAll}
                                className="text-sm text-amber-500 hover:underline font-mono"
                            >
                                {t('actions.select_all')}
                            </button>
                            <button
                                onClick={onDeselectAll}
                                className="text-sm text-[var(--foreground-muted)] hover:underline font-mono"
                            >
                                {t('actions.deselect_all')}
                            </button>
                        </div>
                    </div>

                    {allServices.length === 0 ? (
                        <div className="text-center py-6 text-[var(--foreground-muted)] opacity-50 text-sm font-mono border border-dashed border-[var(--border)] rounded">
                            {t('settings.envs.no_services_configured')}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                            {allServices.map((service) => {
                                const isVisible = getVisibleServices(env).includes(service.id);
                                return (
                                    <button
                                        key={service.id}
                                        onClick={() => onToggleService(service.id)}
                                        className={clsx(
                                            "flex items-center gap-2 p-2 rounded border transition-all text-left",
                                            isVisible
                                                ? "border-amber-500/30 bg-amber-500/5 text-[var(--foreground)]"
                                                : "border-[var(--border)] hover:border-slate-700 text-[var(--foreground-muted)]"
                                        )}
                                    >
                                        <div className={clsx(
                                            "w-3.5 h-3.5 rounded-sm flex items-center justify-center shrink-0 transition-colors",
                                            isVisible ? "bg-amber-500" : "border border-[var(--border)] bg-[var(--surface)]"
                                        )}>
                                            {isVisible && <Check className="w-3 h-3 text-black" />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold truncate tracking-tight">{service.name}</div>
                                            {service.group && (
                                                <div className="text-xs text-slate-500 truncate font-mono uppercase">{service.group}</div>
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
};

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
        const visibleServices = currentConfig.visibleServices || config.services.map((s) => s.id);

        const newServices = visibleServices.includes(serviceId)
            ? visibleServices.filter(id => id !== serviceId)
            : [...visibleServices, serviceId];

        setEnvConfig(env, { ...currentConfig, visibleServices: newServices });
    };

    const selectAll = (env: string) => {
        const currentConfig = config.envConfigs?.[env] || {};
        setEnvConfig(env, { ...currentConfig, visibleServices: config.services.map((s) => s.id) });
    };

    const deselectAll = (env: string) => {
        const currentConfig = config.envConfigs?.[env] || {};
        setEnvConfig(env, { ...currentConfig, visibleServices: [] });
    };

    const getVisibleServices = (env: string) => {
        const envConfig = config.envConfigs?.[env];
        if (!envConfig?.visibleServices) {
            return config.services.map((s) => s.id);
        }
        return envConfig.visibleServices;
    };


    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = config.environments.indexOf(active.id as string);
            const newIndex = config.environments.indexOf(over?.id as string);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newEnvs = arrayMove(config.environments, oldIndex, newIndex);
                useNavigationStore.getState().reorderEnvironments(newEnvs);
            }
        }
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
            <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                    {editingEnv && (
                        <div className="mb-1.5 text-sm font-bold text-amber-500 uppercase tracking-widest font-mono">
                            {t('actions.edit')}: {editingEnv}
                        </div>
                    )}
                    <input
                        type="text"
                        value={newEnv}
                        onChange={(e) => setNewEnv(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        placeholder={t('settings.envs.placeholder')}
                        className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] text-sm focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                    />
                </div>
                {editingEnv && (
                    <button
                        onClick={resetForm}
                        className="px-3 py-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] flex items-center gap-2 text-sm font-mono font-bold uppercase tracking-widest transition-colors"
                    >
                        <X className="w-4 h-4" />
                        {t('actions.cancel')}
                    </button>
                )}
                <button
                    onClick={handleSave}
                    disabled={!newEnv.trim()}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-[var(--surface-hover)] disabled:text-[var(--foreground-muted)] disabled:opacity-50 text-black rounded font-bold transition-all flex items-center gap-2 uppercase text-sm tracking-wide"
                >
                    {editingEnv ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingEnv ? t('actions.update') : t('actions.add_new')}
                </button>
            </div>

            {/* List */}
            <div className="space-y-2">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={config.environments}
                        strategy={verticalListSortingStrategy}
                    >
                        {config.environments.length === 0 ? (
                            <div className="text-center py-10 text-[var(--foreground-muted)] opacity-50 border border-dashed border-[var(--border)] rounded bg-[var(--surface)] text-sm font-mono">
                                {t('settings.envs.no_environments')}
                            </div>
                        ) : (
                            config.environments.map((env) => {
                                const isExpanded = expandedEnv === env;
                                const visibleServices = getVisibleServices(env);
                                const allServices = config.services;

                                return (
                                    <SortableEnvironmentItem
                                        key={env}
                                        env={env}
                                        isExpanded={isExpanded}
                                        visibleServices={visibleServices}
                                        allServices={allServices}
                                        onExpand={() => setExpandedEnv(isExpanded ? null : env)}
                                        onEdit={() => handleEdit(env)}
                                        onRemove={() => removeEnvironment(env)}
                                        onSelectAll={() => selectAll(env)}
                                        onDeselectAll={() => deselectAll(env)}
                                        onToggleService={(serviceId) => toggleService(env, serviceId)}
                                        getVisibleServices={getVisibleServices}
                                        t={t}
                                    />
                                );
                            })
                        )}
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
};
