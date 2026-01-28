import React from 'react';
import { useMatrixStore } from '../../store/useMatrixStore';
import type { ServiceDefinition, ColumnDefinition, ServiceLink } from '../../types/schema';
import { ExternalLink, Terminal, Globe, FileText, Database, Box, Star, Activity, Settings, Eye, Link2, Copy, Check, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';

interface ServiceCardProps {
    service: ServiceDefinition;
    columns: ColumnDefinition[];
    currentEnv: string;
    viewMode: 'card' | 'table';
}

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

const getServiceColor = (id: string) => {
    const colors = [
        { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/20' },
        { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/20' },
        { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20' },
        { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/20' },
        { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/20' },
        { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/20' },
    ];
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
};

const QUICK_ACTION_ICONS = ['activity', 'file', 'terminal', 'settings'];

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
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const color = getServiceColor(service.id);
    const isFavorite = isFavoriteService(service.id);
    const initial = service.name.charAt(0).toUpperCase();

    const visibleLinks = getVisibleLinks(service.links, currentEnv);
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

    const handleCopy = (e: React.MouseEvent, link: ServiceLink) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(link.url);
        setCopiedId(link.id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    // Card View - Compact
    if (viewMode === 'card') {
        return (
            <div className={clsx(
                "group relative p-3 rounded-lg border bg-slate-900/50 transition-all duration-150",
                "hover:bg-slate-800/60 hover:border-white/10",
                isFavorite ? "border-amber-500/30" : "border-white/5"
            )}>
                {/* Favorite */}
                <button
                    onClick={() => toggleFavoriteService(service.id)}
                    className={clsx(
                        "absolute top-2 right-2 p-1 rounded transition-all",
                        isFavorite
                            ? "text-amber-400"
                            : "text-slate-700 hover:text-amber-400 opacity-0 group-hover:opacity-100"
                    )}
                >
                    <Star className="w-3.5 h-3.5" fill={isFavorite ? "currentColor" : "none"} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                    <div className={clsx(
                        "w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm shrink-0",
                        color.bg, color.text, color.border, "border"
                    )}>
                        {initial}
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                        <h3 className="font-medium text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                            {service.name}
                        </h3>
                        {service.group && (
                            <span className="text-[10px] text-slate-600">{service.group}</span>
                        )}
                    </div>
                </div>

                {/* Quick Actions - Horizontal */}
                {quickActions.length > 0 && (
                    <div className="flex gap-1 mb-2">
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
                                    className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/15 transition-colors"
                                    title={link.name}
                                >
                                    <Icon className="w-3 h-3" />
                                    <span className="truncate hidden sm:inline">{link.name}</span>
                                </a>
                            );
                        })}
                    </div>
                )}

                {/* Other Links - Compact List */}
                {otherLinks.length > 0 && (
                    <div className="space-y-0.5">
                        {otherLinks.slice(0, 4).map(link => {
                            const col = columns.find(c => c.id === link.columnId);
                            const Icon = getIconComponent(col?.icon);
                            const isCopied = copiedId === link.id;
                            return (
                                <div key={link.id} className="group/link flex items-center gap-1.5 py-0.5">
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={handleLinkClick}
                                        className="flex-1 flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-amber-300 transition-colors truncate"
                                        title={link.name}
                                    >
                                        <Icon className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{link.name}</span>
                                    </a>
                                    <button
                                        onClick={(e) => handleCopy(e, link)}
                                        className="p-0.5 text-slate-700 hover:text-amber-400 opacity-0 group-hover/link:opacity-100 transition-all"
                                        title="複製"
                                    >
                                        {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                </div>
                            );
                        })}
                        {otherLinks.length > 4 && (
                            <span className="text-[10px] text-slate-600 pl-4">+{otherLinks.length - 4} more</span>
                        )}
                    </div>
                )}

                {visibleLinks.length === 0 && (
                    <p className="text-[10px] text-slate-600 italic">無連結</p>
                )}
            </div>
        );
    }

    // Table/List View
    return (
        <div className={clsx(
            "group flex items-center gap-3 px-3 py-2 rounded-md border bg-slate-900/40 transition-all",
            "hover:bg-slate-800/40 hover:border-white/10",
            isFavorite ? "border-amber-500/30" : "border-white/5"
        )}>
            <button
                onClick={() => toggleFavoriteService(service.id)}
                className={clsx(
                    "p-0.5 rounded transition-all shrink-0",
                    isFavorite ? "text-amber-400" : "text-slate-700 hover:text-amber-400 opacity-0 group-hover:opacity-100"
                )}
            >
                <Star className="w-3.5 h-3.5" fill={isFavorite ? "currentColor" : "none"} />
            </button>

            <div className={clsx(
                "w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0",
                color.bg, color.text
            )}>
                {initial}
            </div>

            <div className="w-32 shrink-0">
                <h3 className="font-medium text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                    {service.name}
                </h3>
            </div>

            {service.group && (
                <span className="text-[10px] text-slate-600 bg-white/5 px-1.5 py-0.5 rounded shrink-0">
                    {service.group}
                </span>
            )}

            <div className="flex-1" />

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
                            className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
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
                            className="p-1.5 rounded-md bg-white/5 text-slate-500 hover:bg-amber-500/20 hover:text-amber-400 transition-colors"
                            title={link.name}
                        >
                            <Icon className="w-3.5 h-3.5" />
                        </a>
                    );
                })}
                {otherLinks.length > 3 && (
                    <span className="text-[10px] text-slate-600 px-1">+{otherLinks.length - 3}</span>
                )}
            </div>

            <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-slate-500 shrink-0" />
        </div>
    );
};
