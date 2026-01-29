import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigationStore } from '../../store/useMatrixStore';
import { Plus, Trash2, FolderTree } from 'lucide-react';
import { clsx } from 'clsx';

export const EnvGroupSettings: React.FC = () => {
    const { t } = useTranslation();
    const { config, addEnvGroup, removeEnvGroup } = useNavigationStore();
    const [newGroup, setNewGroup] = useState({
        id: '',
        name: '',
        icon: '📦',
        pattern: '',
    });

    const handleAdd = () => {
        if (newGroup.id.trim() && newGroup.name.trim()) {
            addEnvGroup({
                id: newGroup.id.trim().toLowerCase(),
                name: newGroup.name.trim(),
                icon: newGroup.icon || '📦',
                pattern: newGroup.pattern.trim() || undefined,
            });
            setNewGroup({ id: '', name: '', icon: '📦', pattern: '' });
        }
    };

    const envGroups = config.envGroups || [];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2 font-mono">
                    <FolderTree className="w-5 h-5 text-amber-500" />
                    {t('settings.env_groups.title')}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    {t('settings.env_groups.subtitle')}
                </p>
            </div>

            {/* Add Form */}
            <div className="space-y-3 p-4 bg-[var(--surface)] border border-[var(--border)] rounded backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        value={newGroup.id}
                        onChange={(e) => setNewGroup({ ...newGroup, id: e.target.value })}
                        placeholder={t('settings.env_groups.id_placeholder')}
                        className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-slate-700 text-sm focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                    />
                    <input
                        type="text"
                        value={newGroup.name}
                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                        placeholder={t('settings.env_groups.name_placeholder')}
                        className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-slate-700 text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        value={newGroup.icon}
                        onChange={(e) => setNewGroup({ ...newGroup, icon: e.target.value })}
                        placeholder={t('form.icon')}
                        maxLength={2}
                        className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-slate-700 text-sm focus:outline-none focus:border-amber-500/50 transition-all text-center"
                    />
                    <input
                        type="text"
                        value={newGroup.pattern}
                        onChange={(e) => setNewGroup({ ...newGroup, pattern: e.target.value })}
                        placeholder={t('settings.env_groups.pattern_placeholder')}
                        className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-slate-700 text-sm focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                    />
                </div>
                <button
                    onClick={handleAdd}
                    disabled={!newGroup.id.trim() || !newGroup.name.trim()}
                    className="w-full px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-[var(--surface-hover)] disabled:text-slate-600 text-black rounded font-bold transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    {t('actions.add_new')}
                </button>
            </div>

            {/* List */}
            <div className="space-y-2">
                {envGroups.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 border border-dashed border-[var(--border)] rounded bg-[var(--surface)] text-sm font-mono">
                        {t('settings.env_groups.no_groups')}
                    </div>
                ) : (
                    envGroups.map((group: any) => (
                        <div
                            key={group.id}
                            className={clsx(
                                "flex items-center justify-between px-4 py-3 rounded border transition-all group",
                                "bg-[var(--surface)] border-[var(--border)] hover:border-amber-500/30 hover:bg-[var(--surface-hover)]"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl shrink-0 grayscale group-hover:grayscale-0 transition-all">{group.icon || '📦'}</span>
                                <div>
                                    <div className="font-bold text-slate-300 group-hover:text-[var(--foreground)] transition-colors text-sm">
                                        {group.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-0.5 font-mono uppercase tracking-tighter">
                                        ID: <span className="text-amber-500/70">{group.id}</span>
                                        {group.pattern && (
                                            <span className="ml-3">
                                                PTRN: <span className="text-emerald-500/70">{group.pattern}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => removeEnvGroup(group.id)}
                                className="p-1.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Info Snippet */}
            <div className="p-3 bg-[var(--surface)] border-l-2 border-amber-500/50 rounded-r text-xs">
                <h3 className="font-bold text-amber-500/80 mb-1 font-mono uppercase tracking-widest">{t('app.documentation')}</h3>
                <p className="text-slate-400 leading-relaxed italic">
                    {t('settings.env_groups.tips')}
                </p>
            </div>
        </div>
    );
};
