import React, { useState } from 'react';
import { useMatrixStore } from '../../store/useMatrixStore';
import { Plus, Trash2, Globe } from 'lucide-react';
import { clsx } from 'clsx';

export const EnvironmentSettings: React.FC = () => {
    const { config, addEnvironment, removeEnvironment } = useMatrixStore();
    const [newEnv, setNewEnv] = useState('');

    const handleAdd = () => {
        if (newEnv.trim() && !config.environments.includes(newEnv.trim())) {
            addEnvironment(newEnv.trim().toLowerCase());
            setNewEnv('');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                    <Globe className="w-5 h-5 text-indigo-400" />
                    Environments
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                    Define the deployment environments for your services (e.g., dev, staging, prod)
                </p>
            </div>

            {/* Add Form */}
            <div className="flex gap-3">
                <input
                    type="text"
                    value={newEnv}
                    onChange={(e) => setNewEnv(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="Enter environment name..."
                    className="flex-1 px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 backdrop-blur-sm transition-all"
                />
                <button
                    onClick={handleAdd}
                    disabled={!newEnv.trim()}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-medium transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {/* List */}
            <div className="space-y-3">
                {config.environments.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                        No environments defined yet. Add your first environment above.
                    </div>
                ) : (
                    config.environments.map((env, idx) => (
                        <div
                            key={env}
                            className={clsx(
                                "flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-300 group",
                                "bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-white/5 backdrop-blur-sm"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-500/10 text-xs text-indigo-400 font-mono">
                                    {idx + 1}
                                </span>
                                <span className="font-medium text-slate-200 uppercase tracking-wide group-hover:text-white transition-colors">{env}</span>
                            </div>
                            <button
                                onClick={() => removeEnvironment(env)}
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
