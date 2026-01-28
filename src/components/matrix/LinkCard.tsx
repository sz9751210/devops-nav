import React from 'react';
import type { ServiceDefinition, ServiceLink, ColumnDefinition } from '../../types/schema';
import { ExternalLink, Terminal, Globe, Activity, FileText, Settings, Eye, Database, Link2, Copy, Check } from 'lucide-react';
import { useMatrixStore } from '../../store/useMatrixStore';
import { clsx } from 'clsx';
import { useState } from 'react';

interface LinkCardProps {
    service: ServiceDefinition;
    link: ServiceLink;
    column?: ColumnDefinition;
    compact?: boolean;
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

// Simplified color logic (just one standard look or very subtle)
const getServiceColor = (id: string) => {
    const colors = [
        { text: 'text-amber-500' },
        { text: 'text-blue-500' },
        { text: 'text-emerald-500' },
        { text: 'text-violet-500' },
        { text: 'text-rose-500' },
        { text: 'text-cyan-500' },
    ];
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
};

export const LinkCard: React.FC<LinkCardProps> = ({ service, link, column, compact = false }) => {
    const { addRecentService } = useMatrixStore();
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

    if (compact) {
        return (
            <div className="group flex items-center justify-between gap-3 px-2 py-1.5 rounded hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <div className="flex items-center gap-2 min-w-0">
                    <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-500 shrink-0 transition-colors" />
                    <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleClick}
                        className="text-sm text-slate-300 hover:text-white truncate font-medium"
                        title={`${link.name} - ${service.name}`}
                    >
                        {link.name}
                    </a>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-600 truncate font-mono max-w-[80px] hidden sm:block">{service.id}</span>
                    <button
                        onClick={handleCopy}
                        className="p-1 text-slate-600 hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-all"
                        title="Copy URL"
                    >
                        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                </div>
            </div>
        );
    }

    // Card style (Panel)
    return (
        <div className="group relative flex flex-col p-3 bg-[#131315] border border-white/5 rounded transition-all hover:border-amber-500/30 hover:bg-[#18181b]">
            <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                className="flex-1 flex flex-col h-full"
            >
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded bg-white/5 text-slate-400 group-hover:text-amber-500 transition-colors">
                            <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white truncate pr-1">
                            {link.name}
                        </h3>
                    </div>
                </div>

                <div className="mt-auto pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className={clsx("text-[10px] font-mono", color.text)}>
                        {service.id}
                    </span>
                    <span className="text-[10px] text-slate-600 truncate max-w-[80px] ml-2">
                        {service.name}
                    </span>
                </div>
            </a>

            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 text-slate-600 hover:text-white opacity-0 group-hover:opacity-100 transition-all rounded"
                title="Copy URL"
            >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
        </div>
    );
};
