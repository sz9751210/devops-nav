import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigationStore } from '../../store/useMatrixStore';
import type { ColumnDefinition } from '../../types/schema';
import {
    Plus, Trash2, Layers, Pencil, X, Check, Search,
    // Monitoring
    Activity, Eye, BarChart, LineChart, Gauge, Zap, Thermometer,
    // Infra
    Server, Cpu, HardDrive, Network, Cloud, Box, Database,
    // Dev
    Code, Terminal, GitBranch, GitCommit, Bug, Fingerprint, Command,
    // Docs
    FileText, Book, Bookmark, Info, HelpCircle, Folder,
    // Tools
    Settings, Wrench, Shield, Lock, Key, Archive, Filter, Sliders,
    // Comm
    Mail, MessageSquare, Bell,
    // Misc
    Globe, Link2, Home, User, Star, Rocket, Gift, MapPin, Anchor,
    Layout, List, Grid, Monitor
} from 'lucide-react';
import { clsx } from 'clsx';

// Quick templates for common column types
const COLUMN_TEMPLATES = [
    { id: 'monitoring', title: 'Monitoring', icon: 'activity' },
    { id: 'logs', title: 'Logs', icon: 'file-text' },
    { id: 'config', title: 'Config', icon: 'settings' },
    { id: 'cicd', title: 'CI/CD', icon: 'rocket' },
    { id: 'infrastructure', title: 'Infrastructure', icon: 'cloud' },
    { id: 'terminal', title: 'Terminal', icon: 'terminal' },
    { id: 'security', title: 'Security', icon: 'shield' },
    { id: 'documentation', title: 'Docs', icon: 'book' },
    { id: 'alerts', title: 'Alerts', icon: 'bell' },
    { id: 'database', title: 'Database', icon: 'database' },
    { id: 'status', title: 'Status', icon: 'eye' },
];

// Icon categorization for the picker
const ICON_CATEGORIES = [
    {
        name: 'Monitoring',
        icons: [
            { value: 'activity', Icon: Activity },
            { value: 'eye', Icon: Eye },
            { value: 'bar-chart', Icon: BarChart },
            { value: 'line-chart', Icon: LineChart },
            { value: 'gauge', Icon: Gauge },
            { value: 'zap', Icon: Zap },
            { value: 'thermometer', Icon: Thermometer },
            { value: 'monitor', Icon: Monitor },
        ]
    },
    {
        name: 'Infrastructure',
        icons: [
            { value: 'server', Icon: Server },
            { value: 'database', Icon: Database },
            { value: 'cloud', Icon: Cloud },
            { value: 'network', Icon: Network },
            { value: 'hard-drive', Icon: HardDrive },
            { value: 'cpu', Icon: Cpu },
            { value: 'box', Icon: Box },
            { value: 'layout', Icon: Layout },
        ]
    },
    {
        name: 'Development',
        icons: [
            { value: 'code', Icon: Code },
            { value: 'terminal', Icon: Terminal },
            { value: 'git-branch', Icon: GitBranch },
            { value: 'git-commit', Icon: GitCommit },
            { value: 'bug', Icon: Bug },
            { value: 'command', Icon: Command },
            { value: 'fingerprint', Icon: Fingerprint },
        ]
    },
    {
        name: 'Documentation',
        icons: [
            { value: 'file-text', Icon: FileText },
            { value: 'book', Icon: Book },
            { value: 'bookmark', Icon: Bookmark },
            { value: 'folder', Icon: Folder },
            { value: 'info', Icon: Info },
            { value: 'help-circle', Icon: HelpCircle },
            { value: 'list', Icon: List },
        ]
    },
    {
        name: 'Tools & Security',
        icons: [
            { value: 'settings', Icon: Settings },
            { value: 'wrench', Icon: Wrench },
            { value: 'shield', Icon: Shield },
            { value: 'lock', Icon: Lock },
            { value: 'key', Icon: Key },
            { value: 'filter', Icon: Filter },
            { value: 'sliders', Icon: Sliders },
            { value: 'archive', Icon: Archive },
        ]
    },
    {
        name: 'General',
        icons: [
            { value: 'globe', Icon: Globe },
            { value: 'link', Icon: Link2 },
            { value: 'home', Icon: Home },
            { value: 'star', Icon: Star },
            { value: 'rocket', Icon: Rocket },
            { value: 'user', Icon: User },
            { value: 'bell', Icon: Bell },
            { value: 'message-square', Icon: MessageSquare },
            { value: 'mail', Icon: Mail },
            { value: 'gift', Icon: Gift },
            { value: 'map-pin', Icon: MapPin },
            { value: 'anchor', Icon: Anchor },
            { value: 'grid', Icon: Grid },
        ]
    }
];

// Flattened list for easy lookup
const ALL_ICONS = ICON_CATEGORIES.flatMap(c => c.icons);

const getIconComponent = (iconName: string) => {
    const iconEntry = ALL_ICONS.find(i => i.value === iconName);
    return iconEntry ? iconEntry.Icon : null;
};

// Render helper: handles both Lucide icons and Emoji strings
const IconRenderer: React.FC<{ icon: string, className?: string }> = ({ icon, className }) => {
    const IconComponent = getIconComponent(icon);

    if (IconComponent) {
        return <IconComponent className={className} />;
    }

    // Fallback for Custom Emoji or unknown string
    return <span className={clsx("text-lg leading-none select-none", className?.includes("text-") ? "" : "text-base")}>{icon}</span>;
};

export const ColumnSettings: React.FC = () => {
    const { t } = useTranslation();
    const { config, addColumn, updateColumn, removeColumn } = useNavigationStore();
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
    const [columnForm, setColumnForm] = useState<Partial<ColumnDefinition>>({});
    const [searchTerm, setSearchTerm] = useState('');

    const resetColumnForm = () => {
        setColumnForm({});
        setIsAddingColumn(false);
        setEditingColumnId(null);
        setSearchTerm('');
    };

    const handleAddColumn = () => {
        if (columnForm.id && columnForm.title) {
            addColumn({
                id: columnForm.id,
                title: columnForm.title,
                type: 'link',
                icon: columnForm.icon || 'link',
            });
            resetColumnForm();
        }
    };

    const handleUpdateColumn = () => {
        if (editingColumnId && columnForm.title) {
            updateColumn(editingColumnId, columnForm);
            resetColumnForm();
        }
    };

    const applyColumnTemplate = (template: typeof COLUMN_TEMPLATES[0]) => {
        setColumnForm({
            id: template.id,
            title: t(`profiles.${template.id}`) || template.title,
            icon: template.icon,
        });
        setIsAddingColumn(true);
    };

    const applyIcon = (iconValue: string) => {
        setColumnForm({ ...columnForm, icon: iconValue });
    };

    const handleEmojiInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColumnForm({ ...columnForm, icon: e.target.value });
    };

    // Filter icons based on search term
    const filteredCategories = ICON_CATEGORIES.map(category => ({
        ...category,
        icons: category.icons.filter(icon =>
            icon.value.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(category => category.icons.length > 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2 font-mono">
                        <Layers className="w-5 h-5 text-amber-500" />
                        {t('settings.columns.title')}
                    </h2>
                    <p className="text-sm text-[var(--foreground-muted)] mt-1">
                        {t('settings.columns.subtitle')}
                    </p>
                </div>
                {!isAddingColumn && !editingColumnId && (
                    <button
                        onClick={() => { setIsAddingColumn(true); setColumnForm({ type: 'link', icon: 'link' }); }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded font-bold transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {t('actions.add_new')}
                    </button>
                )}
            </div>

            {/* Quick Templates */}
            {!isAddingColumn && !editingColumnId && (
                <div className="space-y-3">
                    <span className="text-xs font-bold text-[var(--foreground-muted)] opacity-70 uppercase tracking-widest font-mono">⚡ {t('settings.columns.quick_profiles')}</span>
                    <div className="flex flex-wrap gap-2">
                        {COLUMN_TEMPLATES.map(temp => {
                            const exists = config.columns.some(c => c.id === temp.id);
                            return (
                                <button
                                    key={temp.id}
                                    onClick={() => !exists && applyColumnTemplate(temp)}
                                    disabled={exists}
                                    className={clsx(
                                        "flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-all border font-mono uppercase tracking-tighter",
                                        exists
                                            ? "bg-[var(--surface)] text-[var(--foreground-muted)] opacity-50 border-transparent cursor-not-allowed"
                                            : "bg-amber-500/5 text-amber-500/80 hover:bg-amber-500/10 border-amber-500/20"
                                    )}
                                >
                                    <IconRenderer icon={temp.icon} className="w-3.5 h-3.5" />
                                    {t(`profiles.${temp.id}`)}
                                    {exists && <Check className="w-3 h-3 text-emerald-600" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Add/Edit Column Form */}
            {(isAddingColumn || editingColumnId) && (
                <div className="p-4 bg-[var(--surface)] border border-amber-500/30 rounded space-y-4 shadow-xl">
                    <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest font-mono">
                        {editingColumnId ? `${t('actions.edit')}: COLUMN` : `${t('actions.create')}: COLUMN`}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">

                            <div>
                                <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1 font-mono">{t('form.label')}</label>
                                <input
                                    type="text"
                                    value={columnForm.title || ''}
                                    onChange={(e) => {
                                        const title = e.target.value;
                                        setColumnForm(prev => ({
                                            ...prev,
                                            title,
                                            id: editingColumnId ? prev.id : title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                        }));
                                    }}
                                    placeholder="Monitoring"
                                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-[var(--foreground-muted)] placeholder:opacity-50 text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1 font-mono">Custom Icon / Emoji</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={columnForm.icon || ''}
                                        onChange={handleEmojiInput}
                                        placeholder="Type emoji 🚀 or icon name"
                                        className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-[var(--foreground-muted)] placeholder:opacity-50 text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                                    />
                                    <div className="w-10 h-9 rounded bg-[var(--background)] border border-[var(--border)] flex items-center justify-center shrink-0">
                                        <IconRenderer icon={columnForm.icon || 'link'} className="w-5 h-5 text-amber-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Icon Picker */}
                        <div className="border border-[var(--border)] rounded bg-[var(--background)] p-3 flex flex-col h-[280px]">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--border)]">
                                <Search className="w-4 h-4 text-[var(--foreground-muted)] opacity-50" />
                                <input
                                    type="text"
                                    placeholder="Search icons..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-transparent border-none outline-none text-xs text-[var(--foreground)] placeholder-[var(--foreground-muted)] placeholder:opacity-50 flex-1"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4">
                                {filteredCategories.length === 0 ? (
                                    <div className="text-center text-[var(--foreground-muted)] opacity-50 text-xs py-10">No icons found</div>
                                ) : (
                                    filteredCategories.map(cat => (
                                        <div key={cat.name}>
                                            <div className="text-xs font-bold text-[var(--foreground-muted)] opacity-70 uppercase mb-2 sticky top-0 bg-[var(--background)] py-1">{cat.name}</div>
                                            <div className="grid grid-cols-6 gap-2">
                                                {cat.icons.map(({ value, Icon }) => (
                                                    <button
                                                        key={value}
                                                        onClick={() => applyIcon(value)}
                                                        className={clsx(
                                                            "aspect-square rounded flex items-center justify-center transition-all",
                                                            columnForm.icon === value
                                                                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-110"
                                                                : "bg-[var(--surface)] text-slate-500 hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                                                        )}
                                                        title={value}
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)] mt-4">
                        <button onClick={resetColumnForm} className="px-4 py-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] flex items-center gap-2 text-sm font-mono font-bold uppercase tracking-widest transition-colors">
                            <X className="w-4 h-4" />{t('actions.cancel')}
                        </button>
                        <button
                            onClick={editingColumnId ? handleUpdateColumn : handleAddColumn}
                            disabled={!columnForm.id || !columnForm.title}
                            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-[var(--surface-hover)] disabled:text-[var(--foreground-muted)] disabled:opacity-50 text-black rounded font-bold transition-all flex items-center gap-2 text-sm"
                        >
                            <Check className="w-4 h-4" />{editingColumnId ? t('actions.save') : t('actions.add_new')}
                        </button>
                    </div>
                </div>
            )}

            {/* Column List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {config.columns.length === 0 && !isAddingColumn ? (
                    <div className="col-span-full text-center py-10 text-[var(--foreground-muted)] opacity-50 border border-dashed border-[var(--border)] rounded bg-[var(--surface)] text-sm font-mono">
                        {t('settings.columns.no_columns_defined')}
                    </div>
                ) : (
                    config.columns.map((column: ColumnDefinition) => (
                        <div
                            key={column.id}
                            className="flex items-center justify-between p-3 rounded border border-[var(--border)] bg-[var(--surface)] hover:border-amber-500/30 hover:bg-[var(--surface-hover)] transition-all group"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-9 h-9 shrink-0 rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/10 transition-colors group-hover:bg-amber-500/20">
                                    <IconRenderer icon={column.icon || 'link'} className="w-4 h-4 text-amber-500" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-[var(--foreground)] group-hover:text-amber-500 transition-colors text-sm truncate">{column.title}</span>
                                    <span className="text-xs text-[var(--foreground-muted)] font-mono uppercase tracking-tighter truncate">{column.id}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                                <button
                                    onClick={() => { setEditingColumnId(column.id); setColumnForm(column); setIsAddingColumn(false); }}
                                    className="p-1.5 text-[var(--foreground-muted)] hover:text-amber-600 dark:hover:text-amber-500 rounded transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => removeColumn(column.id)}
                                    className="p-1.5 text-[var(--foreground-muted)] hover:text-red-500 rounded transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Help Text */}
            <div className="p-3 bg-[var(--surface)] border-l-2 border-amber-500/50 rounded-r text-xs text-[var(--foreground-muted)] opacity-60 font-mono italic">
                {t('settings.columns.system_info')}
            </div>
        </div>
    );
};
