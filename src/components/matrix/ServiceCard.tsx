import React from 'react';
import { resolveUrl } from '../../lib/urlResolver';
import type { ServiceDefinition, ColumnDefinition } from '../../types/schema';
import { ExternalLink, Terminal, Globe, FileText, Database, Box } from 'lucide-react';
import { clsx } from 'clsx';

interface ServiceCardProps {
    service: ServiceDefinition;
    columns: ColumnDefinition[];
    currentEnv: string;
    viewMode: 'card' | 'table';
}

// Icon mapping based on column type or icon field
const getColumnIcon = (column: ColumnDefinition) => {
    const iconMap: Record<string, React.ElementType> = {
        'terminal': Terminal,
        'globe': Globe,
        'file': FileText,
        'database': Database,
        'box': Box,
    };

    const IconComponent = column.icon ? iconMap[column.icon] : ExternalLink;
    return IconComponent || ExternalLink;
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

export const ServiceCard: React.FC<ServiceCardProps> = ({
    service,
    columns,
    currentEnv,
    viewMode
}) => {
    const color = getServiceColor(service.id);

    // Get first letter for avatar
    const initial = service.name.charAt(0).toUpperCase();

    // Card View
    if (viewMode === 'card') {
        return (
            <div className={clsx(
                "group relative p-4 rounded-xl border bg-slate-900/60 backdrop-blur-sm transition-all duration-200",
                "hover:bg-slate-800/60 hover:border-white/10 hover:shadow-lg hover:shadow-black/20",
                "border-white/5"
            )}>
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                    <div className={clsx(
                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg",
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

                {/* Links */}
                <div className="flex flex-wrap gap-1.5">
                    {columns.slice(0, 4).map(column => {
                        const url = resolveUrl(service, column, currentEnv);
                        if (!url) return null;

                        const Icon = getColumnIcon(column);

                        return (
                            <a
                                key={column.id}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={clsx(
                                    "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all",
                                    "bg-white/5 text-slate-400 hover:bg-amber-500/20 hover:text-amber-400",
                                    "border border-transparent hover:border-amber-500/30"
                                )}
                                title={column.title}
                            >
                                <Icon className="w-3 h-3" />
                                <span className="truncate max-w-[60px]">{column.title}</span>
                            </a>
                        );
                    })}
                    {columns.length > 4 && (
                        <span className="text-xs text-slate-500 px-2 py-1">
                            +{columns.length - 4}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    // Table/List View
    return (
        <div className={clsx(
            "group flex items-center gap-4 p-3 rounded-lg border bg-slate-900/40 transition-all",
            "hover:bg-slate-800/40 hover:border-white/10",
            "border-white/5"
        )}>
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

            {/* Links */}
            <div className="flex items-center gap-1.5 shrink-0">
                {columns.slice(0, 5).map(column => {
                    const url = resolveUrl(service, column, currentEnv);
                    if (!url) return null;

                    const Icon = getColumnIcon(column);

                    return (
                        <a
                            key={column.id}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={clsx(
                                "p-1.5 rounded-md transition-all",
                                "bg-white/5 text-slate-400 hover:bg-amber-500/20 hover:text-amber-400"
                            )}
                            title={column.title}
                        >
                            <Icon className="w-3.5 h-3.5" />
                        </a>
                    );
                })}
            </div>
        </div>
    );
};
