import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigationStore } from '../../store/useMatrixStore';
import type { ServiceDefinition, ColumnDefinition, ServiceLink } from '../../types/schema';
import { ExternalLink, Terminal, Globe, FileText, Database, Star, Activity, Settings, Eye, Link2, Info, Copy, Check, Hammer, Hash, User, MessageCircle, MoreVertical, CopyCheck, TerminalSquare } from 'lucide-react';
import { clsx } from 'clsx';

export interface ServiceCardProps {
    service: ServiceDefinition;
    columns: ColumnDefinition[];
    currentEnv: string;
    viewMode: 'card' | 'table';
    overrideLinks?: ServiceLink[];
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, columns, currentEnv, viewMode, overrideLinks }) => {
    const { t } = useTranslation();
    const { toggleFavoriteService, isFavoriteService, addRecentService, trackLinkUsage } = useNavigationStore();
    const [isHovered, setIsHovered] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [showBulk, setShowBulk] = useState(false);
    const [copiedMeta, setCopiedMeta] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [copiedAll, setCopiedAll] = useState(false);

    // Use real status or fallback to mock
    const healthStatus = service.status || 'unknown';
    const isMaintenance = service.maintenanceMode;

    const isFavorite = isFavoriteService(service.id);
    const initial = service.name.charAt(0).toUpperCase();

    const version = service.versions?.[currentEnv];

    // Helper to get links visible in current env
    // Use overrideLinks if provided, otherwise default to service.links
    const visibleLinks = (overrideLinks || service.links || []).filter(link => {
        return !link.environments || link.environments.length === 0 || link.environments.includes(currentEnv);
    });

    const handleLinkClick = (link: ServiceLink) => {
        addRecentService(service.id);
        trackLinkUsage(service.id, link.columnId);
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

    const handleOpenAll = () => {
        visibleLinks.forEach(link => window.open(link.url, '_blank'));
        setShowBulk(false);
    };

    const handleCopyAll = () => {
        const text = visibleLinks.map(l => `${l.name}: ${l.url}`).join('\n');
        navigator.clipboard.writeText(text);
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
        setShowBulk(false);
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
                    <div className={clsx(
                        "w-2 h-2 rounded-full shrink-0 shadow-sm",
                        isMaintenance ? "bg-amber-500 animate-pulse" :
                            healthStatus === 'healthy' ? "bg-emerald-500" :
                                healthStatus === 'error' ? "bg-red-500" :
                                    healthStatus === 'warning' ? "bg-amber-500" : "bg-[var(--foreground-muted)] opacity-30"
                    )} />
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="font-medium text-[var(--foreground)] text-sm uppercase tracking-tighter break-words">{service.name}</div>
                            {isMaintenance && <Hammer className="w-3 h-3 text-amber-500" />}
                            {version && <span className="text-xs px-1 bg-[var(--surface-hover)] border border-[var(--border)] rounded text-[var(--foreground-muted)] font-mono">{version}</span>}
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
                                className="p-1.5 text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] rounded"
                                title={link.name}
                            >
                                <Icon className="w-3.5 h-3.5" />
                            </a>
                        )
                    })}
                    <button onClick={() => toggleFavoriteService(service.id)} className="p-1.5 text-[var(--foreground-muted)] hover:text-amber-500 ml-2">
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
                    <div className="w-9 h-9 rounded bg-[var(--surface-hover)] flex items-center justify-center border border-[var(--border)] text-[var(--foreground-muted)] font-bold text-sm">
                        {initial}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-[var(--foreground)] text-base uppercase tracking-tight break-words pr-2">{service.name}</h3>
                            <div className={clsx(
                                "w-1.5 h-1.5 rounded-full shrink-0",
                                isMaintenance ? "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                                    healthStatus === 'warning' ? "bg-amber-500" : "bg-[var(--foreground-muted)] opacity-30"
                            )} />
                        </div>
                        <div className="text-xs text-[var(--foreground-muted)] font-mono mt-0.5 break-all opacity-70" title={service.id}>
                            {service.id}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => toggleFavoriteService(service.id)}
                        className={clsx(
                            "p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors",
                            isFavorite ? "text-amber-500" : "text-[var(--foreground-muted)] hover:text-amber-400"
                        )}
                    >
                        <Star className="w-3.5 h-3.5" fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                    {service.metadata && Object.keys(service.metadata).length > 0 && (
                        <div className="relative">
                            <button
                                onClick={() => setShowInfo(!showInfo)}
                                className={clsx("p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors", showInfo ? "text-[var(--foreground)] bg-[var(--surface-hover)]" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]")}
                            >
                                <Info className="w-3.5 h-3.5" />
                            </button>

                            {showInfo && (
                                <div className="absolute right-0 top-8 z-50 w-72 bg-[var(--background)] border border-[var(--border)] rounded shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-100">
                                    <div className="space-y-3">
                                        {/* Version & Owner Info */}
                                        <div className="grid grid-cols-2 gap-2 mb-2 pb-2 border-b border-[var(--border)]">
                                            <div className="bg-[var(--surface-hover)] p-1.5 rounded border border-[var(--border)]">
                                                <div className="flex items-center gap-1 text-xs text-[var(--foreground-muted)] uppercase mb-1">
                                                    <Hash className="w-2.5 h-2.5" /> Version
                                                </div>
                                                <div className="text-sm font-mono text-[var(--foreground)]">{version || 'N/A'}</div>
                                            </div>
                                            <div className="bg-[var(--surface-hover)] p-1.5 rounded border border-[var(--border)]">
                                                <div className="flex items-center gap-1 text-xs text-[var(--foreground-muted)] opacity-50 uppercase mb-1">
                                                    <User className="w-2.5 h-2.5" /> Owner
                                                </div>
                                                <div className="text-sm text-amber-500 font-medium truncate flex items-center gap-1">
                                                    {service.metadata?.owner || 'Unassigned'}
                                                    {service.metadata?.slack && (
                                                        <a href={`slack://channel?id=${service.metadata.slack}`} className="hover:text-amber-400">
                                                            <MessageCircle className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {Object.entries(service.metadata || {}).filter(([key]) => key !== 'owner' && key !== 'slack').map(([key, value]) => (
                                            <div key={key} className="group/meta">
                                                <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)] uppercase tracking-wider mb-0.5">
                                                    <span>{key}</span>
                                                    <button onClick={() => handleCopyMeta(value, key)} className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                                                        {copiedMeta === key ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                                <div className="text-sm text-[var(--foreground)] font-mono bg-[var(--surface)] px-2 py-1 rounded border border-[var(--border)] break-all">
                                                    {value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="relative">
                        <button
                            onClick={() => setShowBulk(!showBulk)}
                            className={clsx("p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors", showBulk ? "text-[var(--foreground)] bg-[var(--surface-hover)]" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]")}
                        >
                            <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {showBulk && (
                            <div className="absolute right-0 top-8 z-50 w-48 bg-[var(--background)] border border-[var(--border)] rounded shadow-2xl p-1 animate-in slide-in-from-top-1 duration-100">
                                <button
                                    onClick={handleOpenAll}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] rounded transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-[var(--foreground-muted)] opacity-50" />
                                    Open All Links
                                </button>
                                <button
                                    onClick={handleCopyAll}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] rounded transition-colors"
                                >
                                    <CopyCheck className="w-3.5 h-3.5 text-[var(--foreground-muted)] opacity-50" />
                                    {copiedAll ? <span className="text-emerald-500">Copied!</span> : "Copy All Links"}
                                </button>
                                {service.metadata?.kubectl && (
                                    <button
                                        onClick={() => handleCopyMeta(service.metadata!.kubectl, 'kubectl')}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] rounded transition-colors border-t border-[var(--border)] mt-1 pt-2"
                                    >
                                        <TerminalSquare className="w-3.5 h-3.5 text-amber-500/70" />
                                        Copy `kubectl` Command
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tags */}
            {
                service.tags && service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {service.tags.map(tag => (
                            <span key={tag} className="px-1.5 py-[2px] text-xs font-mono rounded bg-[var(--surface-hover)] text-[var(--foreground-muted)] border border-[var(--border)]">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )
            }

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
                                onClick={() => handleLinkClick(link)}
                                className="flex items-center gap-2 min-w-0"
                            >
                                <Icon className="w-3.5 h-3.5 text-[var(--foreground-muted)] group-hover/link:text-amber-500 transition-colors" />
                                <span className="text-sm text-[var(--foreground-muted)] group-hover/link:text-[var(--foreground)] truncate font-medium">{link.name}</span>
                            </a>
                            <button onClick={(e) => handleCopyLink(e, link)} className="text-[var(--foreground-muted)] opacity-0 group-hover/link:opacity-50 hover:opacity-100 transition-all">
                                {copiedId === link.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                        </div>
                    );
                })}
            </div>

            {
                visibleLinks.length > 5 && (
                    <div className="text-sm text-center text-[var(--foreground-muted)] opacity-50 mt-2 hover:opacity-100 cursor-pointer italic font-mono">
                        + {visibleLinks.length - 5} {t('app.more_links', { count: visibleLinks.length - 5 })}
                    </div>
                )
            }
        </div >
    );
};
