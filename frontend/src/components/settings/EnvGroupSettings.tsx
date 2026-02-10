import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigationStore } from '../../store/useMatrixStore';
import { Plus, Trash2, FolderTree, Pencil, X, Check } from 'lucide-react';
import { clsx } from 'clsx';
import type { EnvGroup } from '../../types/schema';

export const EnvGroupSettings: React.FC = () => {
    const { t } = useTranslation();
    const { config, addEnvGroup, updateEnvGroup, removeEnvGroup } = useNavigationStore();
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [newGroup, setNewGroup] = useState({
        id: '',
        name: '',
        icon: '📦',
        pattern: '',
    });

    const resetForm = () => {
        setNewGroup({ id: '', name: '', icon: '📦', pattern: '' });
        setEditingGroupId(null);
    };

    const handleSave = () => {
        if (newGroup.name.trim()) {
            if (editingGroupId) {
                updateEnvGroup(editingGroupId, {
                    name: newGroup.name.trim(),
                    icon: newGroup.icon || '📦',
                    pattern: newGroup.pattern.trim() || undefined,
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
        });
    };

    const envGroups = config.envGroups || [];

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
                {envGroups.length === 0 ? (
                    <div className="text-center py-10 text-[var(--foreground-muted)] opacity-50 border border-dashed border-[var(--border)] rounded bg-[var(--surface)] text-sm font-mono">
                        {t('settings.env_groups.no_groups')}
                    </div>
                ) : (
                    envGroups.map((group, index) => (
                        <div
                            key={group.id}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', index.toString());
                                e.dataTransfer.effectAllowed = 'move';
                                // Add a ghost class or style if needed
                                // (e.target as HTMLElement).classList.add('opacity-50'); 
                            }}
                            onDragOver={(e) => {
                                e.preventDefault(); // Necessary to allow dropping
                                e.dataTransfer.dropEffect = 'move';
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                                const targetIndex = index;

                                if (sourceIndex === targetIndex) return;

                                const newGroups = [...envGroups];
                                const [movedGroup] = newGroups.splice(sourceIndex, 1);
                                newGroups.splice(targetIndex, 0, movedGroup);

                                // Call store action to update order
                                useNavigationStore.getState().reorderEnvGroups(newGroups);
                            }}
                            className={clsx(
                                "flex items-center justify-between px-4 py-3 rounded border transition-all group cursor-move",
                                "bg-[var(--surface)] border-[var(--border)] hover:border-amber-500/30 hover:bg-[var(--surface-hover)] hover:shadow-md"
                            )}
                        >
                            <div className="flex items-center gap-3 pointer-events-none">
                                <span className="text-xl shrink-0 grayscale group-hover:grayscale-0 transition-all">{group.icon || '📦'}</span>
                                <div>
                                    <div className="font-bold text-[var(--foreground)] group-hover:text-amber-500 transition-colors text-sm">
                                        {group.name}
                                    </div>
                                    <div className="text-xs text-[var(--foreground-muted)] mt-0.5 font-mono uppercase tracking-tighter">
                                        ID: <span className="text-amber-500/70">{group.id}</span>
                                        {group.pattern && (
                                            <span className="ml-3">
                                                PTRN: <span className="text-emerald-500/70">{group.pattern}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                                <button
                                    onClick={() => handleEdit(group)}
                                    className="p-1.5 text-[var(--foreground-muted)] hover:text-amber-600 dark:hover:text-amber-500 rounded transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => removeEnvGroup(group.id)}
                                    className="p-1.5 text-[var(--foreground-muted)] hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>


        </div>
    );
};
