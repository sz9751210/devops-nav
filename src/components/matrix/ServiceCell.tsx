import React from 'react';
import type { ServiceDefinition, ColumnDefinition } from '../../types/schema';
import { useMatrixStore } from '../../store/useMatrixStore';
import { resolveUrl } from '../../lib/urlResolver';
import { ExternalLink, Github, Terminal, Activity, Cloud } from 'lucide-react';

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
    default: ExternalLink
};

export const ServiceCell: React.FC<ServiceCellProps> = ({ service, column }) => {
    const currentEnv = useMatrixStore((state) => state.currentEnv);

    if (column.type === 'status') {
        // TODO: Implement health check logic if requested, for now rendering link if template exists
    }

    const url = resolveUrl(service, column, currentEnv);

    if (!url) {
        return <span className="text-slate-600/50">-</span>;
    }

    const Icon = (column.icon && IconMap[column.icon]) || IconMap.default;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-all group p-1.5 -ml-1.5 rounded-lg hover:bg-white/5"
            title={url}
        >
            <Icon className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
            <span className="hidden xl:inline text-xs truncate max-w-[150px] decoration-slate-700 group-hover:decoration-indigo-500/50 underline-offset-4">
                View
            </span>
            <ExternalLink className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </a>
    );
};
