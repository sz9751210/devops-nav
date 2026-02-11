
import React, { useMemo, useState } from 'react';
import { useNavigationStore } from '../../store/useMatrixStore';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Layers, Box, Edit } from 'lucide-react';
import { EnvSelector } from '../matrix/EnvSelector';
import { ApplicationDetail } from './ApplicationDetail';
import { ApplicationForm } from './ApplicationForm';
import type { Application } from '../../types/schema';

export const ApplicationsPage: React.FC = () => {
    const { config, currentEnv } = useNavigationStore();
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

    const [isCreating, setIsCreating] = useState(false);
    const [editingApp, setEditingApp] = useState<Application | undefined>(undefined);
    const [selectedApp, setSelectedApp] = useState<Application | undefined>(undefined);

    const applications = config.applications || [];

    const filteredApps = useMemo(() => {
        let apps = applications;

        // Filter by Environment
        // If app has NO environments defined, it shows in ALL.
        // If app HAS environments, it must include currentEnv.
        apps = apps.filter(app => {
            if (!app.environments || app.environments.length === 0) return true;
            return app.environments.includes(currentEnv);
        });

        if (!searchQuery) return apps;
        const lowerQ = searchQuery.toLowerCase();
        return apps.filter(app =>
            app.name.toLowerCase().includes(lowerQ) ||
            app.description?.toLowerCase().includes(lowerQ) ||
            app.tags?.some(tag => tag.toLowerCase().includes(lowerQ))
        );
    }, [applications, searchQuery, currentEnv]);

    const handleSaveApplication = async (app: Application) => {
        try {
            const updatedApps = [...applications];
            const existingIndex = updatedApps.findIndex(a => a.id === app.id);

            if (existingIndex >= 0) {
                updatedApps[existingIndex] = app;
            } else {
                updatedApps.push(app);
            }

            const newConfig = { ...config, applications: updatedApps };
            const response = await fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig)
            });

            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error("Failed to save application", error);
        }

        setIsCreating(false);
        setEditingApp(undefined);
    };

    const handleEdit = (e: React.MouseEvent, app: Application) => {
        e.stopPropagation();
        setEditingApp(app);
        setIsCreating(true);
        setSelectedApp(undefined);
    };

    const handleCardClick = (app: Application) => {
        setSelectedApp(app);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
                        {t('app.applications', 'Applications')}
                    </h1>
                    <p className="text-[var(--foreground-muted)] text-sm mt-1">
                        {t('applications.subtitle', 'Manage your business applications and their infrastructure dependencies')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Environment Selector */}
                    <EnvSelector />

                    <button
                        onClick={() => { setEditingApp(undefined); setIsCreating(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{t('actions.create', 'Create')}</span>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)] opacity-50" />
                <input
                    type="text"
                    placeholder={t('applications.search_placeholder', 'Search applications...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApps.map(app => (
                    <div
                        key={app.id}
                        onClick={() => handleCardClick(app)}
                        className="group bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 transition-all cursor-pointer flex flex-col"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[var(--foreground)]">{app.name}</h3>
                                    {app.owner && (
                                        <div className="text-xs text-[var(--foreground-muted)]">{app.owner}</div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={(e) => handleEdit(e, app)}
                                className="p-1 text-[var(--foreground-muted)] hover:text-[var(--foreground)] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                        </div>

                        {app.description && (
                            <p className="text-sm text-[var(--foreground-muted)] line-clamp-2 mb-4 flex-1">
                                {app.description}
                            </p>
                        )}

                        <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--foreground-muted)]">
                            <div className="flex items-center gap-1.5">
                                <Box className="w-3.5 h-3.5" />
                                <span>{app.serviceIds?.length || 0} Services</span>
                            </div>
                            {app.tags && app.tags.length > 0 && (
                                <div className="flex gap-1">
                                    {app.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="px-1.5 py-0.5 rounded bg-[var(--background)] border border-[var(--border)]">
                                            #{tag}
                                        </span>
                                    ))}
                                    {app.tags.length > 2 && (
                                        <span className="px-1.5 py-0.5 rounded bg-[var(--background)] border border-[var(--border)]">
                                            +{app.tags.length - 2}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {filteredApps.length === 0 && (
                    <div className="col-span-full py-12 text-center text-[var(--foreground-muted)] border border-dashed border-[var(--border)] rounded-lg">
                        <Layers className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>{t('applications.no_results', 'No applications found')}</p>
                    </div>
                )}
            </div>

            {selectedApp && (
                <ApplicationDetail
                    app={selectedApp}
                    onClose={() => setSelectedApp(undefined)}
                    onEdit={() => { setSelectedApp(undefined); setEditingApp(selectedApp); setIsCreating(true); }}
                />
            )}

            {isCreating && (
                <ApplicationForm
                    initialData={editingApp}
                    onCancel={() => { setIsCreating(false); setEditingApp(undefined); }}
                    onSave={handleSaveApplication}
                />
            )}
        </div>
    );
};
