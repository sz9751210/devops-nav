import React, { useState } from 'react';
import {
    LayoutGrid,
    Settings,
    Layers,
    Server,
    Globe,
    FileCode,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    HelpCircle,
    FolderTree
} from 'lucide-react';
import { clsx } from 'clsx';
import { DashboardStats } from './DashboardStats';
import { HelpModal } from './HelpModal';

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
    { id: 'matrix', label: 'Matrix', icon: LayoutGrid },
    { id: 'env-settings', label: 'Environments', icon: Globe, group: 'Settings' },
    { id: 'env-group-settings', label: 'Env Groups', icon: FolderTree, group: 'Settings' },
    { id: 'column-settings', label: 'Columns', icon: Layers, group: 'Settings' },
    { id: 'service-settings', label: 'Services', icon: Server, group: 'Settings' },
    { id: 'import-export', label: 'Import/Export', icon: FileCode },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const renderNavItem = (item: NavItem) => (
        <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                currentPage === item.id
                    ? "text-white bg-gradient-to-r from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
        >
            {currentPage === item.id && (
                <div className="absolute inset-y-0 left-0 w-1 bg-indigo-500 rounded-r-full" />
            )}
            <item.icon className={clsx(
                "w-5 h-5 shrink-0 transition-colors",
                currentPage === item.id ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
            )} />
            {!collapsed && <span className="truncate">{item.label}</span>}
        </button>
    );

    // Group items
    const mainItems = navItems.filter(i => !i.group);
    const settingsItems = navItems.filter(i => i.group === 'Settings');

    return (
        <aside
            className={clsx(
                "h-screen sticky top-0 flex flex-col border-r border-white/10 bg-slate-900/40 backdrop-blur-xl transition-all duration-300 z-50",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Logo */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
                {!collapsed && (
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
                            <LayoutGrid className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-display font-bold text-white text-lg tracking-tight">OpsBridge</span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={clsx(
                        "p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors",
                        collapsed && "mx-auto"
                    )}
                >
                    {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>

            {/* Dashboard Stats */}
            {!collapsed && (
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center gap-2 mb-3 text-slate-400">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Overview</span>
                    </div>
                    <DashboardStats />
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                {mainItems.map(renderNavItem)}

                {/* Settings Group */}
                {!collapsed && (
                    <div className="pt-6 pb-3 px-4">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Settings className="w-3 h-3" />
                            Settings
                        </span>
                    </div>
                )}
                {collapsed && <div className="border-t border-white/5 my-4" />}
                {settingsItems.map(renderNavItem)}
            </nav>

            {/* Footer */}
            <div className="border-t border-white/5 bg-slate-900/20">
                {/* Help Button */}
                <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="w-full p-4 flex items-center gap-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <HelpCircle className="w-5 h-5" />
                    {!collapsed && <span className="text-sm font-medium">Help & Shortcuts</span>}
                </button>

                {/* Quick Search Hint */}
                <div className="p-4 border-t border-white/5">
                    {!collapsed ? (
                        <div className="flex items-center justify-between text-xs text-slate-500 px-2">
                            <span>Quick Search</span>
                            <kbd className="bg-white/10 px-2 py-1 rounded text-slate-300 font-sans">⌘K</kbd>
                        </div>
                    ) : (
                        <div className="text-center text-slate-500">
                            <kbd className="bg-white/10 px-1.5 py-1 rounded text-[10px] text-slate-300">⌘K</kbd>
                        </div>
                    )}
                </div>
            </div>

            {/* Help Modal */}
            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        </aside>
    );
};
