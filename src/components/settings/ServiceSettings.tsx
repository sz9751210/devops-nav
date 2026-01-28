import React, { useState, useMemo } from 'react';
import { useMatrixStore } from '../../store/useMatrixStore';
import type { ServiceDefinition, ServiceLink } from '../../types/schema';
import { Plus, Trash2, Package, Pencil, X, Check, Search, ChevronDown, ChevronRight, Link2 } from 'lucide-react';
import { clsx } from 'clsx';

export const ServiceSettings: React.FC = () => {
    const { config, addService, updateService, removeService, addServiceLink, updateServiceLink, removeServiceLink } = useMatrixStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedService, setExpandedService] = useState<string | null>(null);
    const [isAddingService, setIsAddingService] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [serviceForm, setServiceForm] = useState<Partial<ServiceDefinition>>({});

    // Link editing state
    const [isAddingLink, setIsAddingLink] = useState<string | null>(null);
    const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
    const [linkForm, setLinkForm] = useState<Partial<ServiceLink>>({});

    // Get unique groups for suggestions
    const groups = useMemo(() => {
        const set = new Set<string>();
        config.services.forEach(s => { if (s.group) set.add(s.group); });
        return Array.from(set);
    }, [config.services]);

    // Filter services
    const filteredServices = useMemo(() => {
        if (!searchQuery) return config.services;
        const q = searchQuery.toLowerCase();
        return config.services.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q) ||
            s.group?.toLowerCase().includes(q)
        );
    }, [config.services, searchQuery]);

    // Service form handlers
    const resetServiceForm = () => {
        setServiceForm({});
        setIsAddingService(false);
        setEditingServiceId(null);
    };

    const handleAddService = () => {
        if (serviceForm.id && serviceForm.name) {
            addService({
                id: serviceForm.id,
                name: serviceForm.name,
                group: serviceForm.group,
                description: serviceForm.description,
                links: [],
            });
            resetServiceForm();
            setExpandedService(serviceForm.id);
        }
    };

    const handleUpdateService = () => {
        if (editingServiceId) {
            updateService(editingServiceId, serviceForm);
            resetServiceForm();
        }
    };

    // Link form handlers
    const resetLinkForm = () => {
        setLinkForm({});
        setIsAddingLink(null);
        setEditingLinkId(null);
    };

    const handleAddLink = (serviceId: string) => {
        if (linkForm.id && linkForm.name && linkForm.url && linkForm.columnId) {
            addServiceLink(serviceId, {
                id: linkForm.id,
                columnId: linkForm.columnId,
                name: linkForm.name,
                url: linkForm.url,
                environments: linkForm.environments,
            });
            resetLinkForm();
        }
    };

    const handleUpdateLink = (serviceId: string) => {
        if (editingLinkId) {
            updateServiceLink(serviceId, editingLinkId, linkForm);
            resetLinkForm();
        }
    };

    const startEditLink = (link: ServiceLink) => {
        setEditingLinkId(link.id);
        setLinkForm(link);
        setIsAddingLink(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Package className="w-5 h-5 text-amber-400" />
                        服務管理
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        定義服務並為每個服務新增連結
                    </p>
                </div>
                {!isAddingService && !editingServiceId && (
                    <button
                        onClick={() => { setIsAddingService(true); setServiceForm({}); }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        新增服務
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索服務..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-white/5 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50"
                />
            </div>

            {/* Add/Edit Service Form */}
            {(isAddingService || editingServiceId) && (
                <div className="p-4 bg-slate-900/80 border border-amber-500/30 rounded-lg space-y-4">
                    <h3 className="font-medium text-amber-400">{editingServiceId ? '編輯服務' : '新增服務'}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">ID</label>
                            <input
                                type="text"
                                value={serviceForm.id || ''}
                                onChange={(e) => setServiceForm({ ...serviceForm, id: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                                disabled={!!editingServiceId}
                                placeholder="user-service"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">名稱</label>
                            <input
                                type="text"
                                value={serviceForm.name || ''}
                                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                                placeholder="User Service"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">群組</label>
                            <input
                                type="text"
                                list="groups"
                                value={serviceForm.group || ''}
                                onChange={(e) => setServiceForm({ ...serviceForm, group: e.target.value })}
                                placeholder="Core Platform"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200"
                            />
                            <datalist id="groups">
                                {groups.map(g => <option key={g} value={g} />)}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">描述</label>
                            <input
                                type="text"
                                value={serviceForm.description || ''}
                                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                placeholder="用戶管理服務"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={resetServiceForm} className="px-4 py-2 text-slate-400 hover:text-white flex items-center gap-2">
                            <X className="w-4 h-4" />取消
                        </button>
                        <button
                            onClick={editingServiceId ? handleUpdateService : handleAddService}
                            disabled={!serviceForm.id || !serviceForm.name}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-black rounded-lg font-medium flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />{editingServiceId ? '儲存' : '新增'}
                        </button>
                    </div>
                </div>
            )}

            {/* Service List */}
            <div className="space-y-2">
                {filteredServices.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                        {searchQuery ? '找不到匹配的服務' : '尚未新增任何服務'}
                    </div>
                ) : (
                    filteredServices.map(service => {
                        const isExpanded = expandedService === service.id;
                        const linkCount = service.links?.length || 0;

                        return (
                            <div key={service.id} className="rounded-xl border border-white/5 bg-slate-900/40 overflow-hidden">
                                {/* Service Header */}
                                <div className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
                                    <button
                                        onClick={() => setExpandedService(isExpanded ? null : service.id)}
                                        className="flex-1 flex items-center gap-3 text-left"
                                    >
                                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                        <div>
                                            <span className="font-medium text-white">{service.name}</span>
                                            <span className="text-xs text-slate-500 ml-2">({linkCount} 連結)</span>
                                            {service.group && (
                                                <span className="text-xs text-slate-600 bg-white/5 px-2 py-0.5 rounded ml-2">
                                                    {service.group}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => { setEditingServiceId(service.id); setServiceForm(service); }}
                                            className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => removeService(service.id)}
                                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded: Links */}
                                {isExpanded && (
                                    <div className="border-t border-white/5 p-4 bg-slate-950/50 space-y-3">
                                        {/* Add Link Button */}
                                        {isAddingLink !== service.id && !editingLinkId && (
                                            <button
                                                onClick={() => { setIsAddingLink(service.id); setLinkForm({}); }}
                                                className="w-full py-2 border border-dashed border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/10 text-sm flex items-center justify-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                新增連結
                                            </button>
                                        )}

                                        {/* Add/Edit Link Form */}
                                        {(isAddingLink === service.id || editingLinkId) && (
                                            <LinkForm
                                                form={linkForm}
                                                setForm={setLinkForm}
                                                columns={config.columns}
                                                environments={config.environments}
                                                onSave={() => editingLinkId ? handleUpdateLink(service.id) : handleAddLink(service.id)}
                                                onCancel={resetLinkForm}
                                                isEditing={!!editingLinkId}
                                            />
                                        )}

                                        {/* Link List */}
                                        {(service.links || []).map(link => {
                                            const column = config.columns.find(c => c.id === link.columnId);
                                            return (
                                                <div
                                                    key={link.id}
                                                    className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <Link2 className="w-3 h-3 text-slate-500" />
                                                            <span className="font-medium text-slate-200 text-sm">{link.name}</span>
                                                            {column && (
                                                                <span className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded">
                                                                    {column.title}
                                                                </span>
                                                            )}
                                                            {link.environments && link.environments.length > 0 && (
                                                                <div className="flex gap-1">
                                                                    {link.environments.map(env => (
                                                                        <span key={env} className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded">
                                                                            {env}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 font-mono truncate">{link.url}</p>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => startEditLink(link)}
                                                            className="p-1.5 text-slate-500 hover:text-amber-400 rounded"
                                                        >
                                                            <Pencil className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => removeServiceLink(service.id, link.id)}
                                                            className="p-1.5 text-slate-500 hover:text-red-400 rounded"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {linkCount === 0 && isAddingLink !== service.id && (
                                            <p className="text-center text-slate-500 text-sm py-4">
                                                尚無連結，點擊上方按鈕新增
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

// Link Form Component
interface LinkFormProps {
    form: Partial<ServiceLink>;
    setForm: (form: Partial<ServiceLink>) => void;
    columns: { id: string; title: string }[];
    environments: string[];
    onSave: () => void;
    onCancel: () => void;
    isEditing: boolean;
}

const LinkForm: React.FC<LinkFormProps> = ({ form, setForm, columns, environments, onSave, onCancel, isEditing }) => {
    const toggleEnv = (env: string) => {
        const current = form.environments || [];
        const newEnvs = current.includes(env)
            ? current.filter(e => e !== env)
            : [...current, env];
        setForm({ ...form, environments: newEnvs.length > 0 ? newEnvs : undefined });
    };

    return (
        <div className="p-3 bg-slate-900 border border-amber-500/30 rounded-lg space-y-3">
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs text-slate-400 mb-1">ID</label>
                    <input
                        type="text"
                        value={form.id || ''}
                        onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                        disabled={isEditing}
                        placeholder="grafana"
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-sm text-slate-200 disabled:opacity-50"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">名稱</label>
                    <input
                        type="text"
                        value={form.name || ''}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Grafana Dashboard"
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-sm text-slate-200"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">類別</label>
                    <select
                        value={form.columnId || ''}
                        onChange={(e) => setForm({ ...form, columnId: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-sm text-slate-200"
                    >
                        <option value="">選擇類別...</option>
                        {columns.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-xs text-slate-400 mb-1">URL</label>
                <input
                    type="text"
                    value={form.url || ''}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://grafana.example.com/d/user-service"
                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-sm text-slate-200 font-mono"
                />
            </div>
            <div>
                <label className="block text-xs text-slate-400 mb-1">顯示環境 (留空=全部)</label>
                <div className="flex flex-wrap gap-1">
                    {environments.map(env => (
                        <button
                            key={env}
                            onClick={() => toggleEnv(env)}
                            className={clsx(
                                "px-2 py-1 text-xs rounded transition-all",
                                form.environments?.includes(env)
                                    ? "bg-amber-500 text-black"
                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            )}
                        >
                            {env}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <button onClick={onCancel} className="px-3 py-1.5 text-slate-400 text-sm">取消</button>
                <button
                    onClick={onSave}
                    disabled={!form.id || !form.name || !form.url || !form.columnId}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-black text-sm rounded font-medium"
                >
                    {isEditing ? '儲存' : '新增'}
                </button>
            </div>
        </div>
    );
};
