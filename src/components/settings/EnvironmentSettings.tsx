import React, { useState } from 'react';
import { useMatrixStore } from '../../store/useMatrixStore';
import { Plus, Trash2, Globe, ChevronDown, ChevronRight, Check, Settings2 } from 'lucide-react';
import { clsx } from 'clsx';

export const EnvironmentSettings: React.FC = () => {
    const { config, addEnvironment, removeEnvironment, setEnvConfig } = useMatrixStore();
    const [newEnv, setNewEnv] = useState('');
    const [expandedEnv, setExpandedEnv] = useState<string | null>(null);

    const handleAdd = () => {
        if (newEnv.trim() && !config.environments.includes(newEnv.trim())) {
            addEnvironment(newEnv.trim().toLowerCase());
            setNewEnv('');
        }
    };

    const toggleService = (env: string, serviceId: string) => {
        const currentConfig = config.envConfigs?.[env] || {};
        const visibleServices = currentConfig.visibleServices || config.services.map(s => s.id);

        const newServices = visibleServices.includes(serviceId)
            ? visibleServices.filter(id => id !== serviceId)
            : [...visibleServices, serviceId];

        setEnvConfig(env, { ...currentConfig, visibleServices: newServices });
    };

    const selectAll = (env: string) => {
        const currentConfig = config.envConfigs?.[env] || {};
        setEnvConfig(env, { ...currentConfig, visibleServices: config.services.map(s => s.id) });
    };

    const deselectAll = (env: string) => {
        const currentConfig = config.envConfigs?.[env] || {};
        setEnvConfig(env, { ...currentConfig, visibleServices: [] });
    };

    const getVisibleServices = (env: string) => {
        const envConfig = config.envConfigs?.[env];
        if (!envConfig?.visibleServices) {
            return config.services.map(s => s.id); // Default: all visible
        }
        return envConfig.visibleServices;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                    <Globe className="w-5 h-5 text-amber-400" />
                    環境設定
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                    定義部署環境並配置各環境可見的服務
                </p>
            </div>

            {/* Add Form */}
            <div className="flex gap-3">
                <input
                    type="text"
                    value={newEnv}
                    onChange={(e) => setNewEnv(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="輸入環境名稱..."
                    className="flex-1 px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 backdrop-blur-sm transition-all"
                />
                <button
                    onClick={handleAdd}
                    disabled={!newEnv.trim()}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-black rounded-xl font-medium transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    新增
                </button>
            </div>

            {/* List */}
            <div className="space-y-2">
                {config.environments.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                        尚未定義任何環境。請在上方新增環境。
                    </div>
                ) : (
                    config.environments.map((env) => {
                        const isExpanded = expandedEnv === env;
                        const visibleServices = getVisibleServices(env);
                        const allServices = config.services;

                        return (
                            <div
                                key={env}
                                className="rounded-xl border border-white/5 bg-slate-900/40 overflow-hidden"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
                                    <button
                                        onClick={() => setExpandedEnv(isExpanded ? null : env)}
                                        className="flex-1 flex items-center gap-3 text-left"
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                        )}
                                        <span className="font-medium text-slate-200 uppercase tracking-wide">{env}</span>
                                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                                            {visibleServices.length}/{allServices.length} 服務
                                        </span>
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setExpandedEnv(isExpanded ? null : env)}
                                            className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                                            title="配置服務"
                                        >
                                            <Settings2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => removeEnvironment(env)}
                                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="border-t border-white/5 p-4 bg-slate-950/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm text-slate-400">選擇此環境可見的服務:</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => selectAll(env)}
                                                    className="px-2 py-1 text-xs text-amber-400 hover:bg-amber-500/10 rounded transition-colors"
                                                >
                                                    全選
                                                </button>
                                                <button
                                                    onClick={() => deselectAll(env)}
                                                    className="px-2 py-1 text-xs text-slate-400 hover:bg-white/5 rounded transition-colors"
                                                >
                                                    取消全選
                                                </button>
                                            </div>
                                        </div>

                                        {allServices.length === 0 ? (
                                            <div className="text-center py-6 text-slate-500 text-sm">
                                                尚未設定任何服務。請先至「服務管理」新增服務。
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                {allServices.map(service => {
                                                    const isVisible = visibleServices.includes(service.id);
                                                    return (
                                                        <button
                                                            key={service.id}
                                                            onClick={() => toggleService(env, service.id)}
                                                            className={clsx(
                                                                "flex items-center gap-2 p-2 rounded-lg border transition-all text-left",
                                                                isVisible
                                                                    ? "border-amber-500/50 bg-amber-500/10 text-white"
                                                                    : "border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white"
                                                            )}
                                                        >
                                                            <div className={clsx(
                                                                "w-4 h-4 rounded flex items-center justify-center shrink-0",
                                                                isVisible ? "bg-amber-500" : "border border-slate-600"
                                                            )}>
                                                                {isVisible && <Check className="w-3 h-3 text-black" />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="text-sm truncate">{service.name}</div>
                                                                {service.group && (
                                                                    <div className="text-[10px] text-slate-500 truncate">{service.group}</div>
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

            {/* Help */}
            {config.environments.length > 0 && config.services.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">💡 使用提示</h4>
                    <ul className="text-xs text-slate-500 space-y-1">
                        <li>• 點擊環境名稱展開配置面板</li>
                        <li>• 勾選的服務會在該環境的服務列表中顯示</li>
                        <li>• 不同環境可以配置不同的服務組合</li>
                        <li>• 未配置的環境預設顯示所有服務</li>
                    </ul>
                </div>
            )}
        </div>
    );
};
