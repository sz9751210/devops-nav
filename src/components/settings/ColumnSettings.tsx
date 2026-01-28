import React, { useState } from 'react';
import { useMatrixStore } from '../../store/useMatrixStore';
import type { ColumnDefinition } from '../../types/schema';
import { Plus, Trash2, Layers, Pencil, X, Check, Activity, FileText, Settings, Terminal, Eye, Database, Link2 } from 'lucide-react';
import { clsx } from 'clsx';

// Quick templates for common service types
const QUICK_TEMPLATES = [
    {
        id: 'monitoring',
        title: '監控',
        icon: 'activity',
        template: 'https://grafana.example.com/d/{{service_id}}?env={{env}}',
        description: 'Grafana/Prometheus Dashboard'
    },
    {
        id: 'logs',
        title: '日誌',
        icon: 'file',
        template: 'https://kibana.example.com/app/discover?query={{service_id}}&env={{env}}',
        description: 'Kibana/ELK Logs'
    },
    {
        id: 'config',
        title: '配置',
        icon: 'settings',
        template: 'https://consul.example.com/ui/{{env}}/kv/{{service_id}}',
        description: 'Consul/Config Center'
    },
    {
        id: 'terminal',
        title: '終端',
        icon: 'terminal',
        template: 'https://rancher.example.com/{{env}}/{{service_id}}/shell',
        description: 'Pod Shell Access'
    },
    {
        id: 'status',
        title: '狀態',
        icon: 'eye',
        template: 'https://status.example.com/{{service_id}}',
        description: 'Health Check Status'
    },
    {
        id: 'database',
        title: '資料庫',
        icon: 'database',
        template: 'https://adminer.example.com/?server={{env}}&db={{service_id}}',
        description: 'Database Admin'
    },
];

const ICON_OPTIONS = [
    { value: 'activity', label: '📊 監控', Icon: Activity },
    { value: 'file', label: '📝 日誌', Icon: FileText },
    { value: 'settings', label: '⚙️ 配置', Icon: Settings },
    { value: 'terminal', label: '💻 終端', Icon: Terminal },
    { value: 'eye', label: '👁️ 狀態', Icon: Eye },
    { value: 'database', label: '🗃️ 資料庫', Icon: Database },
    { value: 'link', label: '🔗 連結', Icon: Link2 },
];

export const ColumnSettings: React.FC = () => {
    const { config, addColumn, updateColumn, removeColumn } = useMatrixStore();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<Partial<ColumnDefinition>>({});

    const resetForm = () => {
        setForm({});
        setIsAdding(false);
        setEditingId(null);
    };

    const handleAdd = () => {
        if (form.id && form.title) {
            addColumn({
                id: form.id,
                title: form.title,
                type: form.type || 'link',
                template: form.template || '',
                icon: form.icon || 'link',
            });
            resetForm();
        }
    };

    const handleUpdate = () => {
        if (editingId && form.title) {
            updateColumn(editingId, form);
            resetForm();
        }
    };

    const startEdit = (col: ColumnDefinition) => {
        setEditingId(col.id);
        setForm(col);
        setIsAdding(false);
    };

    const applyTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
        setForm({
            id: template.id,
            title: template.title,
            icon: template.icon,
            template: template.template,
            type: 'link',
        });
        setIsAdding(true);
    };

    const getIconComponent = (iconName: string) => {
        const iconOption = ICON_OPTIONS.find(o => o.value === iconName);
        return iconOption?.Icon || Link2;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Layers className="w-5 h-5 text-amber-400" />
                        欄位管理
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        定義服務的連結類型，例如監控面板、日誌查看器、配置中心等
                    </p>
                </div>
                {!isAdding && !editingId && (
                    <button
                        onClick={() => { setIsAdding(true); setForm({ type: 'link', icon: 'link' }); }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        新增欄位
                    </button>
                )}
            </div>

            {/* Quick Templates */}
            {!isAdding && !editingId && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <span>⚡ 快速新增</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                        {QUICK_TEMPLATES.map(template => {
                            const exists = config.columns.some(c => c.id === template.id);
                            const Icon = getIconComponent(template.icon);
                            return (
                                <button
                                    key={template.id}
                                    onClick={() => !exists && applyTemplate(template)}
                                    disabled={exists}
                                    className={clsx(
                                        "p-3 rounded-lg border text-left transition-all",
                                        exists
                                            ? "border-slate-700 bg-slate-900/50 opacity-50 cursor-not-allowed"
                                            : "border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10 bg-slate-900/50"
                                    )}
                                >
                                    <Icon className={clsx("w-5 h-5 mb-2", exists ? "text-slate-500" : "text-amber-400")} />
                                    <div className="font-medium text-white text-sm">{template.title}</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">{template.description}</div>
                                    {exists && <div className="text-[10px] text-green-500 mt-1">✓ 已添加</div>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Add/Edit Form */}
            {(isAdding || editingId) && (
                <div className="p-4 bg-slate-900/80 border border-amber-500/30 rounded-lg space-y-4">
                    <h3 className="font-medium text-amber-400">{editingId ? '編輯欄位' : '新增欄位'}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">ID (唯一識別)</label>
                            <input
                                type="text"
                                value={form.id || ''}
                                onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                                disabled={!!editingId}
                                placeholder="例如: monitoring"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">標題</label>
                            <input
                                type="text"
                                value={form.title || ''}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="例如: 監控"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">URL 模板</label>
                        <input
                            type="text"
                            value={form.template || ''}
                            onChange={(e) => setForm({ ...form, template: e.target.value })}
                            placeholder="https://grafana.example.com/d/{{service_id}}?env={{env}}"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono text-sm"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                            可用變數: {'{{service_id}}'}, {'{{env}}'}, {'{{service_name}}'}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-400 mb-1">圖標</label>
                            <select
                                value={form.icon || 'link'}
                                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            >
                                {ICON_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-400 mb-1">類型</label>
                            <select
                                value={form.type || 'link'}
                                onChange={(e) => setForm({ ...form, type: e.target.value as 'link' | 'text' | 'status' })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            >
                                <option value="link">連結</option>
                                <option value="text">文字</option>
                                <option value="status">狀態</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={resetForm}
                            className="px-4 py-2 text-slate-400 hover:text-slate-200 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            取消
                        </button>
                        <button
                            onClick={editingId ? handleUpdate : handleAdd}
                            disabled={!form.id || !form.title}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-black rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            {editingId ? '儲存變更' : '新增欄位'}
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-400">已設定的欄位</h3>
                {config.columns.length === 0 && !isAdding ? (
                    <div className="text-center py-8 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                        尚未設定任何欄位。請使用上方的快速新增或自訂欄位。
                    </div>
                ) : (
                    config.columns.map((col) => {
                        const Icon = getIconComponent(col.icon || 'link');
                        return (
                            <div
                                key={col.id}
                                className={clsx(
                                    "flex items-center justify-between px-4 py-3 rounded-lg border transition-colors",
                                    editingId === col.id ? "border-amber-500 bg-amber-500/10" : "bg-slate-900/50 border-slate-700 hover:border-slate-600"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                        <Icon className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-200">{col.title}</span>
                                            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{col.id}</span>
                                        </div>
                                        {col.template && (
                                            <p className="text-xs text-slate-500 font-mono truncate max-w-md mt-0.5">{col.template}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => startEdit(col)}
                                        className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => removeColumn(col.id)}
                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
