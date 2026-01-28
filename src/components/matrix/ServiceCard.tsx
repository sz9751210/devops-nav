import React from 'react';
import { useMatrixStore } from '../../store/useMatrixStore';
import type { ServiceDefinition, ColumnDefinition, ServiceLink } from '../../types/schema';
import { ExternalLink, Terminal, Globe, FileText, Database, Box, Star, Activity, Settings, Eye, Link2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ServiceCardProps {
    service: ServiceDefinition;
    columns: ColumnDefinition[];
    currentEnv: string;
    viewMode: 'card' | 'table';
}

// Icon mapping based on column icon field
const getIconComponent = (iconName?: string) => {
    const iconMap: Record<string, React.ElementType> = {
        'terminal': Terminal,
        'globe': Globe,
        'file': FileText,
        'database': Database,
        'box': Box,
        'activity': Activity,
        'settings': Settings,
        'eye': Eye,
        'link': Link2,
    };
    return iconMap[iconName || ''] || ExternalLink;
};

// Generate a consistent color based on service id
const getServiceColor = (id: string) => {
    const colors = [
        { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
        { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
        { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
        { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
        { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
        { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
        { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
        { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
    ];
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
};

// Quick action column icons (show prominently)
const QUICK_ACTION_ICONS = ['activity', 'file', 'terminal', 'settings'];

// Get visible links for current environment
const getVisibleLinks = (links: ServiceLink[] | undefined, env: string): ServiceLink[] => {
    if (!links) return [];
    return links.filter(link => {
        if (!link.environments || link.environments.length === 0) return true;
        return link.environments.includes(env);
    });
};

export const ServiceCard: React.FC<ServiceCardProps> = ({
    service,
    columns,
    currentEnv,
    viewMode
}) => {
    const { toggleFavoriteService, isFavoriteService, addRecentService } = useMatrixStore();
    const color = getServiceColor(service.id);
    const isFavorite = isFavoriteService(service.id);
    const initial = service.name.charAt(0).toUpperCase();

    // Get visible links for current env
    const visibleLinks = getVisibleLinks(service.links, currentEnv);

    // Separate quick actions from other links based on column icon
    const quickActions = visibleLinks.filter(link => {
        const col = columns.find(c => c.id === link.columnId);
        return col && QUICK_ACTION_ICONS.includes(col.icon || '');
    });
    const otherLinks = visibleLinks.filter(link => {
        const col = columns.find(c => c.id === link.columnId);
        return !col || !QUICK_ACTION_ICONS.includes(col.icon || '');
    });

    const handleLinkClick = () => {
        addRecentService(service.id);
    };

    // Card View
    if (viewMode === 'card') {
        return (
            <div className={clsx(
                "group relative p-4 rounded-xl border bg-slate-900/60 backdrop-blur-sm transition-all duration-200",
                "hover:bg-slate-800/60 hover:border-white/10 hover:shadow-lg hover:shadow-black/20",
                isFavorite ? "border-amber-500/30" : "border-white/5"
            )}>
                {/* Favorite Star */}
                <button
                    onClick={() => toggleFavoriteService(service.id)}
                    className={clsx(
                        "absolute top-2 right-2 p-1.5 rounded-lg transition-all",
                        isFavorite
                            ? "text-amber-400 bg-amber-500/10"
                            : "text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 opacity-0 group-hover:opacity-100"
                    )}
                >
                    <Star className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
                </button>

                {/* Header */}
                <div className="flex items-start gap-3 mb-3 pr-8">
                    <div className={clsx(
                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shrink-0",
                        color.bg, color.text, color.border, "border"
                    )}>
                        {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate group-hover:text-amber-300 transition-colors">
                            {service.name}
                        </h3>
                        {service.group && (
                            <span className="text-xs text-slate-500">{service.group}</span>
                        )}
                    </div>
                </div>

                {/* Description */}
                {service.description && (
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                        {service.description}
                    </p>
                )}

                {/* Quick Actions */}
                {quickActions.length > 0 && (
                    <div className="flex gap-1 mb-3">
                        {quickActions.slice(0, 4).map(link => {
                            const col = columns.find(c => c.id === link.columnId);
                            const Icon = getIconComponent(col?.icon);
                            return (
                                <a
                                    key={link.id}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={handleLinkClick}
                                    className={clsx(
                                        "flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all",
                                        "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40"
                                    )}
                                    title={link.name}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span className="truncate">{link.name}</span>
                                </a>
                            );
                        })}
                    </div>
                )}

                {/* Other Links */}
                <div className="flex flex-wrap gap-1.5">
                    {otherLinks.slice(0, 6).map(link => {
                        const col = columns.find(c => c.id === link.columnId);
                        const Icon = getIconComponent(col?.icon);
                        return (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleLinkClick}
                                className={clsx(
                                    "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all",
                                    "bg-white/5 text-slate-400 hover:bg-amber-500/20 hover:text-amber-400",
                                    "border border-transparent hover:border-amber-500/30"
                                )}
                                title={link.name}
                            >
                                <Icon className="w-3 h-3" />
                                <span className="truncate max-w-[60px]">{link.name}</span>
                            </a>
                        );
                    })}
                    {otherLinks.length > 6 && (
                        <span className="text-xs text-slate-500 px-2 py-1">
                            +{otherLinks.length - 6}
                        </span>
                    )}
                </div>

                {/* Empty state */}
                {visibleLinks.length === 0 && (
                    <p className="text-xs text-slate-500 italic">無可用連結</p>
                )}
            </div>
        );
    }

    // Table/List View
    return (
        <div className={clsx(
            "group flex items-center gap-4 p-3 rounded-lg border bg-slate-900/40 transition-all",
            "hover:bg-slate-800/40 hover:border-white/10",
            isFavorite ? "border-amber-500/30" : "border-white/5"
        )}>
            {/* Favorite Star */}
            <button
                onClick={() => toggleFavoriteService(service.id)}
                className={clsx(
                    "p-1 rounded transition-all shrink-0",
                    isFavorite
                        ? "text-amber-400"
                        : "text-slate-600 hover:text-amber-400 opacity-0 group-hover:opacity-100"
                )}
            >
                <Star className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
            </button>

            {/* Icon */}
            <div className={clsx(
                "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0",
                color.bg, color.text, color.border, "border"
            )}>
                {initial}
            </div>

            {/* Name & Description */}
            <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white text-sm truncate group-hover:text-amber-300 transition-colors">
                    {service.name}
                </h3>
                {service.description && (
                    <p className="text-xs text-slate-500 truncate">
                        {service.description}
                    </p>
                )}
            </div>

            {/* Group Badge */}
            {service.group && (
                <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded shrink-0">
                    {service.group}
                </span>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-1 shrink-0">
                {quickActions.slice(0, 4).map(link => {
                    const col = columns.find(c => c.id === link.columnId);
                    const Icon = getIconComponent(col?.icon);
                    return (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleLinkClick}
                            className={clsx(
                                "p-1.5 rounded-md transition-all",
                                "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                            )}
                            title={link.name}
                        >
                            <Icon className="w-3.5 h-3.5" />
                        </a>
                    );
                })}
            </div>

            {/* Other Links */}
            <div className="flex items-center gap-1 shrink-0">
                {otherLinks.slice(0, 3).map(link => {
                    const col = columns.find(c => c.id === link.columnId);
                    const Icon = getIconComponent(col?.icon);
                    return (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleLinkClick}
                            className={clsx(
                                "p-1.5 rounded-md transition-all",
                                "bg-white/5 text-slate-400 hover:bg-amber-500/20 hover:text-amber-400"
                            )}
                            title={link.name}
                        >
                            <Icon className="w-3.5 h-3.5" />
                        </a>
                    );
                })}
            </div>
        </div>
    );
};
