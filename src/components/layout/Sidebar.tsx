import React, { useState } from 'react';
import {
    LayoutGrid,
    Layers,
    Server,
    Globe,
    FileCode,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
    FolderTree,
    TerminalSquare
} from 'lucide-react';
import { clsx } from 'clsx';
import { HelpModal } from './HelpModal';
import { useMatrixStore } from '../../store/useMatrixStore';

export type PageId = 'matrix' | 'env-settings' | 'env-group-settings' | 'column-settings' | 'service-settings' | 'import-export';

interface SidebarProps {
    currentPage: PageId;
    onPageChange: (page: PageId) => void;
}

interface NavItem {
    id: PageId;
    label: string;
    icon: React.ElementType;
    group?: string;
}

const navItems: NavItem[] = [
    { id: 'matrix', label: 'Dashboard', icon: LayoutGrid },
    { id: 'env-settings', label: 'Environments', icon: Globe, group: 'Configuration' },
    { id: 'env-group-settings', label: 'Groups', icon: FolderTree, group: 'Configuration' },
    { id: 'column-settings', label: 'Columns', icon: Layers, group: 'Configuration' },
    { id: 'service-settings', label: 'Services', icon: Server, group: 'Configuration' },
    { id: 'import-export', label: 'Sync / Backup', icon: FileCode },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const { config } = useMatrixStore();

    const renderNavItem = (item: NavItem) => (
        <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={clsx(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors group border-l-2",
                currentPage === item.id
                    ? "border-amber-500 bg-white/5 text-slate-100"
                    : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"
            )}
            title={collapsed ? item.label : undefined}
        >
            <item.icon className={clsx(
                "w-4 h-4 shrink-0 transition-colors",
                currentPage === item.id ? "text-amber-500" : "text-slate-500 group-hover:text-slate-400"
            )} />
            {!collapsed && <span>{item.label}</span>}
        </button>
    );

    const mainItems = navItems.filter(i => !i.group);
    const configItems = navItems.filter(i => i.group === 'Configuration');

    return (
        <aside
            className={clsx(
                "h-screen sticky top-0 flex flex-col border-r border-white/10 bg-[#09090b] transition-all duration-300 z-50",
                collapsed ? "w-14" : "w-64"
            )}
        >
            {/* Header / Brand */}
            <div className="h-12 flex items-center justify-between px-3 border-b border-white/10 bg-[#09090b]">
                {!collapsed && (
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 bg-amber-500/10 rounded flex items-center justify-center border border-amber-500/20">
                            <TerminalSquare className="w-4 h-4 text-amber-500" />
                        </div>
                        <span className="font-semibold text-slate-200 text-sm tracking-wide font-mono">OPS_MATRIX</span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={clsx(
                        "p-1.5 rounded text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors",
                        collapsed && "mx-auto"
                    )}
                >
                    {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Quick Stats (Mini Dashboard) */}
            {!collapsed && (
                <div className="grid grid-cols-3 gap-px bg-white/5 border-b border-white/10">
                    {[
                        { label: 'Svc', val: config.services.length },
                        { label: 'Env', val: config.environments.length },
                        { label: 'Col', val: config.columns.length }
                    ].map(stat => (
                        <div key={stat.label} className="py-2 text-center hover:bg-white/5 transition-colors">
                            <div className="font-mono text-xs font-medium text-slate-300">{stat.val}</div>
                            <div className="text-[9px] text-slate-600 uppercase font-semibold tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Nav Links */}
            <nav className="flex-1 py-3 space-y-4 overflow-y-auto">
                <div className="space-y-0.5">
                    {mainItems.map(renderNavItem)}
                </div>

                <div className="space-y-0.5">
                    {!collapsed && (
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">
                            Configuration
                        </div>
                    )}
                    {configItems.map(renderNavItem)}
                </div>
            </nav>

            {/* Footer Actions */}
            <div className="border-t border-white/10 bg-[#09090b]">
                <button
                    onClick={() => setShowHelp(true)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors group"
                >
                    <HelpCircle className="w-4 h-4 group-hover:text-amber-500 transition-colors" />
                    {!collapsed && <span className="text-sm font-medium">Documentation</span>}
                </button>
            </div>

            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        </aside>
    );
};
