import React from 'react';
import { useMatrixStore } from '../../store/useMatrixStore';
import type { ServiceDefinition, ColumnDefinition } from '../../types/schema';
import { ExternalLink, Terminal, Globe } from 'lucide-react';

interface CardViewProps {
    services: ServiceDefinition[];
    visibleColumns: string[];
}

export const CardView: React.FC<CardViewProps> = ({ services, visibleColumns }) => {
    const { config, currentEnv } = useMatrixStore();

    // Helper to get columns for display
    const columns = config.columns.filter(c => visibleColumns.includes(c.id));

    // Helper to resolve URL (similar to ServiceCell)
    const getUrl = (service: ServiceDefinition, column: ColumnDefinition) => {
        // 1. Check override
        if (service.overrides && service.overrides[column.id]) {
            return service.overrides[column.id];
        }

        // 2. Use template
        if (column.template) {
            let url = column.template
                .replace('{{service_id}}', service.id)
                .replace('{{env}}', currentEnv);

            // Apply extra variables
            if (service.variables) {
                Object.entries(service.variables).forEach(([key, val]) => {
                    url = url.replace(`{{${key}}}`, val);
                });
            }
            return url;
        }

        return '#';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {services.map(service => (
                <div
                    key={service.id}
                    className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-sm hover:bg-slate-800/40 hover:border-white/10 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group animate-in fade-in duration-300"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:text-indigo-300 group-hover:bg-indigo-500/20 transition-colors">
                                    <Globe className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-indigo-200 transition-colors">
                                    {service.name}
                                </h3>
                            </div>
                            {service.description && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{service.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Links Grid */}
                    < div className="space-y-2" >
                        {
                            columns.map(column => {
                                const url = getUrl(service, column);
                                const isLink = column.type === 'link';

                                return (
                                    <div key={column.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group/item">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            {/* TODO: Add icon support based on column definition */}
                                            <Terminal className="w-3.5 h-3.5 opacity-50" />
                                            <span className="font-medium">{column.title}</span>
                                        </div>

                                        {isLink ? (
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all font-medium text-xs"
                                            >
                                                View
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ) : (
                                            <span className="text-slate-300 font-mono text-xs truncate max-w-[150px]">
                                                {url}
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        }
                    </div>

                    {/* Footer / Meta */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                        <span className="font-mono opacity-50">{service.id}</span>
                        {service.group && (
                            <span className="px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                                {service.group}
                            </span>
                        )}
                    </div>
                </div >
            ))}
        </div >
    );
};
