import React from 'react';
import type { ServiceDefinition, ServiceLink, ColumnDefinition } from '../../types/schema';
import { ExternalLink, Terminal, Globe, Activity, FileText, Settings, Eye, Database, Link2 } from 'lucide-react';
import { useMatrixStore } from '../../store/useMatrixStore';
import { clsx } from 'clsx';

interface LinkCardProps {
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

export const LinkCard: React.FC<LinkCardProps> = ({ service, link, column }) => {
    const { addRecentService } = useMatrixStore();
    const Icon = getIconComponent(column?.icon);
    const color = getServiceColor(service.id);
    const initial = service.name.charAt(0).toUpperCase();

    const handleClick = () => {
        addRecentService(service.id);
    };

    return (
        <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="group flex flex-col p-4 bg-slate-900/40 border border-white/5 rounded-xl hover:bg-slate-800/60 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 transition-all h-full"
        >
            <div className="flex items-start justify-between mb-3">
                <div className={clsx(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    "bg-slate-800 text-slate-400 group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-colors"
                )}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="text-slate-500 group-hover:text-amber-400 transition-colors">
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>

            <h3 className="text-white font-medium text-lg leading-tight mb-1 group-hover:text-amber-300 transition-colors">
                {link.name}
            </h3>

            <div className="mt-auto pt-3 flex items-center gap-2 border-t border-white/5">
                <div className={clsx(
                    "w-5 h-5 rounded flex items-center justify-center font-bold text-[10px]",
                    color.bg, color.text
                )}>
                    {initial}
                </div>
                <span className="text-xs text-slate-400 truncate">
                    {service.name}
                </span>
            </div>
        </a>
    );
};
