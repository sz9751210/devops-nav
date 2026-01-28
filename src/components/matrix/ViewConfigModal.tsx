import React, { useState } from 'react';
import { useMatrixStore } from '../../store/useMatrixStore';
import { X, Search, Check, Save } from 'lucide-react';
import { clsx } from 'clsx';

interface ViewConfigModalProps {
    onClose: () => void;
}

export const ViewConfigModal: React.FC<ViewConfigModalProps> = ({ onClose }) => {
    const { config, currentEnv, setEnvConfig } = useMatrixStore();
    const [activeTab, setActiveTab] = useState<'services' | 'columns'>('services');
    const [searchQuery, setSearchQuery] = useState('');

    // Load current config or default to all visible
    const envConfig = config.envConfigs?.[currentEnv] || {};
    const [visibleServices, setVisibleServices] = useState<Set<string>>(
        new Set(envConfig.visibleServices || config.services.map(s => s.id))
    );
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
        new Set(envConfig.visibleColumns || config.columns.map(c => c.id))
    );

    const handleSave = () => {
        setEnvConfig(currentEnv, {
            ...envConfig,
            visibleServices: Array.from(visibleServices),
            visibleColumns: Array.from(visibleColumns),
        });
        onClose();
    };

    const toggleService = (id: string) => {
        const newSet = new Set(visibleServices);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setVisibleServices(newSet);
    };

    const toggleColumn = (id: string) => {
        const newSet = new Set(visibleColumns);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setVisibleColumns(newSet);
    };

    const filteredServices = config.services.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="w-full max-w-2xl bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/50">
                    <div>
                        <h2 className="text-lg font-bold text-white font-display">View Configuration</h2>
                        <p className="text-sm text-slate-400">Customize what you see for <span className="text-indigo-400 font-mono">{currentEnv}</span></p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 bg-slate-900/30">
                    <button
                        onClick={() => setActiveTab('services')}
                        className={clsx(
                            "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
                            activeTab === 'services'
                                ? "text-indigo-400 border-indigo-400 bg-indigo-500/5"
                                : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5"
                        )}
                    >
                        Services ({visibleServices.size}/{config.services.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('columns')}
                        className={clsx(
                            "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
                            activeTab === 'columns'
                                ? "text-indigo-400 border-indigo-400 bg-indigo-500/5"
                                : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5"
                        )}
                    >
                        Columns ({visibleColumns.size}/{config.columns.length})
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 h-[400px] flex flex-col">
                    {activeTab === 'services' && (
                        <>
                            <div className="mb-4 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search services..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-white/5 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                                {filteredServices.map(service => (
                                    <label
                                        key={service.id}
                                        onClick={() => toggleService(service.id)}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={clsx(
                                                "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                                visibleServices.has(service.id)
                                                    ? "bg-indigo-500 border-indigo-500"
                                                    : "border-slate-600 group-hover:border-slate-500"
                                            )}>
                                                {visibleServices.has(service.id) && <Check className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white text-sm">{service.name}</div>
                                                <div className="text-xs text-slate-500">{service.id}</div>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'columns' && (
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                            {config.columns.map(column => (
                                <label
                                    key={column.id}
                                    onClick={() => toggleColumn(column.id)}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                            visibleColumns.has(column.id)
                                                ? "bg-indigo-500 border-indigo-500"
                                                : "border-slate-600 group-hover:border-slate-500"
                                        )}>
                                            {visibleColumns.has(column.id) && <Check className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white text-sm">{column.title}</div>
                                            <div className="text-xs text-slate-500 font-mono">{column.id}</div>
                                        </div>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded bg-white/5 text-slate-400 capitalize">
                                        {column.type}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-slate-900/50 flex items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                if (activeTab === 'services') {
                                    setVisibleServices(new Set(config.services.map(s => s.id)));
                                } else {
                                    setVisibleColumns(new Set(config.columns.map(c => c.id)));
                                }
                            }}
                            className="text-xs text-slate-400 hover:text-indigo-400 transition-colors"
                        >
                            Select All
                        </button>
                        <span className="text-slate-600">|</span>
                        <button
                            onClick={() => {
                                if (activeTab === 'services') {
                                    setVisibleServices(new Set());
                                } else {
                                    setVisibleColumns(new Set());
                                }
                            }}
                            className="text-xs text-slate-400 hover:text-indigo-400 transition-colors"
                        >
                            Deselect All
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            <Save className="w-4 h-4" />
                            Save Config
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
