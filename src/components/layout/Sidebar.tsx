import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    labelKey: string;
    icon: React.ElementType;
    groupKey?: string;
}

const navItems: NavItem[] = [
    { id: 'matrix', labelKey: 'app.dashboard', icon: LayoutGrid },
    { id: 'env-settings', labelKey: 'app.environments', icon: Globe, groupKey: 'app.configuration' },
    { id: 'env-group-settings', labelKey: 'app.groups', icon: FolderTree, groupKey: 'app.configuration' },
    { id: 'column-settings', labelKey: 'app.columns', icon: Layers, groupKey: 'app.configuration' },
    { id: 'service-settings', labelKey: 'app.services', icon: Server, groupKey: 'app.configuration' },
    { id: 'import-export', labelKey: 'app.sync_backup', icon: FileCode },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
    const { t } = useTranslation();
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
                    ? "border-amber-500 bg-white/5 text-[var(--foreground)]"
                    : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"
            )}
            title={collapsed ? t(item.labelKey) : undefined}
        >
            <item.icon className={clsx(
                "w-4 h-4 shrink-0 transition-colors",
                currentPage === item.id ? "text-amber-500" : "text-slate-500 group-hover:text-slate-400"
            )} />
            {!collapsed && <span>{t(item.labelKey)}</span>}
        </button>
    );

    const mainItems = navItems.filter(i => !i.groupKey);
    const configItems = navItems.filter(i => i.groupKey === 'app.configuration');

    return (
        <aside
            className={clsx(
                "h-screen sticky top-0 flex flex-col border-r border-[var(--border)] bg-[var(--sidebar-bg)] transition-all duration-300 z-50",
                collapsed ? "w-14" : "w-64"
            )}
        >
            {/* Header / Brand */}
            <div className="h-12 flex items-center justify-between px-3 border-b border-[var(--border)]">
                {!collapsed && (
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 bg-amber-500/10 rounded flex items-center justify-center border border-amber-500/20">
                            <TerminalSquare className="w-4 h-4 text-amber-500" />
                        </div>
                        <span className="font-semibold text-[var(--foreground)] text-sm tracking-wide font-mono">{t('app.title')}</span>
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

            {/* Quick Stats */}
            {!collapsed && (
                <div className="grid grid-cols-3 gap-px bg-[var(--border)] border-b border-[var(--border)] shadow-inner">
                    {[
                        { label: t('stats.svc'), val: config.services.length },
                        { label: t('stats.env'), val: config.environments.length },
                        { label: t('stats.col'), val: config.columns.length }
                    ].map(stat => (
                        <div key={stat.label} className="py-2 bg-[var(--sidebar-bg)] text-center hover:bg-[var(--surface-hover)] transition-colors">
                            <div className="font-mono text-xs font-medium text-slate-300">{stat.val}</div>
                            <div className="text-[9px] text-slate-600 uppercase font-semibold tracking-wider italic">{stat.label}</div>
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
                            {t('app.configuration')}
                        </div>
                    )}
                    {configItems.map(renderNavItem)}
                </div>
            </nav>

            {/* Footer Actions */}
            <div className="border-t border-[var(--border)] bg-[var(--sidebar-bg)]">
                <button
                    onClick={() => setShowHelp(true)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-slate-500 hover:text-[var(--foreground)] hover:bg-white/5 transition-colors group"
                >
                    <HelpCircle className="w-4 h-4 group-hover:text-amber-500 transition-colors" />
                    {!collapsed && <span className="text-sm font-medium">{t('app.documentation')}</span>}
                </button>
            </div>

            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        </aside>
    );
};
