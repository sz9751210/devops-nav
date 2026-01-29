import React from 'react';
import type { ServiceDefinition, ColumnDefinition, ServiceLink } from '../../types/schema';
import { useNavigationStore } from '../../store/useNavigationStore';
import { ExternalLink, Github, Terminal, Activity, Cloud, Link2 } from 'lucide-react';

interface ServiceCellProps {
    service: ServiceDefinition;
    column: ColumnDefinition;
}

const IconMap: Record<string, React.ElementType> = {
    github: Github,
    jenkins: Terminal,
    kibana: Activity,
    grafana: Activity,
    aws: Cloud,
    gcp: Cloud,
    datadog: Activity,
    terminal: Terminal,
    activity: Activity,
    default: ExternalLink
};

// Get visible links for current environment
const getVisibleLinks = (links: ServiceLink[] | undefined, env: string): ServiceLink[] => {
    if (!links) return [];
    return links.filter(link => {
        if (!link.environments || link.environments.length === 0) return true;
        return link.environments.includes(env);
    });
};

export const ServiceCell: React.FC<ServiceCellProps> = ({ service, column }) => {
    const currentEnv = useNavigationStore((state) => state.currentEnv);

    // Get links for this service under this column
    const visibleLinks = getVisibleLinks(service.links, currentEnv);
    const linksForColumn = visibleLinks.filter(link => link.columnId === column.id);

    if (linksForColumn.length === 0) {
        return <span className="text-slate-600/50">-</span>;
    }

    const Icon = (column.icon && IconMap[column.icon]) || IconMap.default;

    // If single link, render simple
    if (linksForColumn.length === 1) {
        const link = linksForColumn[0];
        return (
            <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-all group p-1.5 -ml-1.5 rounded-lg hover:bg-white/5"
                title={link.name}
            >
                <Icon className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                <span className="hidden xl:inline text-xs truncate max-w-[150px]">{link.name}</span>
                <ExternalLink className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </a>
        );
    }

    // Multiple links, render as dropdown-like list
    return (
        <div className="flex flex-wrap gap-1">
            {linksForColumn.map(link => (
                <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                    title={link.url}
                >
                    <Link2 className="w-3 h-3" />
                    {link.name}
                </a>
            ))}
        </div>
    );
};
