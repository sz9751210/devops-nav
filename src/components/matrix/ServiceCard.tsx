import React, { useState } from 'react';
import { useMatrixStore } from '../../store/useMatrixStore';
import type { ServiceDefinition, ColumnDefinition, ServiceLink } from '../../types/schema';
import { ExternalLink, Terminal, Globe, FileText, Database, Star, Activity, Settings, Eye, Link2, Info, Copy, Check, Tag } from 'lucide-react';
import { clsx } from 'clsx';

interface ServiceCardProps {
    service: ServiceDefinition;
    columns: ColumnDefinition[];
    currentEnv: string;
    viewMode: 'card' | 'table';
}

const QUICK_ACTION_ICONS = ['terminal', 'globe', 'database'];

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, columns, currentEnv, viewMode }) => {
    const { toggleFavoriteService, isFavoriteService, addRecentService } = useMatrixStore();
    const [isHovered, setIsHovered] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [copiedMeta, setCopiedMeta] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Mock Health Status
    const isHealthy = React.useMemo(() => {
        // Deterministic hash for demo, or just random
        const hash = service.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return hash % 10 !== 0; // 90% healthy
    }, [service.id]);

    const isFavorite = isFavoriteService(service.id);
    const initial = service.name.charAt(0).toUpperCase();

    // Helper to get links visible in current env
    const visibleLinks = (service.links || []).filter(link => {
        return !link.environments || link.environments.length === 0 || link.environments.includes(currentEnv);
    });

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

    const handleCopyMeta = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedMeta(key);
        setTimeout(() => setCopiedMeta(null), 2000);
    };

    const handleCopyLink = (e: React.MouseEvent, link: ServiceLink) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(link.url);
        setCopiedId(link.id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const getIconComponent = (iconName?: string) => {
        const map: Record<string, React.ElementType> = {
            'terminal': Terminal, 'globe': Globe, 'file': FileText,
            'database': Database, 'activity': Activity, 'settings': Settings,
            'eye': Eye, 'link': Link2,
        };
        return map[iconName || ''] || ExternalLink;
    };

    // Color logic
    const getServiceColor = (id: string) => {
        const colors = [
            { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
            { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
            { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/20' },
            { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
            { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' },
            { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20' },
        ];
        const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[index % colors.length];
    };
    const color = getServiceColor(service.id);

    if (viewMode === 'table') {
        return (
            <div className="flex items-center justify-between p-3 bg-slate-900/40 border border-white/5 rounded-lg hover:border-amber-500/30 transition-all group">
                <div className="flex items-center gap-3">
                    <div className={clsx("w-2 h-2 rounded-full", isHealthy ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-500")} title={isHealthy ? "Healthy" : "Issues Detected"} />
                    <div className="font-medium text-slate-200">{service.name}</div>
                    {service.tags?.map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 text-[10px] bg-slate-800 rounded text-slate-400 border border-white/5">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {visibleLinks.slice(0, 3).map(link => {
                        const col = columns.find(c => c.id === link.columnId);
                        const Icon = getIconComponent(col?.icon);
                        return (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded"
                                title={link.name}
                            >
                                <Icon className="w-3.5 h-3.5" />
                            </a>
                        )
                    })}
                </div>
            </div>
        );
    }

    return (
        <div
            className={clsx(
                "group relative bg-slate-900/40 border border-white/5 rounded-xl p-4 hover:border-amber-500/30 hover:bg-slate-900/60 transition-all duration-300",
                isHovered && "scale-[1.01] shadow-xl shadow-black/50"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={clsx(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shadow-lg transition-transform duration-300 group-hover:scale-110",
                        color.bg, color.text, color.border, "border"
                    )}>
                        {initial}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-100 tracking-wide text-sm truncate">{service.name}</h3>
                            <div className={clsx("w-1.5 h-1.5 shrink-0 rounded-full animate-pulse", isHealthy ? "bg-green-500" : "bg-red-500")} title={isHealthy ? "System Healthy" : "Issues Detected"} />
                        </div>
                        {service.description && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{service.description}</p>
                        )}
                    </div>
                </div>

                {/* Metadata Info Toggle */}
                <div className="relative flex items-center gap-1">
                    <button
                        onClick={() => toggleFavoriteService(service.id)}
                        className={clsx(
                            "p-1.5 rounded-md transition-all",
                            isFavorite ? "text-amber-400" : "text-slate-700 hover:text-amber-400"
                        )}
                    >
                        <Star className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
                    </button>

                    {service.metadata && Object.keys(service.metadata).length > 0 && (
                        <button
                            onClick={() => setShowInfo(!showInfo)}
                            className={clsx("p-1.5 rounded-md transition-colors", showInfo ? "bg-amber-500/20 text-amber-400" : "text-slate-600 hover:text-slate-300 hover:bg-white/5")}
                            title="Service Info"
                        >
                            <Info className="w-4 h-4" />
                        </button>
                    )}

                    {/* Popover */}
                    {showInfo && service.metadata && (
                        <div className="absolute right-0 top-9 z-50 w-64 bg-slate-950 border border-white/10 rounded-lg shadow-2xl p-3 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                            <h4 className="text-xs font-semibold text-slate-400 mb-2 border-b border-white/5 pb-1 flex items-center justify-between">
                                Metadata
                                <span className="text-[10px] bg-slate-800 px-1 rounded text-slate-500">ReadOnly</span>
                            </h4>
                            <div className="space-y-2">
                                {Object.entries(service.metadata).map(([key, value]) => (
                                    <div key={key} className="group/meta">
                                        <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">
                                            <span>{key}</span>
                                            <button
                                                onClick={() => handleCopyMeta(value, key)}
                                                className="opacity-0 group-hover/meta:opacity-100 transition-opacity text-amber-500 hover:text-amber-400"
                                            >
                                                {copiedMeta === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        </div>
                                        <div className="text-xs text-slate-300 font-mono bg-black/40 p-1.5 rounded border border-white/5 break-all select-all">
                                            {value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {service.tags.map(tag => (
                        <div key={tag} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/5 text-amber-500 border border-amber-500/10">
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Actions (Primary Links) */}
            {quickActions.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-2">
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
                                className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/15 transition-colors"
                            >
                                <Icon className="w-3 h-3" />
                                <span className="truncate">{link.name}</span>
                            </a>
                        );
                    })}
                </div>
            )}

            {/* Secondary Links List */}
            {otherLinks.length > 0 && (
                <div className="space-y-0.5 pt-1 border-t border-white/5 mt-2">
                    {otherLinks.slice(0, 3).map(link => {
                        const col = columns.find(c => c.id === link.columnId);
                        const Icon = getIconComponent(col?.icon);
                        const isCopied = copiedId === link.id;
                        return (
                            <div key={link.id} className="group/link flex items-center justify-between py-1 px-1 rounded hover:bg-white/5 transition-colors">
                                <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={handleLinkClick}
                                    className="flex items-center gap-2 min-w-0"
                                >
                                    <Icon className="w-3 h-3 text-slate-500 group-hover/link:text-slate-300" />
                                    <span className="text-xs text-slate-400 group-hover/link:text-slate-200 truncate">{link.name}</span>
                                </a>
                                <button
                                    onClick={(e) => handleCopyLink(e, link)}
                                    className={clsx(
                                        "p-1 rounded opacity-0 group-hover/link:opacity-100 transition-all",
                                        isCopied ? "text-green-400" : "text-slate-600 hover:text-white"
                                    )}
                                >
                                    {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </button>
                            </div>
                        )
                    })}
                    {otherLinks.length > 3 && (
                        <div className="text-[10px] text-slate-600 text-center pt-1 italic">
                            + {otherLinks.length - 3} more links
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
