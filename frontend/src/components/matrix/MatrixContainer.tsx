import React, { useState, useMemo } from 'react';
import { useNavigationStore } from '../../store/useNavigationStore';
import { NavigationTable } from './NavigationTable';
import { CardView } from './CardView';
import { ViewConfigModal } from './ViewConfigModal';
import { LayoutList, LayoutGrid, Settings2, SlidersHorizontal } from 'lucide-react';
import { clsx } from 'clsx';

export const NavigationContainer: React.FC = () => {
    const { config, currentEnv, viewMode, setViewMode, isLoading } = useNavigationStore();
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    // Get current environment config
    const envConfig = config.envConfigs?.[currentEnv] || {};

    // Filter services based on visibility config
    const filteredServices = useMemo(() => {
        let services = config.services;
        if (envConfig.visibleServices && envConfig.visibleServices.length > 0) {
            services = services.filter(s => envConfig.visibleServices!.includes(s.id));
        }
        return services;
    }, [config.services, envConfig.visibleServices]);

    // Filter columns based on visibility config
    const visibleColumns = useMemo(() => {
        if (envConfig.visibleColumns && envConfig.visibleColumns.length > 0) {
            return envConfig.visibleColumns;
        }
        return config.columns.map(c => c.id);
    }, [config.columns, envConfig.visibleColumns]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!config.services.length) return null;

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-1">
                <div className="flex items-center gap-2">
                    {/* Placeholder for toolbar items if needed */}
                </div>

                <div className="flex items-center gap-2">
                    {/* View Config Button */}
                    <button
                        onClick={() => setIsConfigOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Configure View</span>
                    </button>

                    <div className="w-px h-4 bg-white/10 mx-1" />

                    {/* View Toggles */}
                    <div className="flex p-1 bg-slate-900/50 border border-white/5 rounded-lg backdrop-blur-sm">
                        <button
                            onClick={() => setViewMode('list')}
                            className={clsx(
                                "p-1.5 rounded-md transition-all",
                                viewMode === 'list'
                                    ? "bg-indigo-500 text-white shadow-sm"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                            title="List View"
                        >
                            <LayoutList className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('card')}
                            className={clsx(
                                "p-1.5 rounded-md transition-all",
                                viewMode === 'card'
                                    ? "bg-indigo-500 text-white shadow-sm"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                            title="Card View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {filteredServices.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                    <Settings2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-300">No services visible</h3>
                    <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                        There are no services configured for this view. Click "Configure View" to select services to display.
                    </p>
                    <button
                        onClick={() => setIsConfigOpen(true)}
                        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Configure Services
                    </button>
                </div>
            ) : (
                <>
                    {viewMode === 'list' ? (
                        <NavigationTable
                            services={filteredServices}
                            visibleColumns={visibleColumns}
                        />
                    ) : (
                        <CardView
                            services={filteredServices}
                            visibleColumns={visibleColumns}
                        />
                    )}
                </>
            )}

            {/* Modals */}
            {isConfigOpen && <ViewConfigModal onClose={() => setIsConfigOpen(false)} />}
        </div>
    );
};
