import React, { useState } from 'react';
import { useMatrixStore } from '../../store/useMatrixStore';
import type { ColumnDefinition } from '../../types/schema';
import {
    Plus, Trash2, Layers, Pencil, X, Check,
    Activity, FileText, Settings, Terminal, Eye, Database, Link2, Globe
} from 'lucide-react';
import { clsx } from 'clsx';

// Quick templates for common column types
const COLUMN_TEMPLATES = [
    { id: 'monitoring', title: '監控', icon: 'activity' },
    { id: 'logs', title: '日誌', icon: 'file' },
    { id: 'config', title: '配置', icon: 'settings' },
    { id: 'terminal', title: '終端', icon: 'terminal' },
    { id: 'status', title: '狀態', icon: 'eye' },
    { id: 'database', title: '資料庫', icon: 'database' },
];

const ICON_OPTIONS = [
    { value: 'activity', label: '監控', Icon: Activity },
    { value: 'file', label: '日誌', Icon: FileText },
    { value: 'settings', label: '配置', Icon: Settings },
    { value: 'terminal', label: '終端', Icon: Terminal },
    { value: 'eye', label: '狀態', Icon: Eye },
    { value: 'database', label: '資料庫', Icon: Database },
    { value: 'link', label: '連結', Icon: Link2 },
    { value: 'globe', label: '網站', Icon: Globe },
];

const getIconComponent = (iconName: string) => {
    const option = ICON_OPTIONS.find(o => o.value === iconName);
    return option?.Icon || Link2;
};

export const ColumnSettings: React.FC = () => {
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
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Layers className="w-5 h-5 text-amber-400" />
                        欄位管理
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        定義連結類別 (如：監控、日誌)，連結在服務管理中設定
                    </p>
                </div>
                {!isAddingColumn && !editingColumnId && (
                    <button
                        onClick={() => { setIsAddingColumn(true); setColumnForm({ type: 'link', icon: 'link' }); }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        新增欄位
                    </button>
                )}
            </div>

            {/* Quick Templates */}
            {!isAddingColumn && !editingColumnId && (
                <div className="space-y-2">
                    <span className="text-xs text-slate-500">⚡ 快速新增</span>
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
                                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all",
                                        exists
                                            ? "bg-slate-900 text-slate-600 cursor-not-allowed"
                                            : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {temp.title}
                                    {exists && <Check className="w-3 h-3 text-green-500" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Add/Edit Column Form */}
            {(isAddingColumn || editingColumnId) && (
                <div className="p-4 bg-slate-900/80 border border-amber-500/30 rounded-lg space-y-4">
                    <h3 className="font-medium text-amber-400">{editingColumnId ? '編輯欄位' : '新增欄位'}</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">ID</label>
                            <input
                                type="text"
                                value={columnForm.id || ''}
                                onChange={(e) => setColumnForm({ ...columnForm, id: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                                disabled={!!editingColumnId}
                                placeholder="monitoring"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">標題</label>
                            <input
                                type="text"
                                value={columnForm.title || ''}
                                onChange={(e) => setColumnForm({ ...columnForm, title: e.target.value })}
                                placeholder="監控"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">圖標</label>
                            <select
                                value={columnForm.icon || 'link'}
                                onChange={(e) => setColumnForm({ ...columnForm, icon: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-amber-500/50"
                            >
                                {ICON_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={resetColumnForm} className="px-4 py-2 text-slate-400 hover:text-white flex items-center gap-2">
                            <X className="w-4 h-4" />取消
                        </button>
                        <button
                            onClick={editingColumnId ? handleUpdateColumn : handleAddColumn}
                            disabled={!columnForm.id || !columnForm.title}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-black rounded-lg font-medium flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />{editingColumnId ? '儲存' : '新增'}
                        </button>
                    </div>
                </div>
            )}

            {/* Column List */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {config.columns.length === 0 && !isAddingColumn ? (
                    <div className="col-span-full text-center py-8 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                        尚未設定任何欄位。請使用上方的快速新增或自訂欄位。
                    </div>
                ) : (
                    config.columns.map(column => {
                        const Icon = getIconComponent(column.icon || 'link');
                        return (
                            <div
                                key={column.id}
                                className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                        <Icon className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <span className="font-medium text-white">{column.title}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => { setEditingColumnId(column.id); setColumnForm(column); }}
                                        className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => removeColumn(column.id)}
                                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
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
            <div className="p-3 bg-slate-900/50 border border-white/5 rounded-lg">
                <p className="text-xs text-slate-500">
                    💡 欄位定義連結的類別。建立欄位後，請到「服務管理」為每個服務新增該類別的連結。
                </p>
            </div>
        </div>
    );
};
