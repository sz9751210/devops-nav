import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigationStore } from '../../store/useMatrixStore';
import type { ServiceDefinition, ServiceLink } from '../../types/schema';
import {
    ArrowLeft, ExternalLink, Terminal, Globe, FileText, Database,
    Activity, Settings, Eye, Link2, Server,
    Copy, Check, Hammer, ChevronRight, ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';

interface ServiceDetailProps {
    service: ServiceDefinition;
    onBack: () => void;
}

export const ServiceDetail: React.FC<ServiceDetailProps> = ({ service, onBack }) => {
    const { t } = useTranslation();
    const { config } = useNavigationStore();
    const [copiedValue, setCopiedValue] = useState<string | null>(null);

    const initial = service.name.charAt(0).toUpperCase();

    // State for expanded links
    const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set());

    const toggleLinkExpanded = (linkId: string) => {
        setExpandedLinks(prev => {
            const next = new Set(prev);
            if (next.has(linkId)) {
                next.delete(linkId);
            } else {
                next.add(linkId);
            }
            return next;
        });
    };

    // Group links by environment
    const linksByEnv = useMemo(() => {
        const grouped: Record<string, ServiceLink[]> = {};

        // Initialize with 'All Environments' or similar if needed, 
        // or just rely on what links specify.
        // A link might belong to specific envs, or all if empty.

        const allEnvs = ['common', ...config.environments];

        allEnvs.forEach(env => {
            grouped[env] = [];
        });

        service.links?.forEach(link => {
            if (!link.environments || link.environments.length === 0) {
                grouped['common'].push(link);
            } else {
                link.environments.forEach(env => {
                    if (!grouped[env]) grouped[env] = [];
                    grouped[env].push(link);
                });
            }
        });

        return grouped;
    }, [service.links, config.environments]);

    const getIconComponent = (iconName?: string) => {
        const map: Record<string, React.ElementType> = {
            'terminal': Terminal, 'globe': Globe, 'file': FileText,
            'database': Database, 'activity': Activity, 'settings': Settings,
            'eye': Eye, 'link': Link2,
        };
        return map[iconName || ''] || ExternalLink;
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedValue(id);
        setTimeout(() => setCopiedValue(null), 2000);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header / Navigation */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-[var(--surface-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors border border-transparent hover:border-[var(--border)]"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <div className="text-xs font-mono text-[var(--foreground-muted)] uppercase tracking-wider mb-0.5">
                        {t('service_page.detail_view')}
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
                        {service.name}
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Metadata & Info */}
                <div className="space-y-6">
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-0 overflow-hidden">
                        <div className="p-6 flex flex-col items-center border-b border-[var(--border)] bg-[var(--surface-hover)]/30">
                            <div className="w-20 h-20 rounded-2xl bg-[var(--surface)] flex items-center justify-center border border-[var(--border)] text-[var(--foreground-muted)] font-bold text-4xl mb-4 shadow-sm">
                                {initial}
                            </div>
                            <h2 className="text-xl font-bold text-[var(--foreground)]">{service.name}</h2>
                            <div className="text-sm font-mono text-[var(--foreground-muted)] opacity-70 mt-1">{service.id}</div>

                            {service.maintenanceMode && (
                                <div className="mt-4 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-xs font-bold flex items-center gap-1.5">
                                    <Hammer className="w-3.5 h-3.5" />
                                    {t('service_page.maintenance_mode')}
                                </div>
                            )}
                        </div>

                        <div className="p-4 space-y-4">
                            {service.description && (
                                <div>
                                    <div className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-2">{t('form.description')}</div>
                                    <p className="text-sm text-[var(--foreground)] leading-relaxed">
                                        {service.description}
                                    </p>
                                </div>
                            )}

                            {service.tags && service.tags.length > 0 && (
                                <div>
                                    <div className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-2">{t('form.tags')}</div>
                                    <div className="flex flex-wrap gap-2">
                                        {service.tags.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 rounded text-xs font-mono bg-[var(--surface-hover)] text-[var(--foreground-muted)] border border-[var(--border)]">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {service.metadata && Object.keys(service.metadata).length > 0 && (
                                <div>
                                    <div className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-2 pt-2 border-t border-[var(--border)]">{t('form.metadata')}</div>
                                    <div className="space-y-2">
                                        {Object.entries(service.metadata).map(([key, value]) => (
                                            <div key={key} className="group">
                                                <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)] mb-0.5">
                                                    <span className="uppercase">{key}</span>
                                                    <button
                                                        onClick={() => handleCopy(value, key)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        {copiedValue === key ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                                <div className="p-2 bg-[var(--background)] border border-[var(--border)] rounded font-mono text-xs text-[var(--foreground)] break-all">
                                                    {value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Infrastructure & Links */}
                <div className="lg:col-span-2 space-y-8">
                    {['common', ...config.environments].map(env => {
                        const links = linksByEnv[env];
                        if (!links || links.length === 0) return null;

                        const isCommon = env === 'common';

                        return (
                            <div key={env} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--foreground-muted)] uppercase tracking-widest mb-3 pb-2 border-b border-[var(--border)]">
                                    {isCommon ? (
                                        <>
                                            <Globe className="w-4 h-4" />
                                            {t('service_page.common_resources')}
                                        </>
                                    ) : (
                                        <>
                                            <Server className="w-4 h-4" />
                                            {env} {t('service_page.environment')}
                                        </>
                                    )}
                                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)]">
                                        {links.length}
                                    </span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(() => {
                                        const renderLinkTree = (link: ServiceLink, depth = 0) => {
                                            const col = config.columns.find(c => c.id === link.columnId);
                                            const Icon = getIconComponent(col?.icon);
                                            const hasChildren = link.children && link.children.length > 0;
                                            const isExpanded = expandedLinks.has(link.id);

                                            return (
                                                <div key={link.id} className="flex flex-col gap-1 w-full">
                                                    <div className="flex items-center gap-2" style={{ marginLeft: depth > 0 ? `${depth * 1}rem` : 0 }}>
                                                        {hasChildren && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    toggleLinkExpanded(link.id);
                                                                }}
                                                                className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--foreground-muted)] transition-colors"
                                                            >
                                                                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                                            </button>
                                                        )}
                                                        <a
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={clsx(
                                                                "group flex-1 flex items-center gap-3 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:border-amber-500/40 hover:bg-[var(--surface-hover)] transition-all",
                                                                depth > 0 && !hasChildren && "ml-4 border-l-4 border-l-amber-500/20",
                                                                depth > 0 && hasChildren && "border-l-4 border-l-amber-500/20"
                                                            )}
                                                        >
                                                            <div className="w-8 h-8 rounded flex items-center justify-center bg-[var(--background)] border border-[var(--border)] group-hover:border-amber-500/30 group-hover:text-amber-500 transition-colors">
                                                                <Icon className="w-4 h-4 text-[var(--foreground-muted)] group-hover:text-amber-500" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="text-sm font-medium text-[var(--foreground)] group-hover:text-amber-500 transition-colors truncate">
                                                                    {link.name}
                                                                </div>
                                                                <div className="text-xs text-[var(--foreground-muted)] opacity-60 truncate">
                                                                    {col?.title || t('service_page.resource_fallback')}
                                                                </div>
                                                            </div>
                                                            <ExternalLink className="w-3.5 h-3.5 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-50 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                        </a>
                                                    </div>

                                                    {/* Recursive children */}
                                                    {hasChildren && isExpanded && (
                                                        <div className="contents">
                                                            {link.children!.map(child => renderLinkTree(child, depth + 1))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        };

                                        return links.map(link => renderLinkTree(link));
                                    })()}
                                </div>
                            </div>
                        );
                    })}

                    {Object.keys(linksByEnv).every(k => linksByEnv[k].length === 0) && (
                        <div className="flex flex-col items-center justify-center py-16 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground-muted)] opacity-60">
                            <Server className="w-12 h-12 mb-4 opacity-50" />
                            <p>{t('service_page.no_resources')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
