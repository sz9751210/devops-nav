import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatrixStore } from '../../store/useMatrixStore';
import type { ColumnDefinition } from '../../types/schema';
import {
    Plus, Trash2, Layers, Pencil, X, Check,
    Activity, FileText, Settings, Terminal, Eye, Database, Link2, Globe
} from 'lucide-react';
import { clsx } from 'clsx';

// Quick templates for common column types
const COLUMN_TEMPLATES = [
    { id: 'monitoring', title: 'Monitoring', icon: 'activity' },
    { id: 'logs', title: 'Logs', icon: 'file' },
    { id: 'config', title: 'Config', icon: 'settings' },
    { id: 'terminal', title: 'Terminal', icon: 'terminal' },
    { id: 'status', title: 'Status', icon: 'eye' },
    { id: 'database', title: 'Database', icon: 'database' },
];

const ICON_OPTIONS = [
    { value: 'activity', label: 'Monitor', Icon: Activity },
    { value: 'file', label: 'Logs', Icon: FileText },
    { value: 'settings', label: 'Config', Icon: Settings },
    { value: 'terminal', label: 'Terminal', Icon: Terminal },
    { value: 'eye', label: 'Status', Icon: Eye },
    { value: 'database', label: 'DB', Icon: Database },
    { value: 'link', label: 'Link', Icon: Link2 },
    { value: 'globe', label: 'Web', Icon: Globe },
];

const getIconComponent = (iconName: string) => {
    const option = ICON_OPTIONS.find(o => o.value === iconName);
    return option?.Icon || Link2;
};

export const ColumnSettings: React.FC = () => {
    const { t } = useTranslation();
    const { config, addColumn, updateColumn, removeColumn } = useMatrixStore();
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
    const [columnForm, setColumnForm] = useState<Partial<ColumnDefinition>>({});

    const resetColumnForm = () => {
        setColumnForm({});
        setIsAddingColumn(false);
        setEditingColumnId(null);
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
            title: template.title,
            icon: template.icon,
        });
        setIsAddingColumn(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2 font-mono">
                        <Layers className="w-5 h-5 text-amber-500" />
                        {t('settings.columns.title')}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
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
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">⚡ QUICK_PROFILES</span>
                    <div className="flex flex-wrap gap-2">
                        {COLUMN_TEMPLATES.map(temp => {
                            const exists = config.columns.some(c => c.id === temp.id);
                            const Icon = getIconComponent(temp.icon);
                            return (
                                <button
                                    key={temp.id}
                                    onClick={() => !exists && applyColumnTemplate(temp)}
                                    disabled={exists}
                                    className={clsx(
                                        "flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-all border font-mono uppercase tracking-tighter",
                                        exists
                                            ? "bg-[var(--surface)] text-slate-700 border-transparent cursor-not-allowed"
                                            : "bg-amber-500/5 text-amber-500/80 hover:bg-amber-500/10 border-amber-500/20"
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {temp.title}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 font-mono">{t('form.id')}</label>
                            <input
                                type="text"
                                value={columnForm.id || ''}
                                onChange={(e) => setColumnForm({ ...columnForm, id: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                                disabled={!!editingColumnId}
                                placeholder="monitoring"
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-slate-700 text-sm focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 font-mono">{t('form.label')}</label>
                            <input
                                type="text"
                                value={columnForm.title || ''}
                                onChange={(e) => setColumnForm({ ...columnForm, title: e.target.value })}
                                placeholder="Monitoring"
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-slate-700 text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 font-mono">{t('form.icon')}</label>
                            <select
                                value={columnForm.icon || 'link'}
                                onChange={(e) => setColumnForm({ ...columnForm, icon: e.target.value })}
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                            >
                                {ICON_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button onClick={resetColumnForm} className="px-4 py-2 text-slate-500 hover:text-white flex items-center gap-2 text-sm font-mono">
                            <X className="w-4 h-4" />{t('actions.cancel')}
                        </button>
                        <button
                            onClick={editingColumnId ? handleUpdateColumn : handleAddColumn}
                            disabled={!columnForm.id || !columnForm.title}
                            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-black rounded font-bold transition-all flex items-center gap-2 text-sm"
                        >
                            <Check className="w-4 h-4" />{editingColumnId ? t('actions.save') : t('actions.add_new')}
                        </button>
                    </div>
                </div>
            )}

            {/* Column List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {config.columns.length === 0 && !isAddingColumn ? (
                    <div className="col-span-full text-center py-10 text-slate-600 border border-dashed border-[var(--border)] rounded bg-[var(--surface)] text-sm font-mono">
                        NO_COLUMNS_DEFINED
                    </div>
                ) : (
                    config.columns.map(column => {
                        const Icon = getIconComponent(column.icon || 'link');
                        return (
                            <div
                                key={column.id}
                                className="flex items-center justify-between p-3 rounded border border-[var(--border)] bg-[var(--surface)] hover:border-amber-500/30 hover:bg-[var(--surface-hover)] transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/10 transition-colors group-hover:bg-amber-500/20">
                                        <Icon className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-300 group-hover:text-[var(--foreground)] transition-colors text-sm">{column.title}</span>
                                        <span className="text-[10px] text-slate-600 font-mono uppercase tracking-tighter">{column.id}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setEditingColumnId(column.id); setColumnForm(column); }}
                                        className="p-1.5 text-slate-600 hover:text-amber-500 rounded transition-colors"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => removeColumn(column.id)}
                                        className="p-1.5 text-slate-600 hover:text-red-500 rounded transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Help Text */}
            <div className="p-3 bg-[var(--surface)] border-l-2 border-amber-500/50 rounded-r text-[10px] text-slate-600 font-mono italic">
                SYSTEM_INFO: Columns define navigation buckets. Categorize your links (e.g., Monitoring, Logs, SSH) to keep the matrix organized.
            </div>
        </div>
    );
};
