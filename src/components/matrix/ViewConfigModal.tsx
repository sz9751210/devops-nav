import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatrixStore } from '../../store/useMatrixStore';
import { X, Search, Check, Save } from 'lucide-react';
import { clsx } from 'clsx';

interface ViewConfigModalProps {
    onClose: () => void;
}

export const ViewConfigModal: React.FC<ViewConfigModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
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
            <div className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border)] bg-[var(--surface-hover)]">
                    <div>
                        <h2 className="text-lg font-bold text-[var(--foreground)] font-mono uppercase tracking-tight">{t('settings.view_config.title')}</h2>
                        <p className="text-sm text-slate-500">
                            {t('settings.view_config.subtitle')} <span className="text-amber-500 font-mono font-bold tracking-widest">{currentEnv}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[var(--border)] bg-[var(--background)]">
                    <button
                        onClick={() => setActiveTab('services')}
                        className={clsx(
                            "flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 font-mono",
                            activeTab === 'services'
                                ? "text-amber-500 border-amber-500 bg-amber-500/5 shadow-[inset_0_-4px_10px_-4px_rgba(245,158,11,0.2)]"
                                : "text-slate-600 border-transparent hover:text-slate-400 hover:bg-white/5"
                        )}
                    >
                        {t('settings.view_config.services_tab')} ({visibleServices.size}/{config.services.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('columns')}
                        className={clsx(
                            "flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 font-mono",
                            activeTab === 'columns'
                                ? "text-amber-500 border-amber-500 bg-amber-500/5 shadow-[inset_0_-4px_10px_-4px_rgba(245,158,11,0.2)]"
                                : "text-slate-600 border-transparent hover:text-slate-400 hover:bg-white/5"
                        )}
                    >
                        {t('settings.view_config.columns_tab')} ({visibleColumns.size}/{config.columns.length})
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 h-[400px] flex flex-col bg-[var(--background)]/50">
                    {activeTab === 'services' && (
                        <>
                            <div className="mb-4 relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 transition-colors group-focus-within:text-amber-500/50" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('settings.services.search_placeholder')}
                                    className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-sm text-[var(--foreground)] placeholder-slate-800 focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-2">
                                {filteredServices.length === 0 ? (
                                    <div className="text-center py-20 text-slate-700 text-xs font-mono uppercase tracking-widest">
                                        ERR: NO_MATCHES_FOUND
                                    </div>
                                ) : (
                                    filteredServices.map(service => (
                                        <label
                                            key={service.id}
                                            className="flex items-center justify-between p-3 rounded border border-transparent hover:border-[var(--border)] hover:bg-[var(--surface)] cursor-pointer group transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    onClick={(e) => { e.preventDefault(); toggleService(service.id); }}
                                                    className={clsx(
                                                        "w-5 h-5 rounded border flex items-center justify-center transition-all",
                                                        visibleServices.has(service.id)
                                                            ? "bg-amber-500 border-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                                                            : "border-slate-700 group-hover:border-slate-500 bg-[var(--background)]"
                                                    )}
                                                >
                                                    {visibleServices.has(service.id) && <Check className="w-3.5 h-3.5 text-black" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={visibleServices.has(service.id)}
                                                    onChange={() => toggleService(service.id)}
                                                    className="hidden"
                                                />
                                                <div>
                                                    <div className="font-bold text-slate-200 text-sm group-hover:text-amber-500 transition-colors">{service.name}</div>
                                                    <div className="text-[10px] text-slate-600 font-mono uppercase tracking-tighter">{service.id}</div>
                                                </div>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'columns' && (
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-2">
                            {config.columns.map(column => (
                                <label
                                    key={column.id}
                                    className="flex items-center justify-between p-3 rounded border border-transparent hover:border-[var(--border)] hover:bg-[var(--surface)] cursor-pointer group transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            onClick={(e) => { e.preventDefault(); toggleColumn(column.id); }}
                                            className={clsx(
                                                "w-5 h-5 rounded border flex items-center justify-center transition-all",
                                                visibleColumns.has(column.id)
                                                    ? "bg-amber-500 border-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                                                    : "border-slate-700 group-hover:border-slate-500 bg-[var(--background)]"
                                            )}
                                        >
                                            {visibleColumns.has(column.id) && <Check className="w-3.5 h-3.5 text-black" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={visibleColumns.has(column.id)}
                                            onChange={() => toggleColumn(column.id)}
                                            className="hidden"
                                        />
                                        <div>
                                            <div className="font-bold text-slate-200 text-sm group-hover:text-amber-500 transition-colors">{column.title}</div>
                                            <div className="text-[10px] text-slate-600 font-mono uppercase tracking-tighter">{column.id}</div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--background)] text-slate-500 font-mono uppercase">
                                        {column.type}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-hover)] flex items-center justify-between">
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                if (activeTab === 'services') {
                                    setVisibleServices(new Set(config.services.map(s => s.id)));
                                } else {
                                    setVisibleColumns(new Set(config.columns.map(c => c.id)));
                                }
                            }}
                            className="text-[10px] font-bold text-slate-600 hover:text-amber-500 transition-colors uppercase tracking-widest font-mono"
                        >
                            {t('actions.select_all')}
                        </button>
                        <button
                            onClick={() => {
                                if (activeTab === 'services') {
                                    setVisibleServices(new Set());
                                } else {
                                    setVisibleColumns(new Set());
                                }
                            }}
                            className="text-[10px] font-bold text-slate-600 hover:text-amber-500 transition-colors uppercase tracking-widest font-mono"
                        >
                            {t('actions.deselect_all')}
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase font-mono"
                        >
                            {t('actions.cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded font-bold text-xs flex items-center gap-2 transition-all shadow-lg hover:shadow-primary/20 uppercase tracking-tight"
                        >
                            <Save className="w-3.5 h-3.5" />
                            {t('actions.save_config')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
