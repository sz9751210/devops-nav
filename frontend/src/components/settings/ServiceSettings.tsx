import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigationStore } from '../../store/useMatrixStore';
import type { ServiceDefinition, ServiceLink } from '../../types/schema';
import { Plus, Trash2, Package, Pencil, X, Check, Search, ChevronDown, ChevronRight, Link2 } from 'lucide-react';
import { clsx } from 'clsx';

export const ServiceSettings: React.FC = () => {
    const { t } = useTranslation();
    const { config, addService, updateService, removeService, addServiceLink, updateServiceLink, removeServiceLink } = useNavigationStore();
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
                    <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2 font-mono">
                        <Package className="w-5 h-5 text-amber-500" />
                        {t('settings.services.title')}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {t('settings.services.subtitle')}
                    </p>
                </div>
                {!isAddingService && !editingServiceId && (
                    <button
                        onClick={() => { setIsAddingService(true); setServiceForm({}); }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded font-bold transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {t('actions.add_new')}
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-amber-500/50" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('settings.services.search_placeholder')}
                    className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                />
            </div>

            {/* Add/Edit Service Form */}
            {(isAddingService || editingServiceId) && (
                <div className="p-4 bg-[var(--surface)] border border-amber-500/30 rounded space-y-4 shadow-xl">
                    <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest font-mono">
                        {editingServiceId ? `${t('actions.edit')}: SERVICE` : `${t('actions.create')}: SERVICE`}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">{t('form.id')}</label>
                            <input
                                type="text"
                                value={serviceForm.id || ''}
                                onChange={(e) => setServiceForm({ ...serviceForm, id: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                                disabled={!!editingServiceId}
                                placeholder="e.g. auth-service"
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] text-sm focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 font-mono">{t('form.label')}</label>
                            <input
                                type="text"
                                value={serviceForm.name || ''}
                                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                                placeholder="Service Name"
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 font-mono">{t('form.group')}</label>
                            <input
                                type="text"
                                list="groups"
                                value={serviceForm.group || ''}
                                onChange={(e) => setServiceForm({ ...serviceForm, group: e.target.value })}
                                placeholder="e.g. Core, Payment"
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] text-sm focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                            />
                            <datalist id="groups">
                                {groups.map((g: string) => <option key={g} value={g} />)}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 font-mono">{t('form.description')}</label>
                            <input
                                type="text"
                                value={serviceForm.description || ''}
                                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                placeholder="Optional brief"
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button onClick={resetServiceForm} className="px-4 py-2 text-slate-500 hover:text-white flex items-center gap-2 text-sm font-mono">
                            <X className="w-4 h-4" />{t('actions.cancel')}
                        </button>
                        <button
                            onClick={editingServiceId ? handleUpdateService : handleAddService}
                            disabled={!serviceForm.id || !serviceForm.name}
                            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-black rounded font-bold transition-all flex items-center gap-2 text-sm"
                        >
                            <Check className="w-4 h-4" />{editingServiceId ? t('actions.save') : t('actions.add_new')}
                        </button>
                    </div>
                </div>
            )}

            {/* Service List */}
            <div className="space-y-2">
                {filteredServices.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 border border-dashed border-[var(--border)] rounded bg-[var(--surface)] text-sm font-mono uppercase tracking-tighter">
                        {searchQuery ? t('app.no_matches_found') : t('settings.services.no_services_defined')}
                    </div>
                ) : (
                    filteredServices.map((service: any) => {
                        const isExpanded = expandedService === service.id;
                        const linkCount = service.links?.length || 0;

                        return (
                            <div key={service.id} className="rounded border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                                {/* Service Header */}
                                <div className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--surface-hover)] transition-colors">
                                    <button
                                        onClick={() => setExpandedService(isExpanded ? null : service.id)}
                                        className="flex-1 flex items-center gap-3 text-left"
                                    >
                                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-slate-200 text-sm tracking-tight">{service.name}</span>
                                            <span className="text-[10px] text-slate-500 font-mono uppercase">{t('settings.services.links_count')}: {linkCount}</span>
                                            {service.group && (
                                                <span className="text-[10px] text-amber-500/60 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 font-mono uppercase">
                                                    {service.group}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => { setEditingServiceId(service.id); setServiceForm(service); }}
                                            className="p-1.5 text-slate-600 hover:text-amber-500 rounded transition-colors"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => removeService(service.id)}
                                            className="p-1.5 text-slate-600 hover:text-red-500 rounded transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded: Links */}
                                {isExpanded && (
                                    <div className="border-t border-[var(--border)] p-4 bg-[var(--background)] space-y-3">
                                        {/* Add Link Button */}
                                        {isAddingLink !== service.id && !editingLinkId && (
                                            <button
                                                onClick={() => { setIsAddingLink(service.id); setLinkForm({}); }}
                                                className="w-full py-2 border border-dashed border-[var(--border)] hover:border-amber-500/30 text-slate-600 hover:text-amber-500 rounded text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all font-mono"
                                            >
                                                <Plus className="w-3 h-3" />
                                                {t('actions.add_resource_link')}
                                            </button>
                                        )}

                                        {/* Add/Edit Link Form */}
                                        {(isAddingLink === service.id || editingLinkId) && (
                                            <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded space-y-3 font-mono">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-[9px] font-bold text-slate-600 uppercase mb-1">{t('form.id')}</label>
                                                        <input
                                                            type="text"
                                                            value={linkForm.id || ''}
                                                            onChange={(e) => setLinkForm({ ...linkForm, id: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                                                            disabled={!!editingLinkId}
                                                            placeholder="grafana-dashboard"
                                                            className="w-full px-2 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-[11px] text-[var(--foreground)] focus:outline-none focus:border-amber-500/50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] font-bold text-slate-600 uppercase mb-1">{t('form.label')}</label>
                                                        <input
                                                            type="text"
                                                            value={linkForm.name || ''}
                                                            onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })}
                                                            placeholder="Main Dashboard"
                                                            className="w-full px-2 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-[11px] text-[var(--foreground)] focus:outline-none focus:border-amber-500/50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] font-bold text-slate-600 uppercase mb-1">{t('app.columns')}</label>
                                                        <select
                                                            value={linkForm.columnId || ''}
                                                            onChange={(e) => setLinkForm({ ...linkForm, columnId: e.target.value })}
                                                            className="w-full px-2 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-[11px] text-[var(--foreground)] focus:outline-none focus:border-amber-500/50"
                                                        >
                                                            <option value="">{t('settings.services.select_column')}</option>
                                                            {config.columns.map((c: any) => (
                                                                <option key={c.id} value={c.id}>{c.title}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-600 uppercase mb-1">{t('form.url')}</label>
                                                    <input
                                                        type="text"
                                                        value={linkForm.url || ''}
                                                        onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                                                        placeholder="https://..."
                                                        className="w-full px-2 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-[11px] text-[var(--foreground)] focus:outline-none focus:border-amber-500/50 font-mono"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-600 uppercase mb-2">{t('form.environments')}</label>
                                                    <div className="flex flex-wrap gap-1">
                                                        {config.environments.map((env: string) => (
                                                            <button
                                                                key={env}
                                                                onClick={() => {
                                                                    const current = linkForm.environments || [];
                                                                    const next = current.includes(env) ? current.filter(e => e !== env) : [...current, env];
                                                                    setLinkForm({ ...linkForm, environments: next.length ? next : undefined });
                                                                }}
                                                                className={clsx(
                                                                    "px-2 py-1 text-[9px] rounded transition-all uppercase tracking-tighter border",
                                                                    linkForm.environments?.includes(env)
                                                                        ? "bg-amber-500 text-black border-amber-600"
                                                                        : "bg-[var(--background)] text-slate-600 border-[var(--border)] hover:border-slate-700"
                                                                )}
                                                            >
                                                                {env}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2 pt-1">
                                                    <button onClick={resetLinkForm} className="text-[10px] text-slate-500 hover:text-white uppercase px-2 py-1 font-bold tracking-widest transition-colors font-mono">
                                                        {t('actions.cancel')}
                                                    </button>
                                                    <button
                                                        onClick={() => editingLinkId ? handleUpdateLink(service.id) : handleAddLink(service.id)}
                                                        disabled={!linkForm.id || !linkForm.name || !linkForm.url || !linkForm.columnId}
                                                        className="bg-amber-500/90 hover:bg-amber-500 text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded transition-all disabled:opacity-20 font-mono"
                                                    >
                                                        {editingLinkId ? t('actions.update') : t('actions.commit')}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Link List */}
                                        <div className="space-y-1">
                                            {(service.links || []).map((link: any) => {
                                                const column = config.columns.find((c: any) => c.id === link.columnId);
                                                return (
                                                    <div
                                                        key={link.id}
                                                        className="flex items-center justify-between px-3 py-2 bg-[var(--surface-hover)] border border-[var(--border)] rounded group/link transition-all"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <Link2 className="w-3 h-3 text-slate-500" />
                                                                <span className="font-bold text-slate-300 text-[11px] tracking-tight">{link.name}</span>
                                                                {column && (
                                                                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded font-mono uppercase border border-[var(--border)]">
                                                                        {column.title}
                                                                    </span>
                                                                )}
                                                                {link.environments && link.environments.length > 0 && (
                                                                    <div className="flex gap-1">
                                                                        {link.environments.map((env: string) => (
                                                                            <span key={env} className="text-[8px] px-1 py-0.5 bg-amber-500/5 text-amber-500/50 rounded font-mono uppercase tracking-tighter border border-amber-500/10">
                                                                                {env}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-[9px] text-slate-500 font-mono truncate mt-0.5">{link.url}</div>
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover/link:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => startEditLink(link)}
                                                                className="p-1 text-slate-600 hover:text-amber-500 rounded"
                                                            >
                                                                <Pencil className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => removeServiceLink(service.id, link.id)}
                                                                className="p-1 text-slate-600 hover:text-red-500 rounded"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {linkCount === 0 && isAddingLink !== service.id && (
                                            <p className="text-center text-slate-600 text-[10px] py-4 font-mono font-bold uppercase tracking-widest">
                                                {t('settings.services.no_links_defined')}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <div className="h-4"></div>
        </div>
    );
};
