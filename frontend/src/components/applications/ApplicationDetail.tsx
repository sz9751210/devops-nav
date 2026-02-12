import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Layers, Box, Globe, ChevronDown } from 'lucide-react';
import { useNavigationStore } from '../../store/useMatrixStore';
import type { Application, ServiceLink } from '../../types/schema';
import { clsx } from 'clsx';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ServiceCard } from '../matrix/ServiceCard';

interface ApplicationDetailProps {
    app: Application;
    onClose: () => void;
    onEdit: () => void;
}

export const ApplicationDetail: React.FC<ApplicationDetailProps> = ({ app, onClose, onEdit }) => {
    const { t } = useTranslation();
    const { config, currentEnv, setEnv } = useNavigationStore();

    // Resolve services and specific links
    const resolvedItems = useMemo(() => {
        const allServices = config.services || [];
        // Map serviceId -> { service, specificLinks[] }
        // If specificLinks is empty, it might mean "All" if the service ID itself was matched? 
        // Or we stick to the logic: 
        // If ServiceID matched -> Show All Links
        // If LinkID matched -> Show Only That Link

        const items: { service: typeof allServices[0], links: ServiceLink[] }[] = [];
        const selectedIds = new Set(app.serviceIds || []);

        allServices.forEach(service => {
            const isServiceSelected = selectedIds.has(service.id);

            let linksToShow: ServiceLink[] = [];

            if (isServiceSelected) {
                // Whole service selected -> Show all links
                linksToShow = service.links || [];
            } else {
                // Check for selected links within this service
                // Deep search for selected links
                const findSelectedLinks = (links?: ServiceLink[]): ServiceLink[] => {
                    if (!links) return [];
                    return links.reduce((acc, link) => {
                        if (selectedIds.has(link.id)) {
                            acc.push(link);
                        }
                        // Check children
                        acc.push(...findSelectedLinks(link.children));
                        return acc;
                    }, [] as ServiceLink[]);
                };

                linksToShow = findSelectedLinks(service.links);
            }

            if (isServiceSelected || linksToShow.length > 0) {
                items.push({
                    service,
                    links: linksToShow
                });
            }
        });

        return items;
    }, [config.services, app.serviceIds]);

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-4xl bg-[var(--surface)]/95 backdrop-blur-md border-l border-[var(--border)] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 sm:duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border)] shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[var(--foreground)]">{app.name}</h2>
                            {app.owner && (
                                <div className="text-sm text-[var(--foreground-muted)] flex items-center gap-2">
                                    <span>{t('app_detail.owned_by')}:</span>
                                    <span className="text-[var(--foreground)]">{app.owner}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Environment Selector */}
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                                <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--foreground)] bg-[var(--surface-hover)] hover:bg-[var(--border)] rounded transition-colors mr-2">
                                    <Globe className="w-4 h-4 text-[var(--foreground-muted)]" />
                                    <span>{currentEnv}</span>
                                    <ChevronDown className="w-3 h-3 opacity-50" />
                                </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                                <DropdownMenu.Content className="z-50 min-w-[150px] bg-[var(--surface)] border border-[var(--border)] rounded shadow-xl p-1 animate-in fade-in zoom-in-95 duration-100">
                                    {config.environments.map(env => (
                                        <DropdownMenu.Item
                                            key={env}
                                            onClick={() => setEnv(env)}
                                            className={clsx(
                                                "flex items-center px-2 py-1.5 text-sm rounded cursor-pointer outline-none transition-colors",
                                                currentEnv === env
                                                    ? "bg-amber-500/10 text-amber-500 font-medium"
                                                    : "text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                                            )}
                                        >
                                            {env}
                                        </DropdownMenu.Item>
                                    ))}
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>

                        <button
                            onClick={onEdit}
                            className="px-3 py-1.5 text-sm font-medium text-[var(--foreground)] bg-[var(--surface-hover)] hover:bg-[var(--border)] rounded transition-colors"
                        >
                            {t('actions.edit')}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[var(--surface-hover)] rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-[var(--foreground-muted)]" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Description */}
                    {app.description && (
                        <div className="text-[var(--foreground)] opacity-80 leading-relaxed">
                            {app.description}
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                            <div className="text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1">{t('app_detail.services')}</div>
                            <div className="text-2xl font-mono text-[var(--foreground)]">{resolvedItems.length}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                            <div className="text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1">{t('app_detail.tags')}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {app.tags && app.tags.length > 0 ? app.tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 text-xs rounded bg-[var(--surface-hover)] border border-[var(--border)]">
                                        {tag}
                                    </span>
                                )) : <span className="text-sm text-[var(--foreground-muted)]">-</span>}
                            </div>
                        </div>
                    </div>

                    {/* Infrastructure Services */}
                    <div>
                        <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Box className="w-4 h-4 text-amber-500" />
                            {t('app_detail.infrastructure_dependencies')}
                        </h3>

                        {resolvedItems.length === 0 ? (
                            <div className="text-center py-8 border border-dashed border-[var(--border)] rounded-lg text-[var(--foreground-muted)]">
                                {t('app_detail.no_services')}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {resolvedItems.map(({ service, links }) => (
                                    <ServiceCard
                                        key={service.id}
                                        service={service}
                                        columns={config.columns}
                                        currentEnv={currentEnv}
                                        viewMode="card"
                                        overrideLinks={links}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
