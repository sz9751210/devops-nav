import React from 'react';
import { useNavigationStore } from '../../store/useNavigationStore';
import { clsx } from 'clsx';

export const EnvSwitcher: React.FC = () => {
    const { config, currentEnv, setEnv } = useNavigationStore();

    if (!config) return null;

    return (
        <div className="flex bg-slate-900/40 p-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
            {config.environments.map((env) => (
                <button
                    key={env}
                    onClick={() => setEnv(env)}
                    className={clsx(
                        "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300",
                        currentEnv === env
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-indigo-400/50"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    {env.toUpperCase()}
                </button>
            ))}
        </div>
    );
};
