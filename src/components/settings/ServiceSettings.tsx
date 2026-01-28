import React, { useState } from 'react';
import { useMatrixStore } from '../../store/useMatrixStore';
import type { ServiceDefinition } from '../../types/schema';
import { Plus, Trash2, Server, Pencil, X, Check } from 'lucide-react';
import { clsx } from 'clsx';

export const ServiceSettings: React.FC = () => {
    const { config, addService, updateService, removeService } = useMatrixStore();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<Partial<ServiceDefinition>>({});
    const [overrideKey, setOverrideKey] = useState('');
    const [overrideValue, setOverrideValue] = useState('');

    const resetForm = () => {
        setForm({});
        setIsAdding(false);
        setEditingId(null);
    };

    const handleAdd = () => {
        if (form.id && form.name) {
            addService({
                id: form.id,
                name: form.name,
                group: form.group,
                description: form.description,
                overrides: form.overrides || {},
            });
            resetForm();
        }
    };

    const handleUpdate = () => {
        if (editingId && form.name) {
            updateService(editingId, form);
            resetForm();
        }
    };

    const startEdit = (svc: ServiceDefinition) => {
        setEditingId(svc.id);
        setForm({ ...svc });
        setIsAdding(false);
    };

    const addOverride = () => {
        if (overrideKey && overrideValue) {
            setForm({
                ...form,
                overrides: { ...form.overrides, [overrideKey]: overrideValue }
            });
            setOverrideKey('');
            setOverrideValue('');
        }
    };

    const removeOverride = (key: string) => {
        const newOverrides = { ...form.overrides };
        delete newOverrides[key];
        setForm({ ...form, overrides: newOverrides });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Server className="w-5 h-5 text-blue-400" />
                        Services
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Define the microservices or projects displayed in the matrix.
                    </p>
                </div>
                {!isAdding && !editingId && (
                    <button
                        onClick={() => { setIsAdding(true); setForm({}); }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Service
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
                                placeholder="e.g., user-service"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
                            <input
                                type="text"
                                value={form.name || ''}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g., User Service"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Group (optional)</label>
                            <input
                                type="text"
                                value={form.group || ''}
                                onChange={(e) => setForm({ ...form, group: e.target.value })}
                                placeholder="e.g., Core Platform"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Description (optional)</label>
                            <input
                                type="text"
                                value={form.description || ''}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Brief description..."
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                    </div>

                    {/* Overrides Section */}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2">URL Overrides (column-specific)</label>
                        <div className="space-y-2 mb-2">
                            {Object.entries(form.overrides || {}).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2 text-sm">
                                    <span className="px-2 py-1 bg-slate-800 rounded text-slate-300">{key}</span>
                                    <span className="text-slate-500">→</span>
                                    <span className="flex-1 text-slate-400 font-mono text-xs truncate">{value}</span>
                                    <button onClick={() => removeOverride(key)} className="text-red-400 hover:text-red-300">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={overrideKey}
                                onChange={(e) => setOverrideKey(e.target.value)}
                                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="">Select column...</option>
                                {config.columns.map(col => (
                                    <option key={col.id} value={col.id}>{col.title}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={overrideValue}
                                onChange={(e) => setOverrideValue(e.target.value)}
                                placeholder="Custom URL..."
                                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
                            />
                            <button
                                onClick={addOverride}
                                disabled={!overrideKey || !overrideValue}
                                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-300 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
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
                            disabled={!form.id || !form.name}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            {editingId ? 'Save Changes' : 'Add Service'}
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-2">
                {config.services.length === 0 && !isAdding ? (
                    <div className="text-center py-8 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                        No services defined yet. Add your first service above.
                    </div>
                ) : (
                    config.services.map((svc) => (
                        <div
                            key={svc.id}
                            className={clsx(
                                "flex items-center justify-between px-4 py-3 rounded-lg border transition-colors",
                                editingId === svc.id ? "border-blue-500 bg-blue-500/10" : "bg-slate-900/50 border-slate-700 hover:border-slate-600"
                            )}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-200">{svc.name}</span>
                                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{svc.id}</span>
                                    {svc.group && <span className="text-xs text-blue-400">{svc.group}</span>}
                                </div>
                                {svc.description && (
                                    <p className="text-xs text-slate-500 truncate mt-1">{svc.description}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => startEdit(svc)}
                                    className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => removeService(svc.id)}
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
