import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigationStore } from '../../store/useMatrixStore';
import { Search, Filter, Hammer, Star, Server } from 'lucide-react';
import { clsx } from 'clsx';
import { ServiceDetail } from './ServiceDetail';

export const ServicesPage: React.FC = () => {
    const { t } = useTranslation();
    const { config, isFavoriteService, toggleFavoriteService } = useNavigationStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

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

    const filteredServices = useMemo(() => {
        return config.services.filter(s => {
            if (s.parentId) return false; // Hide child services from main dashboard

            if (selectedGroup && s.group !== selectedGroup) return false;

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

    const selectedService = useMemo(() =>
        config.services.find(s => s.id === selectedServiceId),
        [config.services, selectedServiceId]);

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
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-mono font-bold border border-amber-500/20">
                        {filteredServices.length} {t('service_page.count_badge')}
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="grid gap-4 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)] opacity-50" />
                        <input
                            type="text"
                            placeholder={t('app.search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-[var(--background)] border border-[var(--border)] rounded text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        />
                    </div>
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)] opacity-50" />
                        <select
                            value={selectedGroup || ''}
                            onChange={(e) => setSelectedGroup(e.target.value || null)}
                            className="w-full h-10 pl-10 pr-4 bg-[var(--background)] border border-[var(--border)] rounded text-sm text-[var(--foreground)] appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                        >
                            <option value="">{t('actions.all_groups')}</option>
                            {allGroups.map(group => (
                                <option key={group} value={group}>{group}</option>
                            ))}
                        </select>
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

            {/* Service Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredServices.map(service => {
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
                })}

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
