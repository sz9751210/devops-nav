
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save, Search, Check, Link2 } from 'lucide-react';
import { useNavigationStore } from '../../store/useMatrixStore';
import { EnvironmentPicker } from '../common/EnvironmentPicker';
import type { Application } from '../../types/schema';
import { clsx } from 'clsx';
import { v4 as uuidv4 } from 'uuid';

interface ApplicationFormProps {
    initialData?: Application;
    onSave: (app: Application) => void;
    onCancel: () => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({ initialData, onSave, onCancel }) => {
    const { t } = useTranslation();
    const { config } = useNavigationStore();

    const [formData, setFormData] = useState<Partial<Application>>(initialData || {
        name: '',
        group: '',
        description: '',
        owner: '',
        tags: [],
        serviceIds: [],
        environments: []
    });

    const [serviceQuery, setServiceQuery] = useState('');
    const [showSelectedOnly, setShowSelectedOnly] = useState(false);

    const availableServices = config.services || [];

    const existingGroups = useMemo(() => {
        const apps = config.applications || [];
        const groups = new Set(apps.map(a => a.group).filter((g): g is string => !!g));
        return Array.from(groups).sort();
    }, [config.applications]);

    const filteredServices = useMemo(() => {
        const selectedEnvs = formData.environments || [];
        const hasEnvFilter = selectedEnvs.length > 0 && !showSelectedOnly;

        // Helper: Check if a link (or its children) is compatible with selected envs
        const isLinkCompatible = (link: any): boolean => {
            if (!hasEnvFilter) return true;
            // Immediate match
            const selfMatch = !link.environments || link.environments.length === 0 || link.environments.some((e: string) => selectedEnvs.includes(e));
            if (selfMatch) return true;
            // Child match?
            if (link.children && link.children.some((c: any) => isLinkCompatible(c))) return true;
            return false;
        };

        const hasCompatibleLinks = (links?: any[]): boolean => {
            if (!links || links.length === 0) return false;
            return links.some(isLinkCompatible);
        };

        // If "Show selected only", we have a simpler logic:
        if (showSelectedOnly) {
            const selectedIds = new Set(formData.serviceIds || []);
            // Return parents that are:
            // 1. Directly selected
            // 2. Have a Child Service selected
            // 3. Have a Link selected (we need to find the parent of the link)

            return availableServices.filter(s => {
                // Must be a parent (top-level)
                if (s.parentId) return false;

                // Check if parent itself is selected
                if (selectedIds.has(s.id)) return true;

                // Check children services
                const children = availableServices.filter(c => c.parentId === s.id);
                if (children.some(c => selectedIds.has(c.id))) return true;

                // Check Links (recursive)
                const hasSelectedLink = (links?: typeof s.links): boolean => {
                    if (!links) return false;
                    return links.some(l => selectedIds.has(l.id) || hasSelectedLink(l.children));
                };
                if (hasSelectedLink(s.links)) return true;

                return false;
            });
        }

        let candidates = availableServices;

        // 1. Filter by Environment (if active)
        if (hasEnvFilter) {
            candidates = candidates.filter(s => {
                if (s.parentId) return false; // Children handled via parent logic

                // Matches itself (links compatible?)
                if (hasCompatibleLinks(s.links)) return true;

                const children = availableServices.filter(c => c.parentId === s.id);
                // Matches children (links compatible?)
                if (children.some(c => hasCompatibleLinks(c.links))) return true;

                // Fallback: If no links defined anywhere, assume Global/Visible
                const noLinksInParent = !s.links || s.links.length === 0;
                const noLinksInChildren = children.every(c => !c.links || c.links.length === 0);

                if (noLinksInParent && noLinksInChildren) return true;

                return false;
            });
        }

        if (!serviceQuery) return candidates;
        const lowerQ = serviceQuery.toLowerCase();

        // Helper to check if a service matches
        const serviceMatches = (s: typeof availableServices[0]) => {
            if (s.name.toLowerCase().includes(lowerQ) || s.id.toLowerCase().includes(lowerQ)) return true;

            // Check links (recursive)
            const checkLinks = (links?: typeof s.links): boolean => {
                if (!links) return false;
                return links.some(l =>
                    l.name.toLowerCase().includes(lowerQ) ||
                    l.url.toLowerCase().includes(lowerQ) ||
                    checkLinks(l.children)
                );
            };
            return checkLinks(s.links);
        };

        // Find all services (parents or children) that match
        const matches = candidates.filter(s => serviceMatches(s)); // Filter candidates, not availableServices
        const matchIds = new Set(matches.map(s => s.id));

        // Return parents if they match OR if they have a matching child
        return candidates.filter(s => {
            // If it's a child, we don't return it directly in the top list (handled by parent)
            if (s.parentId) return false;

            // It's a parent.
            // Match if:
            // 1. Parent itself matches (name, id, or LINKS)
            if (matchIds.has(s.id)) return true;

            // 2. OR Any of its children match
            const children = availableServices.filter(child => child.parentId === s.id);
            const hasMatchingChild = children.some(child => matchIds.has(child.id));
            if (hasMatchingChild) return true;

            // 3. OR Any of its LINKS match
            if (serviceMatches(s)) return true;

            return false;
        });
    }, [availableServices, serviceQuery, showSelectedOnly, formData.environments]);

    const toggleService = (serviceId: string) => {
        setFormData((prev: Partial<Application>) => {
            const current = prev.serviceIds || [];
            if (current.includes(serviceId)) {
                return { ...prev, serviceIds: current.filter((id: string) => id !== serviceId) };
            } else {
                return { ...prev, serviceIds: [...current, serviceId] };
            }
        });
    };

    const handleSave = () => {
        if (!formData.name) return;

        const app: Application = {
            id: initialData?.id || uuidv4(),
            name: formData.name,
            group: formData.group,
            description: formData.description,
            owner: formData.owner,
            tags: formData.tags,
            serviceIds: formData.serviceIds || [],
            environments: formData.environments
        };
        onSave(app);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h2 className="text-lg font-bold text-[var(--foreground)]">
                        {initialData ? t('actions.edit_application') : t('actions.create_application')}
                    </h2>
                    <button onClick={onCancel} className="p-1 hover:bg-[var(--surface-hover)] rounded transition-colors">
                        <X className="w-5 h-5 text-[var(--foreground-muted)]" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1">
                                    {t('form.label', 'Name')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-9 px-3 bg-[var(--background)] border border-[var(--border)] rounded text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                    placeholder={t('form.placeholders.app_name_example', 'e.g. Payment Gateway')}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1">
                                    {t('applications.group', 'Group')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.group || ''}
                                    onChange={e => setFormData({ ...formData, group: e.target.value })}
                                    className="w-full h-9 px-3 bg-[var(--background)] border border-[var(--border)] rounded text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                    placeholder={t('form.placeholders.group_example', 'e.g. Finance')}
                                    list="existing-groups"
                                />
                                <datalist id="existing-groups">
                                    {existingGroups.map(group => (
                                        <option key={group} value={group} />
                                    ))}
                                </datalist>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1">
                                {t('form.description', 'Description')}
                            </label>
                            <textarea
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full h-20 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none"
                                placeholder={t('form.placeholders.description_app', 'Brief description of this application...')}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1">
                                    {t('form.owner')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.owner || ''}
                                        onChange={e => setFormData({ ...formData, owner: e.target.value })}
                                        className="w-full h-9 pl-3 pr-8 bg-[var(--background)] border border-[var(--border)] rounded text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                        placeholder={t('form.placeholders.owner_placeholder')}
                                    />
                                    {formData.owner && (
                                        <button
                                            onClick={() => setFormData({ ...formData, owner: '' })}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[var(--foreground-muted)] hover:text-[var(--foreground)] rounded-full hover:bg-[var(--surface-hover)] transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1">
                                    {t('form.tags', 'Tags')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.tags?.join(', ') || ''}
                                    onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                                    className="w-full h-9 px-3 bg-[var(--background)] border border-[var(--border)] rounded text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                    placeholder={t('form.placeholders.tags_example', 'comma, separated, tags')}
                                />
                            </div>
                        </div>

                        {/* Environments */}
                        <div>
                            <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1">
                                {t('form.environments')}
                            </label>
                            <EnvironmentPicker
                                selected={formData.environments || []}
                                onSelect={(env) => setFormData({ ...formData, environments: Array.isArray(env) ? env : [env] })}
                                multi={true}
                                variant="form"
                                placeholder={t('form.select_environments', 'Select Environments')}
                            />
                        </div>
                    </div>

                    {/* Service Selection */}
                    <div className="border-t border-[var(--border)] pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-xs font-bold text-[var(--foreground-muted)] uppercase">
                                {t('form.associated_services')} ({formData.serviceIds?.length || 0})
                            </label>

                            <button
                                onClick={() => {
                                    setShowSelectedOnly(!showSelectedOnly);
                                    setServiceQuery(''); // Clear query when toggling mode to avoid confusion
                                }}
                                className={clsx(
                                    "text-xs font-medium px-2 py-1 rounded transition-colors flex items-center gap-1.5",
                                    showSelectedOnly
                                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                        : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                                )}
                            >
                                <Check className="w-3 h-3" />
                                {t('form.show_selected_only', 'Show Selected')}
                            </button>
                        </div>

                        {!showSelectedOnly && (
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)] opacity-50" />
                                <input
                                    type="text"
                                    value={serviceQuery}
                                    onChange={e => setServiceQuery(e.target.value)}
                                    className="w-full h-9 pl-9 pr-3 bg-[var(--background)] border border-[var(--border)] rounded text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                    placeholder={t('form.search_services_to_link')}
                                />
                            </div>
                        )}

                        <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                            {filteredServices.filter(s => !s.parentId).map(parent => {
                                // Logic: If searching, we want to show children that match the query
                                // OR if the parent matches, we show all (or filtered?) children.
                                // Let's keep it simple: Show all children of this parent that match the filter logic.
                                // But `filteredServices` ONLY contains parents now due to our logic change? NO.
                                // My filter logic returns "Parents that should be shown".
                                // So I need to find the children of this parent.

                                const displayChildren = (availableServices.filter(s => s.parentId === parent.id));

                                // NEW: Filter Links inside this parent
                                const parentLinks = parent.links || [];

                                // Determine which items to show based on query
                                let visibleChildren = displayChildren;
                                let visibleLinks = parentLinks;

                                const selectedEnvs = formData.environments || [];
                                const hasEnvFilter = selectedEnvs.length > 0 && !showSelectedOnly;
                                const lowerQ = serviceQuery.toLowerCase();

                                // --- Helper Functions (Reused for Recursion) ---

                                // 1. Env Compatibility
                                const isEnvCompatible = (link: any): boolean => {
                                    if (!hasEnvFilter) return true;
                                    const selfMatch = !link.environments || link.environments.length === 0 || link.environments.some((e: string) => selectedEnvs.includes(e));
                                    if (selfMatch) return true;
                                    // If self doesn't match, check children
                                    if (link.children && link.children.some((c: any) => isEnvCompatible(c))) return true;
                                    return false;
                                };

                                // 2. Search Match
                                const checkLinkSearch = (l: any): boolean => {
                                    return l.name.toLowerCase().includes(lowerQ) ||
                                        l.url.toLowerCase().includes(lowerQ) ||
                                        (l.children && l.children.some(checkLinkSearch));
                                };

                                // 3. Selected Match
                                const selectedIds = new Set(formData.serviceIds || []);
                                const checkLinkSelected = (l: any): boolean => {
                                    return selectedIds.has(l.id) || (l.children && l.children.some(checkLinkSelected));
                                };

                                // --- Recursive Render Function ---
                                const renderLink = (link: any) => {
                                    const isLinkSelected = formData.serviceIds?.includes(link.id);

                                    // Determine children to show
                                    let childrenToShow = link.children || [];

                                    if (hasEnvFilter) {
                                        childrenToShow = childrenToShow.filter(isEnvCompatible);
                                    }

                                    if (serviceQuery) {
                                        childrenToShow = childrenToShow.filter(checkLinkSearch);
                                    } else if (showSelectedOnly) {
                                        childrenToShow = childrenToShow.filter(checkLinkSelected);
                                    }

                                    return (
                                        <div key={link.id} className="space-y-1">
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent parent toggle
                                                    toggleService(link.id);
                                                }}
                                                className={clsx(
                                                    "flex items-center gap-3 p-2 rounded cursor-pointer border transition-all bg-[var(--surface)]",
                                                    isLinkSelected
                                                        ? "bg-amber-500/10 border-amber-500/40"
                                                        : "border-transparent hover:border-amber-500/30"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                                                    isLinkSelected ? "bg-amber-500 border-amber-500" : "border-[var(--foreground-muted)]"
                                                )}>
                                                    {isLinkSelected && <Check className="w-2.5 h-2.5 text-black" />}
                                                </div>
                                                <Link2 className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-sm text-[var(--foreground)] truncate">{link.name}</div>
                                                    <div className="text-[10px] text-[var(--foreground-muted)] font-mono truncate opacity-70">{link.url}</div>
                                                </div>
                                            </div>

                                            {/* Recursive Children */}
                                            {childrenToShow.length > 0 && (
                                                <div className="pl-6 space-y-1 border-l-2 border-[var(--border)] ml-3">
                                                    {childrenToShow.map((child: any) => renderLink(child))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                };

                                // --- Filter Top-Level Links ---
                                if (hasEnvFilter) {
                                    // Filter Children (Services) match logic...
                                    visibleChildren = visibleChildren.filter(c => {
                                        if (!c.links || c.links.length === 0) return true;
                                        if (c.links.some(isEnvCompatible)) return true;
                                        return false;
                                    });

                                    // Filter Links
                                    visibleLinks = visibleLinks.filter(isEnvCompatible);
                                }

                                if (serviceQuery) {
                                    const parentMatches = parent.name.toLowerCase().includes(lowerQ) || parent.id.toLowerCase().includes(lowerQ);
                                    if (!parentMatches) {
                                        visibleChildren = visibleChildren.filter(c =>
                                            c.name.toLowerCase().includes(lowerQ) || c.id.toLowerCase().includes(lowerQ)
                                        );
                                        visibleLinks = visibleLinks.filter(checkLinkSearch);
                                    }
                                } else if (showSelectedOnly) {
                                    if (!selectedIds.has(parent.id)) {
                                        visibleChildren = displayChildren.filter(c => selectedIds.has(c.id));
                                        visibleLinks = parentLinks.filter(checkLinkSelected);
                                    }
                                }

                                const isParentSelected = formData.serviceIds?.includes(parent.id);

                                return (
                                    <div key={parent.id} className="space-y-1">
                                        {/* Parent Service */}
                                        <div
                                            onClick={() => toggleService(parent.id)}
                                            className={clsx(
                                                "flex items-center gap-3 p-2 rounded cursor-pointer border transition-all",
                                                isParentSelected
                                                    ? "bg-amber-500/10 border-amber-500/40"
                                                    : "bg-[var(--background)] border-[var(--border)] hover:border-amber-500/30"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                                                isParentSelected ? "bg-amber-500 border-amber-500" : "border-[var(--foreground-muted)]"
                                            )}>
                                                {isParentSelected && <Check className="w-3 h-3 text-black" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-medium text-[var(--foreground)] truncate">{parent.name}</div>
                                                <div className="text-xs text-[var(--foreground-muted)] font-mono">{parent.id}</div>
                                            </div>
                                        </div>

                                        {/* Child Services */}
                                        {visibleChildren.length > 0 && (
                                            <div className="pl-6 space-y-1 border-l-2 border-[var(--border)] ml-3">
                                                {visibleChildren.map(child => {
                                                    const isChildSelected = formData.serviceIds?.includes(child.id);
                                                    return (
                                                        <div
                                                            key={child.id}
                                                            onClick={() => toggleService(child.id)}
                                                            className={clsx(
                                                                "flex items-center gap-3 p-2 rounded cursor-pointer border transition-all",
                                                                isChildSelected
                                                                    ? "bg-amber-500/10 border-amber-500/40"
                                                                    : "bg-[var(--surface)] border-transparent hover:border-amber-500/30"
                                                            )}
                                                        >
                                                            <div className={clsx(
                                                                "w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                                                                isChildSelected ? "bg-amber-500 border-amber-500" : "border-[var(--foreground-muted)]"
                                                            )}>
                                                                {isChildSelected && <Check className="w-2.5 h-2.5 text-black" />}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="text-sm text-[var(--foreground)] truncate">{child.name}</div>
                                                                <div className="text-[10px] text-[var(--foreground-muted)] font-mono">{child.id}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Service Links (Selectable) */}
                                        {visibleLinks.length > 0 && (
                                            <div className="pl-6 space-y-1 border-l-2 border-[var(--border)] ml-3">
                                                {visibleLinks.map(link => renderLink(link))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {filteredServices.length === 0 && (
                                <div className="text-center py-4 text-sm text-[var(--foreground-muted)] italic">
                                    {t('form.no_services_found')} "{serviceQuery}"
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-[var(--border)] flex justify-end gap-3 bg-[var(--surface-hover)]/30">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                    >
                        {t('actions.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!formData.name}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        <span>{t('actions.save')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
