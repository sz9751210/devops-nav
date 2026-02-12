import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigationStore } from '../../store/useMatrixStore';
import { useToastStore } from '../../store/useToastStore';
import type { ServiceDefinition, ServiceLink } from '../../types/schema';
import { Plus, Trash2, Package, Pencil, X, Check, Search, ChevronDown, ChevronRight, Link2, GitFork, LayoutGrid, List, GripVertical, Layers } from 'lucide-react';
import { clsx } from 'clsx';
import { v4 as uuidv4 } from 'uuid';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const ServiceSettings: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { config, addService, updateService, removeService, addServiceLink, updateServiceLink, removeServiceLink, reorderServices } = useNavigationStore();
    const { addToast } = useToastStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
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

    const groupedServices = useMemo(() => {
        const groups: Record<string, typeof filteredServices> = {};
        const uncategorized: typeof filteredServices = [];

        filteredServices.forEach(service => {
            if (service.group) {
                if (!groups[service.group]) groups[service.group] = [];
                groups[service.group].push(service);
            } else {
                uncategorized.push(service);
            }
        });

        const sortedGroupNames = Object.keys(groups).sort();

        return {
            groups: sortedGroupNames.map(name => ({ name, services: groups[name] })),
            uncategorized
        };
    }, [filteredServices]);

    const getChildServiceCount = (serviceId: string) => {
        return config.services.filter(s => s.parentId === serviceId).length;
    };

    // Get children for a specific parent
    const getChildServices = (parentId: string) => {
        return config.services.filter(s => s.parentId === parentId);
    };

    // --- Drag and Drop Logic ---
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = config.services.findIndex((item) => item.id === active.id);
            const newIndex = config.services.findIndex((item) => item.id === over?.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                reorderServices(arrayMove(config.services, oldIndex, newIndex));
            }
        }
    };

    // Disable DND when filters or grid view are active
    const isDndEnabled = !searchQuery && !selectedGroup && selectedTags.length === 0 && viewMode !== 'grid';

    // Helper: get display name based on language
    const getDisplayName = (item: { name: string; nameZh?: string }) => {
        const isZh = i18n.language.startsWith('zh');
        return (isZh && item.nameZh) ? item.nameZh : item.name;
    };

    // --- Shared Link Editor ---
    const renderLinkEditor = (service: ServiceDefinition) => {
        const linkCount = service.links?.length || 0;

        const renderLinks = (links: ServiceLink[], depth = 0, parentLink?: ServiceLink): React.ReactNode[] => {
            return links.map((link) => {
                const column = config.columns.find((c) => c.id === link.columnId);
                const hasChildren = link.children && link.children.length > 0;
                const linkDisplayName = getDisplayName(link);

                return (
                    <div key={link.id} className="space-y-1">
                        <div
                            className={clsx(
                                "flex items-center justify-between px-3 py-2.5 bg-[var(--surface-hover)] border border-[var(--border)] rounded-md group/link transition-all hover:border-amber-500/20",
                                depth > 0 && "ml-6 border-l-2 border-l-blue-500/30"
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
                                                <ChevronDown className="w-3.5 h-3.5" />
                                            ) : (
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    ) : (
                                        <Link2 className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
                                    )}
                                    <span className="font-semibold text-[var(--foreground)] text-sm">{linkDisplayName}</span>
                                    {column && (
                                        <span className="text-xs px-1.5 py-0.5 bg-amber-500/5 text-amber-500/70 rounded font-mono uppercase border border-amber-500/10">
                                            {column.title}
                                        </span>
                                    )}
                                    {link.environments && link.environments.length > 0 && (
                                        <div className="flex gap-1">
                                            {link.environments.map((env: string) => (
                                                <span key={env} className="text-xs px-1.5 py-0.5 bg-emerald-500/5 text-emerald-500/60 rounded font-mono uppercase tracking-tighter border border-emerald-500/10">
                                                    {env}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs text-[var(--foreground-muted)] font-mono truncate mt-1 opacity-60">{link.url}</div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover/link:opacity-100 transition-opacity ml-2">
                                {depth === 0 && (
                                    <button
                                        onClick={() => {
                                            setIsAddingLink(service.id);
                                            setLinkForm({ columnId: link.columnId, environments: link.environments });
                                            setAddingChildLinkTo(link.id);
                                        }}
                                        className="p-1.5 text-[var(--foreground-muted)] hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                                        title="Add Child Link"
                                    >
                                        <GitFork className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => startEditLink(link, parentLink?.id)}
                                    className="p-1.5 text-[var(--foreground-muted)] hover:text-amber-500 hover:bg-amber-500/10 rounded transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm(t('confirm.delete_link', { name: link.name }))) {
                                            removeServiceLink(service.id, link.id);
                                            addToast({
                                                type: 'success',
                                                title: t('actions.success'),
                                                message: t('settings.services.link_deleted', 'Link deleted successfully'),
                                            });
                                        }
                                    }}
                                    className="p-1.5 text-[var(--foreground-muted)] hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                        {hasChildren && expandedLinks.has(link.id) && renderLinks(link.children!, depth + 1, link)}
                    </div>
                );
            });
        };

        return (
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5" />
                    {i18n.language.startsWith('zh') ? '資源連結' : 'Resource Links'}
                </h4>

                {/* Add Link Button */}
                {isAddingLink !== service.id && !editingLinkId && (
                    <button
                        onClick={() => { setIsAddingLink(service.id); setLinkForm({}); setAddingChildLinkTo(null); }}
                        className="w-full py-2.5 border border-dashed border-[var(--border)] hover:border-amber-500/30 text-[var(--foreground-muted)] hover:text-amber-500 rounded-md text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all font-mono hover:bg-amber-500/5"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        {t('actions.add_resource_link')}
                    </button>
                )}

                {/* Add/Edit Link Form */}
                {(isAddingLink === service.id || editingLinkId) && (
                    <div className="p-4 bg-[var(--surface)] border border-amber-500/20 rounded-md space-y-3 font-mono relative">
                        {addingChildLinkTo && (
                            <div className="mb-3 p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-md">
                                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                                    <GitFork className="w-3 h-3" />
                                    {editingLinkId
                                        ? (i18n.language.startsWith('zh') ? '編輯子連結：' : 'Editing Child of:')
                                        : (i18n.language.startsWith('zh') ? '新增子連結至：' : 'Adding Child Link To:')}
                                </div>
                                {(() => {
                                    const parentLink = service.links?.find(l => l.id === addingChildLinkTo);
                                    if (parentLink) {
                                        return (
                                            <div className="flex flex-col gap-0.5 ml-4">
                                                <span className="text-sm font-bold text-[var(--foreground)]">{getDisplayName(parentLink)}</span>
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
                                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-md text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] placeholder:opacity-50 focus:outline-none focus:border-amber-500/50 transition-all"
                                    autoFocus
                                />
                            </div>
                            <div className={addingChildLinkTo ? "md:col-span-3" : ""}>
                                <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1">{t('form.label_zh')}</label>
                                <input
                                    type="text"
                                    value={linkForm.nameZh || ''}
                                    onChange={(e) => setLinkForm({ ...linkForm, nameZh: e.target.value })}
                                    placeholder={t('form.placeholders.link_name_example')}
                                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-md text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] placeholder:opacity-50 focus:outline-none focus:border-amber-500/50 transition-all"
                                />
                            </div>
                            {!addingChildLinkTo && (
                                <div>
                                    <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1">{t('app.columns')}</label>
                                    <select
                                        value={linkForm.columnId || ''}
                                        onChange={(e) => setLinkForm({ ...linkForm, columnId: e.target.value })}
                                        className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-md text-sm text-[var(--foreground)] focus:outline-none focus:border-amber-500/50 transition-all"
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
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-md text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] placeholder:opacity-50 focus:outline-none focus:border-amber-500/50 font-mono transition-all"
                            />
                        </div>
                        {!addingChildLinkTo && (
                            <div>
                                <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-2">{t('form.environments')}</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {config.environments.map((env: string) => (
                                        <button
                                            key={env}
                                            onClick={() => {
                                                const current = linkForm.environments || [];
                                                const next = current.includes(env) ? current.filter(e => e !== env) : [...current, env];
                                                setLinkForm({ ...linkForm, environments: next.length ? next : undefined });
                                            }}
                                            className={clsx(
                                                "px-2.5 py-1 text-xs rounded-md transition-all uppercase tracking-tighter border font-medium",
                                                linkForm.environments?.includes(env)
                                                    ? "bg-amber-500 text-black border-amber-600"
                                                    : "bg-[var(--background)] text-[var(--foreground-muted)] border-[var(--border)] hover:border-amber-500/50 hover:text-amber-500"
                                            )}
                                        >
                                            {env}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                            <button onClick={resetLinkForm} className="text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] uppercase px-3 py-1.5 font-bold tracking-widest transition-colors font-mono rounded-md hover:bg-[var(--surface-hover)]">
                                {t('actions.cancel')}
                            </button>
                            <button
                                onClick={() => editingLinkId ? handleUpdateLink(service.id) : handleAddLink(service.id)}
                                disabled={!linkForm.id || !linkForm.name || !linkForm.url || !linkForm.columnId}
                                className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-md transition-all disabled:opacity-20 font-mono"
                            >
                                {editingLinkId ? t('actions.update') : t('actions.commit')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Link List */}
                <div className="space-y-1.5">
                    {renderLinks(service.links || [])}
                </div>

                {linkCount === 0 && isAddingLink !== service.id && (
                    <div className="text-center py-6 text-[var(--foreground-muted)] opacity-40 border border-dashed border-[var(--border)] rounded-md">
                        <Link2 className="w-5 h-5 mx-auto mb-2" />
                        <p className="text-xs font-mono font-bold uppercase tracking-widest">
                            {t('settings.services.no_links_defined')}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    // --- Sortable Item Component ---
    const SortableServiceItem = ({ service }: { service: ServiceDefinition }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging
        } = useSortable({ id: service.id, disabled: !isDndEnabled });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            zIndex: isDragging ? 10 : 1,
            opacity: isDragging ? 0.5 : 1,
        };

        const childServices = getChildServices(service.id);
        const linkCount = service.links?.length || 0;
        const childCount = childServices.length;
        const isExpanded = expandedService === service.id;
        const displayName = getDisplayName(service);

        return (
            <div ref={setNodeRef} style={style} className="glass-panel rounded-lg overflow-hidden">
                {/* Service Header */}
                <div className="flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-hover)]/50 transition-colors">
                    {isDndEnabled && (
                        <div
                            {...attributes}
                            {...listeners}
                            className="mr-3 cursor-grab active:cursor-grabbing text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                        >
                            <GripVertical className="w-5 h-5" />
                        </div>
                    )}
                    <button
                        onClick={() => setExpandedService(isExpanded ? null : service.id)}
                        className="flex-1 flex items-center gap-3 text-left min-w-0"
                    >
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-amber-500" /> : <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)]" />}
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="font-semibold text-[var(--foreground)] text-base tracking-tight truncate">{displayName}</span>

                            <div className="flex gap-2 shrink-0">
                                {linkCount > 0 && (
                                    <span className="text-xs text-[var(--foreground-muted)] font-mono uppercase border border-[var(--border)] px-1.5 py-0.5 rounded hidden sm:inline-flex items-center gap-1">
                                        <Link2 className="w-3 h-3" />
                                        {linkCount}
                                    </span>
                                )}
                                {childCount > 0 && (
                                    <span className="text-xs text-blue-400/80 font-mono uppercase border border-blue-500/20 bg-blue-500/5 px-1.5 py-0.5 rounded hidden sm:inline-flex items-center gap-1">
                                        <GitFork className="w-3 h-3" />
                                        {childCount}
                                    </span>
                                )}
                            </div>

                            {service.group && (
                                <span className="text-xs text-amber-500/60 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 font-mono uppercase truncate max-w-[120px] hidden sm:inline-block">
                                    {service.group}
                                </span>
                            )}
                        </div>
                    </button>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); setEditingServiceId(service.id); setServiceForm(service); setIsAddingService(true); }}
                            className="p-1.5 text-[var(--foreground-muted)] hover:text-amber-500 hover:bg-amber-500/10 rounded transition-colors"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(t('confirm.delete_service', { name: service.name }))) {
                                    removeService(service.id);
                                    addToast({ type: 'success', title: t('actions.success'), message: t('settings.services.deleted', 'Service deleted successfully') });
                                }
                            }}
                            className="p-1.5 text-[var(--foreground-muted)] hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Expanded: Links & Children (No Dragging for inner content yet) */}
                {isExpanded && (
                    <div className="border-t border-[var(--border)] p-5 bg-[var(--background)] space-y-6 cursor-default">
                        {/* Child Services Section */}
                        {childServices.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider flex items-center gap-2">
                                    <GitFork className="w-3.5 h-3.5" />
                                    {i18n.language.startsWith('zh') ? '子服務' : 'Child Services'}
                                </h4>

                                <div className="space-y-1 pl-1">
                                    {childServices.map(child => (
                                        <div key={child.id} className="group flex items-center justify-between py-2.5 px-3 hover:bg-[var(--surface-hover)] rounded-md border border-transparent hover:border-[var(--border)] transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm text-[var(--foreground)]">{getDisplayName(child)}</span>
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
                                                    onClick={() => {
                                                        if (window.confirm(t('confirm.delete_service', { name: child.name }))) {
                                                            removeService(child.id);
                                                            addToast({ type: 'success', title: t('actions.success'), message: t('settings.services.deleted', 'Service deleted successfully') });
                                                        }
                                                    }}
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

                        {childServices.length > 0 && <div className="h-px bg-[var(--border)] w-full opacity-50"></div>}

                        {/* Links Section — shared */}
                        {renderLinkEditor(service)}
                    </div>
                )}
            </div>
        );
    };

    const renderGroupedServiceCard = (service: ServiceDefinition) => {
        const linkCount = service.links?.length || 0;
        const childCount = getChildServiceCount(service.id);
        const isZh = i18n.language.startsWith('zh');
        const displayName = (isZh && service.nameZh) ? service.nameZh : service.name;
        const isExpanded = expandedService === service.id;

        return (
            <div
                key={service.id}
                className={clsx(
                    "group relative bg-[#18181b] border border-[#27272a] rounded-lg hover:border-amber-500/30 transition-all shadow-sm hover:scale-[1.01]",
                    isExpanded && "col-span-full"
                )}
            >
                <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                                <Layers className="w-6 h-6 text-amber-500" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-white text-lg truncate mb-0.5">
                                    {displayName}
                                </h3>
                                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-none">
                                    {service.id}
                                </div>
                                {service.description && (
                                    <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{service.description}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => { setEditingServiceId(service.id); setServiceForm(service); setIsAddingService(true); }}
                                className="p-1.5 text-[var(--foreground-muted)] hover:text-amber-500 rounded bg-[var(--surface-hover)]"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm(t('confirm.delete_service', { name: service.name }))) {
                                        removeService(service.id);
                                        addToast({ type: 'success', title: t('actions.success'), message: t('settings.services.deleted', 'Service deleted successfully') });
                                    }
                                }}
                                className="p-1.5 text-[var(--foreground-muted)] hover:text-red-500 rounded bg-[var(--surface-hover)]"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-[#27272a]/50 pt-4 mt-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-zinc-400 font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Link2 className="w-4 h-4" />
                                    <span>{linkCount} {t('settings.services.links_count')}</span>
                                </div>
                                {childCount > 0 && (
                                    <div className="flex items-center gap-1.5 text-blue-400">
                                        <GitFork className="w-4 h-4" />
                                        <span>{childCount} Children</span>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setExpandedService(isExpanded ? null : service.id)}
                                className={clsx(
                                    "text-xs font-bold uppercase tracking-widest font-mono transition-colors",
                                    isExpanded ? "text-amber-500" : "text-amber-500/60 hover:text-amber-500"
                                )}
                            >
                                {isExpanded
                                    ? (isZh ? '收合連結' : 'Close Links')
                                    : (isZh ? '編輯連結' : 'Edit Links')
                                }
                            </button>
                        </div>
                    </div>
                </div>

                {/* Expanded Link Editing Panel — shared */}
                {isExpanded && (
                    <div className="border-t border-[#27272a] p-5 space-y-3 bg-[#111113]">
                        {renderLinkEditor(service)}
                    </div>
                )}
            </div>
        );
    };

    // Service form handles
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
                addToast({
                    type: 'error',
                    title: t('actions.error'),
                    message: t('settings.services.id_exists', 'Service ID already exists'),
                });
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
            addToast({
                type: 'success',
                title: t('actions.success'),
                message: t('settings.services.created', 'Service created successfully'),
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
            addToast({
                type: 'success',
                title: t('actions.success'),
                message: t('settings.services.updated', 'Service updated successfully'),
            });
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
            addToast({
                type: 'success',
                title: t('actions.success'),
                message: t('settings.services.link_added', 'Link added successfully'),
            });
            resetLinkForm();
        }
    };

    const handleUpdateLink = (serviceId: string) => {
        if (editingLinkId) {
            updateServiceLink(serviceId, editingLinkId, linkForm);
            addToast({
                type: 'success',
                title: t('actions.success'),
                message: t('settings.services.link_updated', 'Link updated successfully'),
            });
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
                        <span className="text-xs font-medium text-amber-500/80 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            {config.services.length}
                        </span>
                    </h2>
                    <p className="text-sm text-[var(--foreground-muted)] mt-1">
                        {t('settings.services.subtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-[var(--surface)] border border-[var(--border)] rounded-md p-0.5">
                        <button
                            onClick={() => setViewMode('list')}
                            className={clsx(
                                "p-1.5 rounded-sm transition-all",
                                viewMode === 'list'
                                    ? "bg-[var(--surface-hover)] text-[var(--foreground)] shadow-sm"
                                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                            )}
                            title={t('actions.view_list')}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={clsx(
                                "p-1.5 rounded-sm transition-all",
                                viewMode === 'grid'
                                    ? "bg-[var(--surface-hover)] text-[var(--foreground)] shadow-sm"
                                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                            )}
                            title={t('actions.view_grid')}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
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
                            className="w-full pl-10 pr-8 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-[var(--foreground-muted)] text-sm focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="relative min-w-[200px]">
                        <select
                            value={selectedGroup || ''}
                            onChange={(e) => {
                                setSelectedGroup(e.target.value || null);
                            }}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                            name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                        )
                                    }));
                                }}
                                placeholder={t('form.placeholders.service_name')}
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1 font-mono">{t('form.label_zh')}</label>
                            <input
                                type="text"
                                value={serviceForm.nameZh || ''}
                                onChange={(e) => setServiceForm({ ...serviceForm, nameZh: e.target.value })}
                                placeholder={t('form.placeholders.service_name')}
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] text-sm focus:outline-none focus:border-amber-500/50 transition-all"
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

            {/* Service List / Grid */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="space-y-4">
                    {filteredServices.length === 0 ? (
                        <div className="text-center py-10 text-[var(--foreground-muted)] opacity-50 border border-dashed border-[var(--border)] rounded bg-[var(--surface)] text-sm font-mono uppercase tracking-tighter">
                            {searchQuery ? t('app.no_matches_found') : t('settings.services.no_services_defined')}
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="space-y-10">
                            {!selectedGroup && groupedServices.groups.length > 0 ? (
                                <>
                                    {groupedServices.groups.map(group => (
                                        <div key={group.name} className="space-y-6">
                                            <h2 className="text-2xl font-bold text-white flex items-center pb-4 border-b border-zinc-800/50">
                                                <Layers className="w-6 h-6 text-amber-500 mr-3" />
                                                {group.name}
                                                <span className="text-sm font-medium text-zinc-400 ml-3 bg-zinc-800 w-8 h-8 flex items-center justify-center rounded-full">
                                                    {group.services.length}
                                                </span>
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {group.services.map(service => renderGroupedServiceCard(service))}
                                            </div>
                                        </div>
                                    ))}

                                    {groupedServices.uncategorized.length > 0 && (
                                        <div className="space-y-6">
                                            <h2 className="text-2xl font-bold text-white flex items-center pb-4 border-b border-zinc-800/50 opacity-70">
                                                <Layers className="w-6 h-6 text-zinc-500 mr-3" />
                                                {t('applications.ungrouped')}
                                                <span className="text-sm font-medium text-zinc-400 ml-3 bg-zinc-800 w-8 h-8 flex items-center justify-center rounded-full">
                                                    {groupedServices.uncategorized.length}
                                                </span>
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {groupedServices.uncategorized.map(service => renderGroupedServiceCard(service))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredServices.map(service => renderGroupedServiceCard(service))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <SortableContext
                            items={filteredServices.map(s => s.id)}
                            strategy={rectSortingStrategy}
                        >
                            {!selectedGroup && groupedServices.groups.length > 0 ? (
                                <div className="space-y-8">
                                    {groupedServices.groups.map(group => (
                                        <div key={group.name} className="space-y-2">
                                            <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2 pb-2 border-b border-[var(--border)]">
                                                <Layers className="w-5 h-5 text-amber-500" />
                                                {group.name}
                                                <span className="text-xs font-medium text-amber-500/80 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                                                    {group.services.length}
                                                </span>
                                            </h2>
                                            {group.services.map(service => (
                                                <SortableServiceItem key={service.id} service={service} />
                                            ))}
                                        </div>
                                    ))}

                                    {groupedServices.uncategorized.length > 0 && (
                                        <div className="space-y-2">
                                            <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2 pb-2 border-b border-[var(--border)] opacity-50">
                                                <Layers className="w-5 h-5 text-zinc-500" />
                                                {t('applications.ungrouped')}
                                                <span className="text-xs font-medium text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                                                    {groupedServices.uncategorized.length}
                                                </span>
                                            </h2>
                                            {groupedServices.uncategorized.map(service => (
                                                <SortableServiceItem key={service.id} service={service} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                filteredServices.map((service) => (
                                    <SortableServiceItem key={service.id} service={service} />
                                ))
                            )}
                        </SortableContext>
                    )}
                </div >
            </DndContext>

            <div className="h-4"></div>
        </div >
    );
};
