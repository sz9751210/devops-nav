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
    HelpCircle,
    FolderTree
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
    { id: 'matrix', label: '服務總覽', icon: LayoutGrid },
    { id: 'env-settings', label: '環境設定', icon: Globe, group: 'Settings' },
    { id: 'env-group-settings', label: '環境群組', icon: FolderTree, group: 'Settings' },
    { id: 'column-settings', label: '欄位管理', icon: Layers, group: 'Settings' },
    { id: 'service-settings', label: '服務管理', icon: Server, group: 'Settings' },
    { id: 'import-export', label: '匯入匯出', icon: FileCode },
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
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                currentPage === item.id
                    ? "text-amber-400 bg-amber-500/10 border-l-2 border-amber-500"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
            )}
        >
            <item.icon className={clsx(
                "w-5 h-5 shrink-0 transition-colors",
                currentPage === item.id ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"
            )} />
            {!collapsed && <span className="truncate">{item.label}</span>}
        </button>
    );

    const mainItems = navItems.filter(i => !i.group);
    const settingsItems = navItems.filter(i => i.group === 'Settings');

    return (
        <aside
            className={clsx(
                "h-screen sticky top-0 flex flex-col border-r border-white/10 bg-[#0d0d0d] transition-all duration-300 z-50",
                collapsed ? "w-20" : "w-56"
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="text-2xl">✊</div>
                        <span className="font-bold text-amber-400 text-lg tracking-tight">OpsBridge</span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={clsx(
                        "p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors",
                        collapsed && "mx-auto"
                    )}
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Stats */}
            {!collapsed && (
                <div className="p-4 border-b border-white/5">
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white/5 rounded-lg p-2">
                            <div className="text-lg font-bold text-white">{config.services.length}</div>
                            <div className="text-[10px] text-slate-500 uppercase">服務</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                            <div className="text-lg font-bold text-white">{config.columns.length}</div>
                            <div className="text-[10px] text-slate-500 uppercase">欄位</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                            <div className="text-lg font-bold text-white">{config.environments.length}</div>
                            <div className="text-[10px] text-slate-500 uppercase">環境</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {mainItems.map(renderNavItem)}

                {/* Settings Group */}
                {!collapsed && (
                    <div className="pt-4 pb-2 px-4">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <Settings className="w-3 h-3" />
                            設定
                        </span>
                    </div>
                )}
                {collapsed && <div className="border-t border-white/5 my-3" />}
                {settingsItems.map(renderNavItem)}
            </nav>

            {/* Footer */}
            <div className="border-t border-white/5">
                <button
                    onClick={() => setShowHelp(true)}
                    className="w-full p-3 flex items-center gap-3 text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <HelpCircle className="w-5 h-5" />
                    {!collapsed && <span className="text-sm">幫助</span>}
                </button>

                <div className="p-3 border-t border-white/5 text-center">
                    <kbd className="bg-white/10 px-2 py-1 rounded text-[10px] text-slate-400 font-mono">⌘K</kbd>
                    {!collapsed && <span className="text-[10px] text-slate-600 ml-2">快速搜索</span>}
                </div>
            </div>

            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        </aside>
    );
};
