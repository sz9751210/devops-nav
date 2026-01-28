import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatrixStore } from '../../store/useMatrixStore';
import type { ServiceDefinition, ColumnDefinition, ServiceLink } from '../../types/schema';
import { ExternalLink, Terminal, Globe, FileText, Database, Star, Activity, Settings, Eye, Link2, Info, Copy, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface ServiceCardProps {
    service: ServiceDefinition;
    columns: ColumnDefinition[];
    currentEnv: string;
    viewMode: 'card' | 'table';
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, columns, currentEnv, viewMode }) => {
    const { t } = useTranslation();
    const { toggleFavoriteService, isFavoriteService, addRecentService } = useMatrixStore();
    const [isHovered, setIsHovered] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [copiedMeta, setCopiedMeta] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Mock Health Status
    const isHealthy = React.useMemo(() => {
        const hash = service.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return hash % 10 !== 0;
    }, [service.id]);

    const isFavorite = isFavoriteService(service.id);
    const initial = service.name.charAt(0).toUpperCase();

    // Helper to get links visible in current env
    const visibleLinks = (service.links || []).filter(link => {
        return !link.environments || link.environments.length === 0 || link.environments.includes(currentEnv);
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

    // Table View
    if (viewMode === 'table') {
        return (
            <div className="group flex items-center justify-between p-2 pl-3 bg-[var(--surface)] border border-[var(--border)] hover:border-amber-500/20 rounded transition-all">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={clsx("w-1.5 h-1.5 rounded-full shrink-0 shadow-sm", isHealthy ? "bg-emerald-500" : "bg-red-500")} />
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <div className="font-medium text-[var(--foreground)] text-sm truncate">{service.name}</div>
                            {isFavorite && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {visibleLinks.slice(0, 4).map(link => {
                        const col = columns.find(c => c.id === link.columnId);
                        const Icon = getIconComponent(col?.icon);
                        return (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-500 hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] rounded"
                                title={link.name}
                            >
                                <Icon className="w-3.5 h-3.5" />
                            </a>
                        )
                    })}
                    <button onClick={() => toggleFavoriteService(service.id)} className="p-1.5 text-slate-500 hover:text-amber-500 ml-2">
                        <Star className={clsx("w-3.5 h-3.5", isFavorite && "fill-amber-500 text-amber-500")} />
                    </button>
                </div>
            </div>
        );
    }

    // Card View
    return (
        <div
            className={clsx(
                "group relative bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 transition-all duration-200 hover:border-amber-500/30",
                isHovered && "shadow-lg shadow-black/20"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-[var(--surface-hover)] flex items-center justify-center border border-[var(--border)] text-slate-500 font-bold text-sm">
                        {initial}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-[var(--foreground)] text-sm truncate">{service.name}</h3>
                            <div className={clsx("w-1.5 h-1.5 rounded-full", isHealthy ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]" : "bg-red-500")} />
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[140px]" title={service.id}>
                            {service.id}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => toggleFavoriteService(service.id)}
                        className={clsx(
                            "p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors",
                            isFavorite ? "text-amber-500" : "text-slate-600 hover:text-amber-400"
                        )}
                    >
                        <Star className="w-3.5 h-3.5" fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                    {service.metadata && Object.keys(service.metadata).length > 0 && (
                        <div className="relative">
                            <button
                                onClick={() => setShowInfo(!showInfo)}
                                className={clsx("p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors", showInfo ? "text-[var(--foreground)] bg-[var(--surface-hover)]" : "text-slate-600 hover:text-slate-300")}
                            >
                                <Info className="w-3.5 h-3.5" />
                            </button>

                            {showInfo && (
                                <div className="absolute right-0 top-8 z-50 w-64 bg-[var(--background)] border border-[var(--border)] rounded shadow-xl p-2.5">
                                    <div className="space-y-2">
                                        {Object.entries(service.metadata).map(([key, value]) => (
                                            <div key={key} className="group/meta">
                                                <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">
                                                    <span>{key}</span>
                                                    <button onClick={() => handleCopyMeta(value, key)} className="text-slate-500 hover:text-[var(--foreground)] transition-colors">
                                                        {copiedMeta === key ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-mono bg-[var(--surface)] px-2 py-1 rounded border border-[var(--border)] break-all">
                                                    {value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {service.tags.map(tag => (
                        <span key={tag} className="px-1.5 py-[2px] text-[9px] font-mono rounded bg-[var(--surface-hover)] text-slate-500 border border-[var(--border)]">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Links Grid */}
            <div className="space-y-px bg-[var(--border)] border border-[var(--border)] rounded overflow-hidden">
                {visibleLinks.slice(0, 5).map(link => {
                    const col = columns.find(c => c.id === link.columnId);
                    const Icon = getIconComponent(col?.icon);
                    return (
                        <div key={link.id} className="flex items-center justify-between p-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors group/link">
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleLinkClick}
                                className="flex items-center gap-2 min-w-0"
                            >
                                <Icon className="w-3.5 h-3.5 text-slate-500 group-hover/link:text-amber-500 transition-colors" />
                                <span className="text-xs text-slate-500 group-hover/link:text-[var(--foreground)] truncate font-medium">{link.name}</span>
                            </a>
                            <button onClick={(e) => handleCopyLink(e, link)} className="text-slate-700 hover:text-slate-400 opacity-0 group-hover/link:opacity-100 transition-all">
                                {copiedId === link.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                        </div>
                    );
                })}
            </div>

            {visibleLinks.length > 5 && (
                <div className="text-[10px] text-center text-slate-600 mt-2 hover:text-slate-400 cursor-pointer italic font-mono">
                    + {visibleLinks.length - 5} {t('app.more_links', { count: visibleLinks.length - 5 })}
                </div>
            )}
        </div>
    );
};
