import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigationStore } from '../../store/useMatrixStore';
import type { ServiceDefinition, ServiceLink } from '../../types/schema';
import { Plus, Trash2, Package, Pencil, X, Check, Search, ChevronDown, ChevronRight, Link2, GitFork } from 'lucide-react';
import { clsx } from 'clsx';
import { v4 as uuidv4 } from 'uuid';

export const ServiceSettings: React.FC = () => {
    const { t } = useTranslation();
    const { config, addService, updateService, removeService, addServiceLink, updateServiceLink, removeServiceLink } = useNavigationStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [expandedService, setExpandedService] = useState<string | null>(null);
    const [isAddingService, setIsAddingService] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [serviceForm, setServiceForm] = useState<Partial<ServiceDefinition>>({});

    // Parent ID for new child service
    const [addingChildTo, setAddingChildTo] = useState<string | null>(null);
    // Parent ID for new child link
    const [addingChildLinkTo, setAddingChildLinkTo] = useState<string | null>(null);

    // Link editing state
    const [isAddingLink, setIsAddingLink] = useState<string | null>(null);
    const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
    const [linkForm, setLinkForm] = useState<Partial<ServiceLink>>({});
    // State for expanded links
    const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set());

    const toggleLinkExpanded = (linkId: string) => {
        setExpandedLinks(prev => {
            const next = new Set(prev);
            if (next.has(linkId)) {
                next.delete(linkId);
            } else {
                next.add(linkId);
            }
            return next;
        });
    };

    // Get unique groups for suggestions and filtering
    const groups = useMemo(() => {
        const set = new Set<string>();
        config.services.forEach(s => { if (s.group) set.add(s.group); });
        return Array.from(set).sort();
    }, [config.services]);

    // Get unique tags for filtering
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        config.services.forEach(s => s.tags?.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, [config.services]);

    // Filter services - Only show ROOT services (no parentId) unless searching
    const filteredServices = useMemo(() => {
        let services = config.services;

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            services = services.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.id.toLowerCase().includes(q) ||
                s.group?.toLowerCase().includes(q)
            );
        }

        if (selectedGroup) {
            services = services.filter(s => s.group === selectedGroup);
        }

        if (selectedTags.length > 0) {
            services = services.filter(s => {
                if (!s.tags) return false;
                return selectedTags.every(tag => s.tags?.includes(tag));
            });
        }

        const hasFilters = searchQuery || selectedGroup || selectedTags.length > 0;

        if (hasFilters) {
            return services;
        }

        // Default: Only show root services
        return services.filter(s => !s.parentId);
    }, [config.services, searchQuery, selectedGroup, selectedTags]);

    // Get children for a specific parent
    const getChildServices = (parentId: string) => {
        return config.services.filter(s => s.parentId === parentId);
    };

    // Service form handlers
    const resetServiceForm = () => {
        setServiceForm({});
        setIsAddingService(false);
        setEditingServiceId(null);
        setAddingChildTo(null);
    };

    const handleAddService = () => {
        if (serviceForm.id && serviceForm.name) {
            // Check if ID already exists
            if (config.services.some(s => s.id === serviceForm.id)) {
                alert("Service ID already exists!");
                return;
            }

            addService({
                id: serviceForm.id,
                name: serviceForm.name,
                group: serviceForm.group,
                description: serviceForm.description,
                parentId: serviceForm.parentId,
                links: [],
            });
            resetServiceForm();
            if (serviceForm.parentId) {
                setExpandedService(serviceForm.parentId);
            } else {
                setExpandedService(serviceForm.id);
            }
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
        setAddingChildLinkTo(null);
    };

    const handleAddLink = (serviceId: string) => {
        if (linkForm.name && linkForm.url && linkForm.columnId) {
            addServiceLink(serviceId, {
                id: linkForm.id || uuidv4(),
                columnId: linkForm.columnId,
                name: linkForm.name,
                url: linkForm.url,
                environments: linkForm.environments,
            }, addingChildLinkTo || undefined);
            resetLinkForm();
        }
    };

    const handleUpdateLink = (serviceId: string) => {
        if (editingLinkId) {
            updateServiceLink(serviceId, editingLinkId, linkForm);
            resetLinkForm();
        }
    };

    const startEditLink = (link: ServiceLink, parentId?: string) => {
        setEditingLinkId(link.id);
        setLinkForm(link);
        setIsAddingLink(null);
        setAddingChildLinkTo(parentId || null);
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
                    <p className="text-sm text-[var(--foreground-muted)] mt-1">
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

            {/* Search & Filter Bar */}
            <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="relative group flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)] opacity-50 transition-colors group-focus-within:text-amber-500 group-focus-within:opacity-100" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('settings.services.search_placeholder')}
                            className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-[var(--foreground-muted)] text-sm focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                        />
                    </div>
                    <div className="relative min-w-[200px]">
                        <select
                            value={selectedGroup || ''}
                            onChange={(e) => setSelectedGroup(e.target.value || null)}
                            className="w-full h-full pl-3 pr-8 bg-[var(--background)] border border-[var(--border)] rounded text-sm text-[var(--foreground)] appearance-none focus:outline-none focus:border-amber-500/50 transition-all cursor-pointer"
                        >
                            <option value="">{t('actions.all_groups')}</option>
                            {groups.map(group => (
                                <option key={group} value={group}>{group}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)] pointer-events-none" />
                    </div>
                </div>

                {/* Tags Filter */}
                {allTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider py-1">{t('form.tags')}:</span>
                        {allTags.map(tag => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTags(prev =>
                                        isSelected ? prev.filter(t => t !== tag) : [...prev, tag]
                                    )}
                                    className={clsx(
                                        "px-2 py-0.5 rounded text-xs font-mono border transition-all",
                                        isSelected
                                            ? "bg-amber-500 text-black border-amber-600 font-bold"
                                            : "bg-[var(--background)] text-[var(--foreground-muted)] border-[var(--border)] hover:border-amber-500/50 hover:text-[var(--foreground)]"
                                    )}
                                >
                                    #{tag}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add/Edit Service Form */}
            {(isAddingService || editingServiceId) && (
                <div className="p-4 bg-[var(--surface)] border border-amber-500/30 rounded space-y-4 shadow-xl mb-6">
                    <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest font-mono flex items-center gap-2">
                        {editingServiceId ? t('actions.edit') : t('actions.create')}
                        {addingChildTo ? (
                            <span className="flex items-center gap-1 text-[var(--foreground)] opacity-70">
                                <ChevronRight className="w-3 h-3" />
                                Child of {config.services.find(s => s.id === addingChildTo)?.name}
                            </span>
                        ) : ": SERVICE"}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1 font-mono">{t('form.label')} <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={serviceForm.name || ''}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    setServiceForm(prev => ({
                                        ...prev,
                                        name,
                                        id: editingServiceId ? prev.id : (
                                            // Prefix child ID with parent ID for uniqueness/clarity? Optional but good for collision avoidance
                                            // addingChildTo ? `${addingChildTo}-${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}` : 
                                            name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                        )
                                    }));
                                }}
                                placeholder={t('form.placeholders.service_name')}
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                                autoFocus
                            />
                        </div>

                        {editingServiceId && (
                            <div>
                                <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1 font-mono">ID <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={serviceForm.id || ''}
                                    onChange={(e) => setServiceForm({ ...serviceForm, id: e.target.value })}
                                    disabled={true}
                                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] text-sm focus:outline-none focus:border-amber-500/50 transition-all font-mono opacity-60 cursor-not-allowed"
                                />
                            </div>
                        )}

                        {!addingChildTo && (
                            <div>
                                <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1 font-mono">{t('form.group')}</label>
                                <input
                                    type="text"
                                    list="groups"
                                    value={serviceForm.group || ''}
                                    onChange={(e) => setServiceForm({ ...serviceForm, group: e.target.value })}
                                    placeholder={t('form.placeholders.group_example')}
                                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] text-sm focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                                />
                                <datalist id="groups">
                                    {groups.map((g: string) => <option key={g} value={g} />)}
                                </datalist>
                            </div>
                        )}

                        <div className={addingChildTo ? "col-span-full" : ""}>
                            <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1 font-mono">{t('form.description')}</label>
                            <input
                                type="text"
                                value={serviceForm.description || ''}
                                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                placeholder={t('form.placeholders.description_optional')}
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button onClick={resetServiceForm} className="px-4 py-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] flex items-center gap-2 text-sm font-mono font-bold uppercase tracking-widest transition-colors">
                            <X className="w-4 h-4" />{t('actions.cancel')}
                        </button>
                        <button
                            onClick={editingServiceId ? handleUpdateService : handleAddService}
                            disabled={!serviceForm.id || !serviceForm.name}
                            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-[var(--surface-hover)] disabled:text-[var(--foreground-muted)] disabled:opacity-50 text-black rounded font-bold transition-all flex items-center gap-2 text-sm"
                        >
                            <Check className="w-4 h-4" />{editingServiceId ? t('actions.save') : t('actions.add_new')}
                        </button>
                    </div>
                </div>
            )}

            {/* Service List */}
            <div className="space-y-2">
                {filteredServices.length === 0 ? (
                    <div className="text-center py-10 text-[var(--foreground-muted)] opacity-50 border border-dashed border-[var(--border)] rounded bg-[var(--surface)] text-sm font-mono uppercase tracking-tighter">
                        {searchQuery ? t('app.no_matches_found') : t('settings.services.no_services_defined')}
                    </div>
                ) : (
                    filteredServices.map((service) => {
                        const isExpanded = expandedService === service.id;
                        const childServices = getChildServices(service.id);
                        const linkCount = service.links?.length || 0;
                        const childCount = childServices.length;

                        return (
                            <div key={service.id} className="rounded border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                                {/* Service Header */}
                                <div className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--surface-hover)] transition-colors">
                                    <button
                                        onClick={() => setExpandedService(isExpanded ? null : service.id)}
                                        className="flex-1 flex items-center gap-3 text-left"
                                    >
                                        {isExpanded ? <ChevronDown className="w-4 h-4 text-[var(--foreground-muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)]" />}
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-[var(--foreground)] text-sm tracking-tight">{service.name}</span>

                                            <div className="flex gap-2">
                                                {linkCount > 0 && (
                                                    <span className="text-xs text-[var(--foreground-muted)] font-mono uppercase border border-[var(--border)] px-1.5 rounded">{linkCount} Links</span>
                                                )}
                                                {childCount > 0 && (
                                                    <span className="text-xs text-blue-400/80 font-mono uppercase border border-blue-500/20 bg-blue-500/5 px-1.5 rounded">{childCount} Children</span>
                                                )}
                                            </div>

                                            {service.group && (
                                                <span className="text-xs text-amber-500/60 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 font-mono uppercase">
                                                    {service.group}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => { setEditingServiceId(service.id); setServiceForm(service); }}
                                            className="p-1.5 text-[var(--foreground-muted)] hover:text-amber-600 dark:hover:text-amber-500 rounded transition-colors"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => removeService(service.id)}
                                            className="p-1.5 text-[var(--foreground-muted)] hover:text-red-500 rounded transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded: Links & Children */}
                                {isExpanded && (
                                    <div className="border-t border-[var(--border)] p-4 bg-[var(--background)] space-y-6">

                                        {/* Child Services Section */}
                                        <div className="space-y-3">
                                            {childServices.length > 0 && (
                                                <div className="space-y-2">
                                                    <h4 className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider flex items-center gap-2 mb-3">
                                                        <GitFork className="w-3.5 h-3.5" />
                                                        Child Services
                                                    </h4>

                                                    <div className="space-y-1 pl-1">
                                                        {childServices.map(child => (
                                                            <div key={child.id} className="group flex items-center justify-between py-2 px-3 hover:bg-[var(--surface-hover)] rounded-md border border-transparent hover:border-[var(--border)] transition-all">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-bold text-sm text-[var(--foreground)]">{child.name}</span>
                                                                            {child.group && (
                                                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground-muted)] uppercase tracking-wider opacity-70">
                                                                                    {child.group}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-xs text-[var(--foreground-muted)] font-mono opacity-60 mt-0.5 flex items-center gap-2">
                                                                            <span>{child.id}</span>
                                                                            {child.description && (
                                                                                <>
                                                                                    <span className="w-0.5 h-0.5 bg-[var(--foreground-muted)] rounded-full"></span>
                                                                                    <span className="truncate max-w-[200px]">{child.description}</span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => { setEditingServiceId(child.id); setServiceForm(child); setAddingChildTo(service.id); }}
                                                                        className="p-1.5 text-[var(--foreground-muted)] hover:text-amber-500 hover:bg-amber-500/10 rounded transition-colors"
                                                                        title={t('actions.edit')}
                                                                    >
                                                                        <Pencil className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => removeService(child.id)}
                                                                        className="p-1.5 text-[var(--foreground-muted)] hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                                                        title={t('actions.delete')}
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="h-px bg-[var(--border)] w-full opacity-50"></div>

                                        {/* Links Section */}
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider flex items-center gap-2">
                                                <Link2 className="w-3.5 h-3.5" />
                                                Resource Links
                                            </h4>

                                            {/* Add Link Button */}
                                            {isAddingLink !== service.id && !editingLinkId && (
                                                <button
                                                    onClick={() => { setIsAddingLink(service.id); setLinkForm({}); setAddingChildLinkTo(null); }}
                                                    className="w-full py-2 border border-dashed border-[var(--border)] hover:border-amber-500/30 text-[var(--foreground-muted)] hover:text-amber-500 rounded text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all font-mono"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    {t('actions.add_resource_link')}
                                                </button>
                                            )}

                                            {/* Add/Edit Link Form */}
                                            {(isAddingLink === service.id || editingLinkId) && (
                                                <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded space-y-3 font-mono relative">
                                                    {addingChildLinkTo && (
                                                        <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded">
                                                            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                                                                <GitFork className="w-3 h-3" />
                                                                {editingLinkId ? "Editing Child of:" : "Adding Child Link To:"}
                                                            </div>
                                                            {(() => {
                                                                const parentLink = service.links?.find(l => l.id === addingChildLinkTo);
                                                                if (parentLink) {
                                                                    return (
                                                                        <div className="flex flex-col gap-0.5 ml-4">
                                                                            <span className="text-sm font-bold text-[var(--foreground)]">{parentLink.name}</span>
                                                                            <span className="text-xs text-[var(--foreground-muted)] truncate">{parentLink.url}</span>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                        </div>
                                                    )}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        <div className={addingChildLinkTo ? "md:col-span-3" : ""}>
                                                            <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1">{t('form.label')}</label>
                                                            <input
                                                                type="text"
                                                                value={linkForm.name || ''}
                                                                onChange={(e) => {
                                                                    const name = e.target.value;
                                                                    setLinkForm(prev => ({
                                                                        ...prev,
                                                                        name,
                                                                        id: editingLinkId ? prev.id : name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                                                    }));
                                                                }}
                                                                placeholder={t('form.placeholders.link_name_example')}
                                                                className="w-full px-2 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] placeholder:opacity-50 focus:outline-none focus:border-amber-500/50"
                                                                autoFocus
                                                            />
                                                        </div>
                                                        {!addingChildLinkTo && (
                                                            <div>
                                                                <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1">{t('app.columns')}</label>
                                                                <select
                                                                    value={linkForm.columnId || ''}
                                                                    onChange={(e) => setLinkForm({ ...linkForm, columnId: e.target.value })}
                                                                    className="w-full px-2 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-sm text-[var(--foreground)] focus:outline-none focus:border-amber-500/50"
                                                                >
                                                                    <option value="">{t('settings.services.select_column')}</option>
                                                                    {config.columns.map((c) => (
                                                                        <option key={c.id} value={c.id}>{c.title}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1">{t('form.url')}</label>
                                                        <input
                                                            type="text"
                                                            value={linkForm.url || ''}
                                                            onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                                                            placeholder={t('form.placeholders.url_example')}
                                                            className="w-full px-2 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] placeholder:opacity-50 focus:outline-none focus:border-amber-500/50 font-mono"
                                                        />
                                                    </div>
                                                    {!addingChildLinkTo && (
                                                        <div>
                                                            <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-2">{t('form.environments')}</label>
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
                                                                            "px-2 py-1 text-xs rounded transition-all uppercase tracking-tighter border",
                                                                            linkForm.environments?.includes(env)
                                                                                ? "bg-amber-500 text-black border-amber-600"
                                                                                : "bg-[var(--background)] text-[var(--foreground-muted)] border-[var(--border)] hover:border-[var(--foreground-muted)]"
                                                                        )}
                                                                    >
                                                                        {env}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-end gap-2 pt-1">
                                                        <button onClick={resetLinkForm} className="text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] uppercase px-2 py-1 font-bold tracking-widest transition-colors font-mono">
                                                            {t('actions.cancel')}
                                                        </button>
                                                        <button
                                                            onClick={() => editingLinkId ? handleUpdateLink(service.id) : handleAddLink(service.id)}
                                                            disabled={!linkForm.id || !linkForm.name || !linkForm.url || !linkForm.columnId}
                                                            className="bg-amber-500/90 hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-widest px-3 py-1 rounded transition-all disabled:opacity-20 font-mono"
                                                        >
                                                            {editingLinkId ? t('actions.update') : t('actions.commit')}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Link List */}
                                            <div className="space-y-1">
                                                {(() => {
                                                    const renderLinks = (links: ServiceLink[], depth = 0, parentLink?: ServiceLink): React.ReactNode[] => {
                                                        return links.map((link) => {
                                                            const column = config.columns.find((c) => c.id === link.columnId);
                                                            const hasChildren = link.children && link.children.length > 0;

                                                            return (
                                                                <div key={link.id} className="space-y-1">
                                                                    <div
                                                                        className={clsx(
                                                                            "flex items-center justify-between px-3 py-2 bg-[var(--surface-hover)] border border-[var(--border)] rounded group/link transition-all",
                                                                            depth > 0 && "ml-6 border-l-4 border-l-[var(--border)]"
                                                                        )}
                                                                    >
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2">
                                                                                {hasChildren ? (
                                                                                    <button
                                                                                        onClick={() => toggleLinkExpanded(link.id)}
                                                                                        className="p-0.5 rounded hover:bg-[var(--surface)] text-[var(--foreground-muted)] transition-colors"
                                                                                    >
                                                                                        {expandedLinks.has(link.id) ? (
                                                                                            <ChevronDown className="w-3 h-3" />
                                                                                        ) : (
                                                                                            <ChevronRight className="w-3 h-3" />
                                                                                        )}
                                                                                    </button>
                                                                                ) : (
                                                                                    <Link2 className="w-3 h-3 text-[var(--foreground-muted)]" />
                                                                                )}
                                                                                <span className="font-bold text-[var(--foreground)] text-xs tracking-tight">{link.name}</span>
                                                                                {column && (
                                                                                    <span className="text-xs px-1.5 py-0.5 bg-[var(--surface)] text-[var(--foreground-muted)] rounded font-mono uppercase border border-[var(--border)]">
                                                                                        {column.title}
                                                                                    </span>
                                                                                )}
                                                                                {link.environments && link.environments.length > 0 && (
                                                                                    <div className="flex gap-1">
                                                                                        {link.environments.map((env: string) => (
                                                                                            <span key={env} className="text-xs px-1 py-0.5 bg-amber-500/5 text-amber-500/50 rounded font-mono uppercase tracking-tighter border border-amber-500/10">
                                                                                                {env}
                                                                                            </span>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="text-xs text-[var(--foreground-muted)] font-mono truncate mt-0.5">{link.url}</div>
                                                                        </div>
                                                                        <div className="flex gap-1 opacity-0 group-hover/link:opacity-100 transition-opacity">
                                                                            {depth === 0 && (
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setIsAddingLink(service.id);
                                                                                        setLinkForm({ columnId: link.columnId, environments: link.environments });
                                                                                        setAddingChildLinkTo(link.id);
                                                                                    }}
                                                                                    className="p-1 text-[var(--foreground-muted)] hover:text-blue-500 rounded"
                                                                                    title="Add Child Link"
                                                                                >
                                                                                    <GitFork className="w-3 h-3" />
                                                                                </button>
                                                                            )}
                                                                            <button
                                                                                onClick={() => startEditLink(link, parentLink?.id)}
                                                                                className="p-1 text-[var(--foreground-muted)] hover:text-amber-600 dark:hover:text-amber-500 rounded"
                                                                            >
                                                                                <Pencil className="w-3 h-3" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => removeServiceLink(service.id, link.id)}
                                                                                className="p-1 text-[var(--foreground-muted)] hover:text-red-500 rounded"
                                                                            >
                                                                                <Trash2 className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Recursive Children */}
                                                                    {hasChildren && expandedLinks.has(link.id) && renderLinks(link.children!, depth + 1, link)}
                                                                </div>
                                                            );
                                                        });
                                                    };

                                                    return renderLinks(service.links || []);
                                                })()}
                                            </div>

                                            {linkCount === 0 && isAddingLink !== service.id && (
                                                <p className="text-center text-[var(--foreground-muted)] opacity-50 text-xs py-4 font-mono font-bold uppercase tracking-widest">
                                                    {t('settings.services.no_links_defined')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div >

            <div className="h-4"></div>
        </div >
    );
};
