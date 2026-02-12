import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigationStore } from '../../store/useMatrixStore';
import { Search, Hammer, Star, Server, Layers, LayoutList, LayoutGrid, Box } from 'lucide-react';
import { clsx } from 'clsx';
import { ServiceDetail } from './ServiceDetail';

export const ServicesPage: React.FC = () => {
    const { t } = useTranslation();
    const { config, isFavoriteService, toggleFavoriteService } = useNavigationStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grouped'>('grouped');

    // Derived State
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        config.services.forEach(s => s.tags?.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, [config.services]);

    const allGroups = useMemo(() => {
        const groups = new Set<string>();
        config.services.forEach(s => {
            if (s.group) groups.add(s.group);
        });
        return Array.from(groups).sort();
    }, [config.services]);

    const hasUncategorized = useMemo(() => {
        return config.services.some(s => !s.group && !s.parentId);
    }, [config.services]);

    const filteredServices = useMemo(() => {
        return config.services.filter(s => {
            if (s.parentId) return false; // Hide child services from main dashboard

            if (selectedGroup === '__UNCATEGORIZED__') {
                if (s.group) return false;
            } else if (selectedGroup && s.group !== selectedGroup) {
                return false;
            }

            if (selectedTags.length > 0) {
                if (!s.tags || !selectedTags.every(tag => s.tags?.includes(tag))) return false;
            }

            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    s.name.toLowerCase().includes(query) ||
                    s.id.toLowerCase().includes(query) ||
                    s.description?.toLowerCase().includes(query) ||
                    s.tags?.some(t => t.toLowerCase().includes(query)) ||
                    s.links?.some(l => l.name.toLowerCase().includes(query))
                );
            }

            return true;
        });
    }, [config.services, searchQuery, selectedTags, selectedGroup]);

    // Grouping Logic
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

        // Sort groups alphabetically
        const sortedGroupNames = Object.keys(groups).sort();

        return {
            groups: sortedGroupNames.map(name => ({ name, services: groups[name] })),
            uncategorized
        };
    }, [filteredServices]);

    const selectedService = useMemo(() =>
        config.services.find(s => s.id === selectedServiceId),
        [config.services, selectedServiceId]);

    const getChildServiceCount = (serviceId: string) => {
        return config.services.filter(s => s.parentId === serviceId).length;
    };

    const renderServiceCard = (service: any) => {
        const isFavorite = isFavoriteService(service.id);
        const isMaintenance = service.maintenanceMode;
        const initial = service.name.charAt(0).toUpperCase();

        return (
            <div
                key={service.id}
                onClick={() => setSelectedServiceId(service.id)}
                className="group relative bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 transition-all cursor-pointer flex flex-col h-full"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[var(--surface-hover)] flex items-center justify-center border border-[var(--border)] text-[var(--foreground-muted)] font-bold text-lg group-hover:text-amber-500 group-hover:border-amber-500/30 transition-colors">
                            {initial}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-[var(--foreground)] text-base leading-tight truncate pr-2 group-hover:text-amber-500 transition-colors">
                                {service.name}
                            </h3>
                            <div className="text-xs text-[var(--foreground-muted)] font-mono mt-0.5 opacity-70">
                                {service.id}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteService(service.id);
                        }}
                        className={clsx(
                            "p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors relative z-10",
                            isFavorite ? "text-amber-500" : "text-[var(--foreground-muted)] hover:text-amber-400"
                        )}
                    >
                        <Star className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                </div>

                {service.description && (
                    <p className="text-sm text-[var(--foreground-muted)] line-clamp-2 mb-4 flex-1">
                        {service.description}
                    </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] mt-auto">
                    <div className="flex items-center gap-2">
                        {isMaintenance && (
                            <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                                <Hammer className="w-3 h-3" />
                                <span>{t('service_page.maintenance')}</span>
                            </div>
                        )}
                        {service.group && (
                            <div className="px-2 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground-muted)] text-xs font-medium">
                                {service.group}
                            </div>
                        )}
                    </div>

                    {service.links && service.links.length > 0 && (
                        <div className="text-xs text-[var(--foreground-muted)] font-mono flex items-center gap-1" title={`${service.links.length} ${t('service_page.resource_fallback')}`}>
                            <Server className="w-3 h-3" />
                            {service.links.length}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderGroupedServiceCard = (service: any) => {
        const childCount = getChildServiceCount(service.id);
        return (
            <div
                key={service.id}
                onClick={() => setSelectedServiceId(service.id)}
                className="group relative bg-[#18181b] border border-[#27272a] rounded-lg p-5 hover:border-amber-500/30 transition-all cursor-pointer shadow-sm"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                        <Layers className="w-6 h-6 text-amber-500" />
                    </div>
                    <h3 className="font-bold text-white text-lg">
                        {service.name}
                    </h3>
                </div>
                <div className="border-t border-[#27272a]/50 pt-4 mt-2">
                    <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
                        <Box className="w-4 h-4" />
                        <span>{childCount} {t('service_page.count_badge')}</span>
                    </div>
                </div>
            </div>
        );
    };

    if (selectedService) {
        return (
            <ServiceDetail
                service={selectedService}
                onBack={() => setSelectedServiceId(null)}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
                        {t('app.services')}
                    </h1>
                    <p className="text-[var(--foreground-muted)] text-sm mt-1">
                        {t('service_page.subtitle', 'Manage and view all service definitions and detailed dependencies')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center p-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg mr-2">
                        <button
                            onClick={() => setViewMode('list')}
                            className={clsx(
                                "p-1.5 rounded-md transition-all",
                                viewMode === 'list'
                                    ? "bg-amber-500 text-black shadow-sm"
                                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] opacity-50 hover:opacity-100 hover:bg-[var(--surface-hover)]"
                            )}
                            title={t('actions.list_view', 'List View')}
                        >
                            <LayoutList className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grouped')}
                            className={clsx(
                                "p-1.5 rounded-md transition-all",
                                viewMode === 'grouped'
                                    ? "bg-amber-500 text-black shadow-sm"
                                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] opacity-50 hover:opacity-100 hover:bg-[var(--surface-hover)]"
                            )}
                            title={t('actions.grouped_view', 'Grouped View')}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-mono font-bold border border-amber-500/20">
                        {filteredServices.length} {t('service_page.count_badge')}
                    </span>
                </div>
            </div>

            {/* Group Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                    onClick={() => {
                        setSelectedGroup(null);
                        setViewMode('grouped');
                    }}
                    className={clsx(
                        "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                        !selectedGroup
                            ? "bg-amber-500 text-black border border-amber-600 font-bold"
                            : "bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)] hover:text-[var(--foreground)] hover:border-amber-500/50"
                    )}
                >
                    {t('actions.all_groups')}
                </button>
                {allGroups.map(group => {
                    const isSelected = selectedGroup === group;
                    const count = config.services.filter(s => s.group === group && !s.parentId).length;
                    return (
                        <button
                            key={group}
                            onClick={() => {
                                setSelectedGroup(group);
                                setViewMode('list');
                            }}
                            className={clsx(
                                "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2",
                                isSelected
                                    ? "bg-amber-500 text-black border border-amber-600 font-bold"
                                    : "bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)] hover:text-[var(--foreground)] hover:border-amber-500/50"
                            )}
                        >
                            <span>{group}</span>
                            <span className={clsx("text-xs px-1.5 rounded-full", isSelected ? "bg-black/10" : "bg-[var(--surface-hover)]")}>
                                {count}
                            </span>
                        </button>
                    );
                })}
                {hasUncategorized && (
                    <button
                        onClick={() => {
                            setSelectedGroup('__UNCATEGORIZED__');
                            setViewMode('list');
                        }}
                        className={clsx(
                            "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2",
                            selectedGroup === '__UNCATEGORIZED__'
                                ? "bg-amber-500 text-black border border-amber-600 font-bold"
                                : "bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)] hover:text-[var(--foreground)] hover:border-amber-500/50"
                        )}
                    >
                        <span>{t('app.ungrouped')}</span>
                        <span className={clsx("text-xs px-1.5 rounded-full", selectedGroup === '__UNCATEGORIZED__' ? "bg-black/10" : "bg-[var(--surface-hover)]")}>
                            {config.services.filter(s => !s.group && !s.parentId).length}
                        </span>
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="grid gap-4 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                <div className="flex gap-4">
                    <div className="w-full relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)] opacity-50" />
                        <input
                            type="text"
                            placeholder={t('app.search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-[var(--background)] border border-[var(--border)] rounded text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        />
                    </div>
                </div>

                {/* Tags */}
                {allTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border)]">
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



            {/* Service Grid with Groups */}
            <div className="space-y-8">
                {/* Grouped View */}
                {viewMode === 'grouped' && (
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
                                    {groupedServices.groups.length > 0 ? t('app.ungrouped') : t('app.all_services')}
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
                )}

                {/* List View (Filtered or All) */}
                {viewMode === 'list' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredServices.map(service => renderServiceCard(service))}
                    </div>
                )}

                {filteredServices.length === 0 && (
                    <div className="col-span-full py-16 text-center text-[var(--foreground-muted)] opacity-50">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--surface)] mb-4">
                            <Search className="w-8 h-8" />
                        </div>
                        <p>{t('service_page.no_results')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
