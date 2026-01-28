import React, { useState } from 'react';
import { useMatrixStore } from '../../store/useMatrixStore';
import { Plus, Trash2, FolderTree } from 'lucide-react';
import { clsx } from 'clsx';

export const EnvGroupSettings: React.FC = () => {
    const { config, addEnvGroup, removeEnvGroup } = useMatrixStore();
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
                <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                    <FolderTree className="w-5 h-5 text-indigo-400" />
                    Environment Groups
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                    Organize environments into groups for easier navigation. Use patterns like "lab-*" to auto-group.
                </p>
            </div>

            {/* Add Form */}
            <div className="space-y-3 p-4 bg-slate-900/40 border border-white/5 rounded-xl backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        value={newGroup.id}
                        onChange={(e) => setNewGroup({ ...newGroup, id: e.target.value })}
                        placeholder="Group ID (e.g., lab)"
                        className="px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 backdrop-blur-sm transition-all"
                    />
                    <input
                        type="text"
                        value={newGroup.name}
                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                        placeholder="Display Name (e.g., Lab Environments)"
                        className="px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 backdrop-blur-sm transition-all"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        value={newGroup.icon}
                        onChange={(e) => setNewGroup({ ...newGroup, icon: e.target.value })}
                        placeholder="Icon (emoji)"
                        maxLength={2}
                        className="px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 backdrop-blur-sm transition-all"
                    />
                    <input
                        type="text"
                        value={newGroup.pattern}
                        onChange={(e) => setNewGroup({ ...newGroup, pattern: e.target.value })}
                        placeholder="Pattern (e.g., lab-*) - optional"
                        className="px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 backdrop-blur-sm transition-all"
                    />
                </div>
                <button
                    onClick={handleAdd}
                    disabled={!newGroup.id.trim() || !newGroup.name.trim()}
                    className="w-full px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-medium transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Add Group
                </button>
            </div>

            {/* List */}
            <div className="space-y-3">
                {envGroups.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                        No environment groups defined. Environments will be auto-grouped by prefix.
                    </div>
                ) : (
                    envGroups.map((group) => (
                        <div
                            key={group.id}
                            className={clsx(
                                "flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-300 group",
                                "bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-white/5 backdrop-blur-sm"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl">{group.icon || '📦'}</span>
                                <div>
                                    <div className="font-medium text-white group-hover:text-white transition-colors">
                                        {group.name}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        ID: <span className="font-mono text-slate-400">{group.id}</span>
                                        {group.pattern && (
                                            <span className="ml-3">
                                                Pattern: <span className="font-mono text-slate-400">{group.pattern}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => removeEnvGroup(group.id)}
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Info */}
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <h3 className="text-sm font-bold text-indigo-300 mb-2">💡 Tips</h3>
                <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Use patterns like "lab-*" to automatically group environments starting with "lab-"</li>
                    <li>• If no groups are defined, environments will be auto-grouped by their prefix</li>
                    <li>• Groups appear in the environment selector dropdown for easier navigation</li>
                </ul>
            </div>
        </div>
    );
};
