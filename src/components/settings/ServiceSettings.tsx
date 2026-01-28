import React, { useState } from 'react';
import { useMatrixStore } from '../../store/useMatrixStore';
import type { ServiceDefinition } from '../../types/schema';
import { Plus, Trash2, Server, Pencil, X, Check, Search } from 'lucide-react';
import { clsx } from 'clsx';

export const ServiceSettings: React.FC = () => {
    const { config, addService, updateService, removeService } = useMatrixStore();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<Partial<ServiceDefinition>>({});
    const [overrideKey, setOverrideKey] = useState('');
    const [overrideValue, setOverrideValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

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

    // Get unique groups
    const groups = Array.from(new Set(config.services.map(s => s.group).filter(Boolean)));

    // Filter services
    const filteredServices = config.services.filter(s =>
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Server className="w-5 h-5 text-amber-400" />
                        服務管理
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        管理所有服務項目，可依群組分類
                    </p>
                </div>
                {!isAdding && !editingId && (
                    <button
                        onClick={() => { setIsAdding(true); setForm({}); }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        新增服務
                    </button>
                )}
            </div>

            {/* Search */}
            {!isAdding && !editingId && config.services.length > 0 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜尋服務..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                </div>
            )}

            {/* Add/Edit Form */}
            {(isAdding || editingId) && (
                <div className="p-4 bg-slate-900/80 border border-amber-500/30 rounded-lg space-y-4">
                    <h3 className="font-medium text-amber-400">{editingId ? '編輯服務' : '新增服務'}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">ID (唯一識別)</label>
                            <input
                                type="text"
                                value={form.id || ''}
                                onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                                disabled={!!editingId}
                                placeholder="例如: user-service"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">名稱</label>
                            <input
                                type="text"
                                value={form.name || ''}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="例如: 用戶服務"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">群組 (可選)</label>
                            <input
                                type="text"
                                value={form.group || ''}
                                onChange={(e) => setForm({ ...form, group: e.target.value })}
                                placeholder="例如: 核心平台"
                                list="group-suggestions"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                            <datalist id="group-suggestions">
                                {groups.map(g => <option key={g} value={g} />)}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">說明 (可選)</label>
                            <input
                                type="text"
                                value={form.description || ''}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="服務簡述..."
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                        </div>
                    </div>

                    {/* Overrides Section */}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2">自訂 URL (覆蓋預設模板)</label>
                        <div className="space-y-2 mb-2">
                            {Object.entries(form.overrides || {}).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2 text-sm">
                                    <span className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded text-xs">{key}</span>
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
                                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            >
                                <option value="">選擇欄位...</option>
                                {config.columns.map(col => (
                                    <option key={col.id} value={col.id}>{col.title}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={overrideValue}
                                onChange={(e) => setOverrideValue(e.target.value)}
                                placeholder="自訂 URL..."
                                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono text-sm"
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
                            取消
                        </button>
                        <button
                            onClick={editingId ? handleUpdate : handleAdd}
                            disabled={!form.id || !form.name}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-black rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            {editingId ? '儲存變更' : '新增服務'}
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-400">
                        已設定的服務 ({filteredServices.length})
                    </h3>
                </div>
                {config.services.length === 0 && !isAdding ? (
                    <div className="text-center py-8 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                        尚未設定任何服務。請點擊上方「新增服務」按鈕。
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                        沒有符合搜尋條件的服務
                    </div>
                ) : (
                    filteredServices.map((svc) => (
                        <div
                            key={svc.id}
                            className={clsx(
                                "flex items-center justify-between px-4 py-3 rounded-lg border transition-colors",
                                editingId === svc.id ? "border-amber-500 bg-amber-500/10" : "bg-slate-900/50 border-slate-700 hover:border-slate-600"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold">
                                    {svc.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-200">{svc.name}</span>
                                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{svc.id}</span>
                                        {svc.group && <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{svc.group}</span>}
                                    </div>
                                    {svc.description && (
                                        <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">{svc.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => startEdit(svc)}
                                    className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
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
