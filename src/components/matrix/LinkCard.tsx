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

const getServiceColor = (id: string) => {
    const colors = [
        { bg: 'bg-amber-500/15', text: 'text-amber-400' },
        { bg: 'bg-blue-500/15', text: 'text-blue-400' },
        { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
        { bg: 'bg-violet-500/15', text: 'text-violet-400' },
        { bg: 'bg-rose-500/15', text: 'text-rose-400' },
        { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
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
        // Compact row style for dense lists
        return (
            <div className="group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors">
                <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 shrink-0" />
                <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClick}
                    className="flex-1 text-sm text-slate-300 hover:text-amber-300 truncate"
                    title={`${link.name} - ${service.name}`}
                >
                    {link.name}
                </a>
                <span className="text-[10px] text-slate-600 truncate max-w-[80px]">{service.name}</span>
                <button
                    onClick={handleCopy}
                    className="p-1 text-slate-600 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-all"
                    title="複製連結"
                >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
            </div>
        );
    }

    // Card style
    return (
        <div className="group relative flex flex-col p-3 bg-slate-900/50 border border-white/5 rounded-lg hover:bg-slate-800/60 hover:border-amber-500/20 transition-all">
            {/* Copy button */}
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1 text-slate-600 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-all rounded"
                title="複製連結"
            >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                className="flex-1"
            >
                <div className="flex items-center gap-2 mb-2">
                    <div className={clsx(
                        "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                        "bg-slate-800 text-slate-400 group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-colors"
                    )}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors truncate pr-6">
                        {link.name}
                    </h3>
                </div>

                <div className="flex items-center gap-1.5 mt-auto">
                    <div className={clsx(
                        "w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center",
                        color.bg, color.text
                    )}>
                        {service.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[11px] text-slate-500 truncate">{service.name}</span>
                </div>
            </a>
        </div>
    );
};
