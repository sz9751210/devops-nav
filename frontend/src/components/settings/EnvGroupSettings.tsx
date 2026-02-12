import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigationStore } from '../../store/useMatrixStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, FolderTree, Pencil, X, Check } from 'lucide-react';
import { clsx } from 'clsx';
import type { EnvGroup } from '../../types/schema';

interface SortableEnvGroupItemProps {
    group: EnvGroup;
    index: number;
    onEdit: () => void;
    onRemove: () => void;
}

const SortableEnvGroupItem = ({ group, onEdit, onRemove }: Omit<SortableEnvGroupItemProps, 'index'>) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: group.id });

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
            className={clsx(
                "flex items-center justify-between px-4 py-3 rounded border transition-all group",
                "bg-[var(--surface)] border-[var(--border)] hover:border-amber-500/30 hover:bg-[var(--surface-hover)] hover:shadow-md mb-2"
            )}
        >
            <div className="flex items-center gap-3 overflow-hidden">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-[var(--foreground-muted)] hover:text-[var(--foreground)] shrink-0"
                >
                    <GripVertical className="w-5 h-5" />
                </div>
                <span className="text-xl shrink-0 grayscale group-hover:grayscale-0 transition-all">{group.icon || '📦'}</span>
                <div className="min-w-0">
                    <div className="font-bold text-[var(--foreground)] group-hover:text-amber-500 transition-colors text-sm truncate">
                        {group.name}
                    </div>
                    <div className="text-xs text-[var(--foreground-muted)] mt-0.5 font-mono uppercase tracking-tighter truncate">
                        ID: <span className="text-amber-500/70">{group.id}</span>
                        {group.pattern && (
                            <span className="ml-3">
                                PTRN: <span className="text-emerald-500/70">{group.pattern}</span>
                            </span>
                        )}
                        {group.environments && group.environments.length > 0 && (
                            <span className="ml-3">
                                MANUAL: <span className="text-blue-500/70">{group.environments.length}</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={onEdit}
                    className="p-1.5 text-[var(--foreground-muted)] hover:text-amber-600 dark:hover:text-amber-500 rounded transition-colors"
                >
                    <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={onRemove}
                    className="p-1.5 text-[var(--foreground-muted)] hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};

export const EnvGroupSettings: React.FC = () => {
    const { t } = useTranslation();
    const { config, addEnvGroup, updateEnvGroup, removeEnvGroup } = useNavigationStore();
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [newGroup, setNewGroup] = useState({
        id: '',
        name: '',
        icon: '📦',
        pattern: '',
        environments: [] as string[],
    });

    const resetForm = () => {
        setNewGroup({ id: '', name: '', icon: '📦', pattern: '', environments: [] });
        setEditingGroupId(null);
    };

    const handleSave = () => {
        if (newGroup.name.trim()) {
            if (editingGroupId) {
                updateEnvGroup(editingGroupId, {
                    name: newGroup.name.trim(),
                    icon: newGroup.icon || '📦',
                    pattern: newGroup.pattern.trim() || undefined,
                    environments: newGroup.environments,
                });
            } else {
                // Auto-generate ID from name
                const generatedId = newGroup.name.trim().toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '');

                if (generatedId) {
                    addEnvGroup({
                        id: generatedId,
                        name: newGroup.name.trim(),
                        icon: newGroup.icon || '📦',
                        pattern: newGroup.pattern.trim() || undefined,
                        environments: newGroup.environments,
                    });
                }
            }
            resetForm();
        }
    };

    const handleEdit = (group: EnvGroup) => {
        setEditingGroupId(group.id);
        setNewGroup({
            id: group.id,
            name: group.name,
            icon: group.icon || '📦',
            pattern: group.pattern || '',
            environments: group.environments || [],
        });
    };

    const envGroups = config.envGroups || [];

    // Calculate pattern matches for the current form
    const patternMatchedEnvs = useMemo(() => {
        if (!newGroup.pattern) return new Set<string>();

        try {
            const regexPattern = newGroup.pattern
                .replace(/\*/g, '.*')
                .replace(/\?/g, '.');
            const regex = new RegExp(`^${regexPattern}$`);

            return new Set(config.environments.filter(env => regex.test(env)));
        } catch (e) {
            return new Set<string>();
        }
    }, [newGroup.pattern, config.environments]);


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
            const oldIndex = envGroups.findIndex((item) => item.id === active.id);
            const newIndex = envGroups.findIndex((item) => item.id === over?.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newGroups = arrayMove(envGroups, oldIndex, newIndex);
                useNavigationStore.getState().reorderEnvGroups(newGroups);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2 font-mono">
                    <FolderTree className="w-5 h-5 text-amber-500" />
                    {t('settings.env_groups.title')}
                </h2>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">
                    {t('settings.env_groups.subtitle')}
                </p>
            </div>

            {/* Add/Edit Form */}
            <div className="space-y-3 p-4 bg-[var(--surface)] border border-[var(--border)] rounded backdrop-blur-sm shadow-xl">
                <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest font-mono mb-2">
                    {editingGroupId ? `${t('actions.edit')}: GROUP` : `${t('actions.create')}: GROUP`}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    <input
                        type="text"
                        value={newGroup.name}
                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                        placeholder={t('settings.env_groups.name_placeholder')}
                        className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] text-sm focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        value={newGroup.icon}
                        onChange={(e) => setNewGroup({ ...newGroup, icon: e.target.value })}
                        placeholder={t('form.icon')}
                        maxLength={2}
                        className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] text-sm focus:outline-none focus:border-amber-500/50 transition-all text-center"
                    />
                    <input
                        type="text"
                        value={newGroup.pattern}
                        onChange={(e) => setNewGroup({ ...newGroup, pattern: e.target.value })}
                        placeholder={t('settings.env_groups.pattern_placeholder')}
                        className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] text-sm focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                    />
                </div>

                {/* Manual Environment Selection */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-widest font-mono">
                        {t('settings.env_groups.assigned_envs')}
                    </label>
                    <div className="bg-[var(--background)] border border-[var(--border)] rounded p-2 max-h-[150px] overflow-y-auto grid grid-cols-2 gap-2">
                        {config.environments.map(env => {
                            const isPatternMatched = patternMatchedEnvs.has(env);
                            const isChecked = isPatternMatched || newGroup.environments.includes(env);

                            return (
                                <label
                                    key={env}
                                    className={clsx(
                                        "flex items-center gap-2 p-1.5 rounded transition-colors",
                                        isPatternMatched ? "opacity-70 cursor-not-allowed bg-[var(--surface-hover)]" : "hover:bg-[var(--surface-hover)] cursor-pointer"
                                    )}
                                    title={isPatternMatched ? t('settings.env_groups.auto_matched') : ''}
                                >
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            disabled={isPatternMatched}
                                            onChange={(e) => {
                                                if (isPatternMatched) return;

                                                if (e.target.checked) {
                                                    setNewGroup({ ...newGroup, environments: [...newGroup.environments, env] });
                                                } else {
                                                    setNewGroup({ ...newGroup, environments: newGroup.environments.filter(e => e !== env) });
                                                }
                                            }}
                                            className={clsx(
                                                "rounded border-[var(--border)] bg-[var(--surface)] text-amber-500 focus:ring-amber-500/20",
                                                isPatternMatched && "cursor-not-allowed"
                                            )}
                                        />
                                    </div>
                                    <span className="text-sm text-[var(--foreground)] font-mono flex items-center gap-2">
                                        {env}
                                        {isPatternMatched && (
                                            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1 rounded border border-emerald-500/20">
                                                AUTO
                                            </span>
                                        )}
                                    </span>
                                </label>
                            );
                        })}
                        {config.environments.length === 0 && (
                            <div className="text-xs text-[var(--foreground-muted)] col-span-2 text-center py-2 italic">
                                {t('settings.env_groups.no_envs_available')}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    {editingGroupId && (
                        <button
                            onClick={resetForm}
                            className="px-4 py-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] flex items-center gap-2 text-sm font-mono font-bold uppercase tracking-widest transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                            {t('actions.cancel')}
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={!newGroup.name.trim()}
                        className="flex-1 px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-[var(--surface-hover)] disabled:text-[var(--foreground-muted)] disabled:opacity-50 text-black rounded font-bold transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                    >
                        {editingGroupId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {editingGroupId ? t('actions.update') : t('actions.add_new')}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={envGroups.map(g => g.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {envGroups.length === 0 ? (
                            <div className="text-center py-10 text-[var(--foreground-muted)] opacity-50 border border-dashed border-[var(--border)] rounded bg-[var(--surface)] text-sm font-mono">
                                {t('settings.env_groups.no_groups')}
                            </div>
                        ) : (
                            envGroups.map((group) => (
                                <SortableEnvGroupItem
                                    key={group.id}
                                    group={group}
                                    onEdit={() => handleEdit(group)}
                                    onRemove={() => removeEnvGroup(group.id)}
                                />
                            ))
                        )}
                    </SortableContext>
                </DndContext>
            </div>


        </div>
    );
};
