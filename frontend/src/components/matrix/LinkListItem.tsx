import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ServiceDefinition, ServiceLink, ColumnDefinition } from '../../types/schema';
import { ExternalLink, Terminal, Globe, Activity, FileText, Settings, Eye, Database, Link2, Copy, Check } from 'lucide-react';
import { useNavigationStore } from '../../store/useMatrixStore';
import { clsx } from 'clsx';

interface LinkListItemProps {
    service: ServiceDefinition;
    link: ServiceLink;
    column?: ColumnDefinition;
}

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

const getServiceColor = (id: string) => {
    const colors = [
        { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        { text: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        { text: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
        { text: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
        { text: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    ];
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
};

export const LinkListItem: React.FC<LinkListItemProps> = ({ service, link, column }) => {
    const { t } = useTranslation();
    const { addRecentService } = useNavigationStore();
    const [copied, setCopied] = useState(false);
    const Icon = getIconComponent(column?.icon);
    const color = getServiceColor(service.id);

    const handleClick = () => {
        addRecentService(service.id);
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(link.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="group flex items-center justify-between gap-4 p-3 bg-[var(--surface)] border border-[var(--border)] rounded hover:border-amber-500/30 hover:bg-[var(--surface-hover)] transition-all">
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-1.5 rounded bg-[var(--background)] text-[var(--foreground-muted)] opacity-70 group-hover:text-amber-500 group-hover:opacity-100 transition-colors shrink-0">
                    <Icon className="w-4 h-4" />
                </div>

                <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClick}
                    className="flex-1 min-w-0 flex flex-col"
                >
                    <div className="text-sm font-semibold text-[var(--foreground)] truncate">
                        {link.name}
                    </div>
                    {link.url && (
                        <div className="text-xs text-[var(--foreground-muted)] truncate opacity-50 font-mono">
                            {link.url}
                        </div>
                    )}
                </a>
            </div>

            <div className="flex items-center gap-3 shrink-0">
                <span className={clsx("text-xs font-mono px-2 py-0.5 rounded border", color.text, color.bg, color.border)}>
                    {service.id}
                </span>

                <button
                    onClick={handleCopy}
                    className="p-1.5 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                    title={t('actions.copy_url')}
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
            </div>
        </div>
    );
};
