import React from 'react';
import { useNavigationStore } from '../../store/useMatrixStore';
import type { ServiceDefinition, ColumnDefinition, ServiceLink } from '../../types/schema';
import { ExternalLink, Terminal, Globe, Activity, FileText, Settings, Eye, Database, Link2 } from 'lucide-react';

interface CardViewProps {
    services: ServiceDefinition[];
    visibleColumns: string[];
}

// Icon mapping
const getIconComponent = (iconName?: string) => {
    const iconMap: Record<string, React.ElementType> = {
        'terminal': Terminal,
        'globe': Globe,
        'file': FileText,
        'database': Database,
        'activity': Activity,
        'settings': Settings,
        'eye': Eye,
        'link': Link2,
    };
    return iconMap[iconName || ''] || ExternalLink;
};

// Get visible links for current environment
const getVisibleLinks = (links: ServiceLink[] | undefined, env: string): ServiceLink[] => {
    if (!links) return [];
    return links.filter(link => {
        if (!link.environments || link.environments.length === 0) return true;
        return link.environments.includes(env);
    });
};

export const CardView: React.FC<CardViewProps> = ({ services, visibleColumns }) => {
    const { config, currentEnv } = useNavigationStore();

    // Helper to get columns for display
    const columns = config.columns.filter(c => visibleColumns.includes(c.id));

    // Get links for a service, grouped by column
    const getLinksForColumn = (service: ServiceDefinition, column: ColumnDefinition): ServiceLink[] => {
        const visibleLinks = getVisibleLinks(service.links, currentEnv);
        return visibleLinks.filter(link => link.columnId === column.id);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {services.map(service => {
                // Get all visible links for this service
                const allVisibleLinks = getVisibleLinks(service.links, currentEnv);

                return (
                    <div
                        key={service.id}
                        className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-sm hover:bg-slate-800/40 hover:border-white/10 hover:shadow-xl hover:shadow-amber-500/5 transition-all group animate-in fade-in duration-300"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:text-amber-300 group-hover:bg-amber-500/20 transition-colors">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-amber-200 transition-colors">
                                        {service.name}
                                    </h3>
                                </div>
                                {service.description && (
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{service.description}</p>
                                )}
                            </div>
                        </div>

                        {/* Links by Column */}
                        <div className="space-y-2">
                            {columns.map(column => {
                                const linksForColumn = getLinksForColumn(service, column);
                                if (linksForColumn.length === 0) return null;

                                const Icon = getIconComponent(column.icon);

                                return (
                                    <div key={column.id} className="space-y-1">
                                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                                            <Icon className="w-3 h-3" />
                                            <span>{column.title}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {linksForColumn.map(link => (
                                                <a
                                                    key={link.id}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-all font-medium text-xs"
                                                >
                                                    {link.name}
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Show uncategorized links (links with no matching column) */}
                            {allVisibleLinks.filter(l => !columns.some(c => c.id === l.columnId)).length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {allVisibleLinks.filter(l => !columns.some(c => c.id === l.columnId)).map(link => (
                                        <a
                                            key={link.id}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 text-slate-400 hover:bg-amber-500/20 hover:text-amber-300 transition-all text-xs"
                                        >
                                            {link.name}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ))}
                                </div>
                            )}

                            {allVisibleLinks.length === 0 && (
                                <p className="text-xs text-slate-500 italic">無可用連結</p>
                            )}
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
                    </div>
                );
            })}
        </div>
    );
};
