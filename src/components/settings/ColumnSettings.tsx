import React, { useState } from 'react';
import { useMatrixStore } from '../../store/useMatrixStore';
import type { ColumnDefinition } from '../../types/schema';
import { Plus, Trash2, Layers, Pencil, X, Check } from 'lucide-react';
import { clsx } from 'clsx';

const ICON_OPTIONS = ['github', 'jenkins', 'kibana', 'grafana', 'aws', 'gcp', 'datadog', 'slack', 'default'];

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
                icon: form.icon || 'default',
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Layers className="w-5 h-5 text-blue-400" />
                        Columns (Resource Types)
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Define resource types with URL templates. Use {'{{service_id}}'}, {'{{env}}'}, {'{{service_name}}'} as variables.
                    </p>
                </div>
                {!isAdding && !editingId && (
                    <button
                        onClick={() => { setIsAdding(true); setForm({ type: 'link', icon: 'default' }); }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Column
                    </button>
                )}
            </div>

            {/* Add/Edit Form */}
            {(isAdding || editingId) && (
                <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-lg space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">ID (unique)</label>
                            <input
                                type="text"
                                value={form.id || ''}
                                onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                                disabled={!!editingId}
                                placeholder="e.g., source-code"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
                            <input
                                type="text"
                                value={form.title || ''}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g., Source Code"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">URL Template</label>
                        <input
                            type="text"
                            value={form.template || ''}
                            onChange={(e) => setForm({ ...form, template: e.target.value })}
                            placeholder="https://github.com/org/{{service_id}}"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-400 mb-1">Icon</label>
                            <select
                                value={form.icon || 'default'}
                                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                {ICON_OPTIONS.map(icon => (
                                    <option key={icon} value={icon}>{icon}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
                            <select
                                value={form.type || 'link'}
                                onChange={(e) => setForm({ ...form, type: e.target.value as 'link' | 'text' | 'status' })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="link">Link</option>
                                <option value="text">Text</option>
                                <option value="status">Status</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={resetForm}
                            className="px-4 py-2 text-slate-400 hover:text-slate-200 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                        <button
                            onClick={editingId ? handleUpdate : handleAdd}
                            disabled={!form.id || !form.title}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            {editingId ? 'Save Changes' : 'Add Column'}
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-2">
                {config.columns.length === 0 && !isAdding ? (
                    <div className="text-center py-8 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                        No columns defined yet. Add your first resource type above.
                    </div>
                ) : (
                    config.columns.map((col) => (
                        <div
                            key={col.id}
                            className={clsx(
                                "flex items-center justify-between px-4 py-3 rounded-lg border transition-colors",
                                editingId === col.id ? "border-blue-500 bg-blue-500/10" : "bg-slate-900/50 border-slate-700 hover:border-slate-600"
                            )}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-200">{col.title}</span>
                                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{col.id}</span>
                                    <span className="text-xs text-slate-600">{col.icon}</span>
                                </div>
                                {col.template && (
                                    <p className="text-xs text-slate-500 font-mono truncate mt-1">{col.template}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => startEdit(col)}
                                    className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
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
                    ))
                )}
            </div>
        </div>
    );
};
