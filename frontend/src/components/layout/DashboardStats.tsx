import React from 'react';
import { useNavigationStore } from '../../store/useMatrixStore';
import { Server, Layers, Globe } from 'lucide-react';

export const DashboardStats: React.FC = () => {
    const { config } = useNavigationStore();

    const stats = [
        {
            label: 'Services',
            value: config.services.length,
            icon: Server,
            color: 'text-indigo-400',
        },
        {
            label: 'Columns',
            value: config.columns.length,
            icon: Layers,
            color: 'text-violet-400',
        },
        {
            label: 'Environments',
            value: config.environments.length,
            icon: Globe,
            color: 'text-blue-400',
        },
    ];

    return (
        <div className="space-y-2">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        <span className="text-xs text-slate-400">{stat.label}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{stat.value}</span>
                </div>
            ))}
        </div>
    );
};
