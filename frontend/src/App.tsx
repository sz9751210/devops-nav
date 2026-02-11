import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigationStore } from './store/useMatrixStore';
import { Sidebar, type PageId } from './components/layout/Sidebar';
import { QuickSearch } from './components/matrix/QuickSearch';

import { EnvSelector } from './components/matrix/EnvSelector';
import { LinkCard } from './components/matrix/LinkCard';
import { LinkListItem } from './components/matrix/LinkListItem';
import { Search, ExternalLink, Activity, FileText, Settings, Terminal, Eye, Database, Link2, Globe, Network, Filter, LayoutGrid, List } from 'lucide-react';
import { clsx } from 'clsx';

import { AnnouncementBanner } from './components/ui/AnnouncementBanner';
import { TagFilter } from './components/matrix/TagFilter';
import { TutorialPage } from './components/tutorial/TutorialPage';

// Lazy load heavy components
const EnvironmentSettings = lazy(() => import('./components/settings/EnvironmentSettings').then(m => ({ default: m.EnvironmentSettings })));
const ColumnSettings = lazy(() => import('./components/settings/ColumnSettings').then(m => ({ default: m.ColumnSettings })));
const ServiceSettings = lazy(() => import('./components/settings/ServiceSettings').then(m => ({ default: m.ServiceSettings })));
const ImportExport = lazy(() => import('./components/settings/ImportExport').then(m => ({ default: m.ImportExport })));
const EnvGroupSettings = lazy(() => import('./components/settings/EnvGroupSettings').then(m => ({ default: m.EnvGroupSettings })));


const TopologyModal = lazy(() => import('./components/matrix/TopologyModal').then(m => ({ default: m.TopologyModal })));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center py-16">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500" />
  </div>
);

function App() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState<PageId>('navigation');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');





  const [isTopologyOpen, setIsTopologyOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const { config, currentEnv, isLoading } = useNavigationStore();

  // Theme Sync
  useEffect(() => {
    if (!isDarkMode) {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [isDarkMode]);




  // Derived State
  const serviceGroups = useMemo(() => {
    const groups = new Set<string>();
    config.services.forEach(s => {
      if (s.group) groups.add(s.group);
    });
    return Array.from(groups);
  }, [config.services]);



  const filteredServices = useMemo(() => {
    let services = config.services;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      services = services.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query) ||
        s.tags?.some(t => t.toLowerCase().includes(query)) ||
        s.links?.some(l => l.name.toLowerCase().includes(query))
      );
    }
    if (activeGroup) {
      services = services.filter(s => s.group === activeGroup);
    }
    if (selectedTags.length > 0) {
      services = services.filter(s =>
        selectedTags.every(tag => s.tags?.includes(tag))
      );
    }
    return services;
    return services;
  }, [config.services, searchQuery, activeGroup, selectedTags]);

  const getLinksForCategory = useCallback((columnId: string) => {
    const links: Array<{ service: import('./types/schema').ServiceDefinition, link: import('./types/schema').ServiceLink }> = [];
    filteredServices.forEach(service => {
      if (!service.links) return;
      service.links.forEach(link => {
        if (link.columnId !== columnId) return;
        if (link.environments && link.environments.length > 0 && !link.environments.includes(currentEnv)) return;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const serviceMatch = service.name.toLowerCase().includes(q);
          const linkMatch = link.name.toLowerCase().includes(q) || link.url.includes(q);
          if (!serviceMatch && !linkMatch) return;
        }
        links.push({ service, link });
      });
    });
    return links;
  }, [filteredServices, currentEnv, searchQuery]);

  const getIconComponent = (iconName?: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'terminal': Terminal, 'globe': Globe, 'file': FileText,
      'database': Database, 'activity': Activity, 'settings': Settings,
      'eye': Eye, 'link': Link2,
    };
    return iconMap[iconName || ''] || ExternalLink;
  };

  const totalLinks = useMemo(() => {
    return config.columns.reduce((acc, col) => acc + getLinksForCategory(col.id).length, 0);
  }, [config.columns, getLinksForCategory]);

  const renderPage = () => {
    switch (currentPage) {
      case 'navigation':
        return (
          <div className="space-y-6 pt-2">

            <div className="sticky top-0 z-20 -mx-6 px-6 py-3 bg-[var(--header-bg)] backdrop-blur-sm border-b border-[var(--border)] flex items-center gap-4 transition-colors">
              <div className="relative flex-1 max-w-md">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    type="text"
                    placeholder={t('app.search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}

                    className="w-full h-10 pl-10 pr-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
                  />
                </div>

              </div>

              <EnvSelector />

              <div className="h-6 w-px bg-[var(--border)] mx-1" />

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsTopologyOpen(true)}
                  className="p-1.5 rounded-md text-slate-500 hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all"
                  title={t('actions.view_topology')}
                >
                  <Network className="w-4 h-4" />
                </button>

              </div>

              <div className="h-6 w-px bg-[var(--border)] mx-1" />

              <div className="flex items-center gap-1">
                <Filter className="w-4 h-4 text-[var(--foreground-muted)] opacity-50 mr-1" />
                <div className="flex items-center gap-1 bg-[var(--surface)] rounded-md p-1 border border-[var(--border)]">
                  <button
                    onClick={() => setActiveGroup(null)}
                    className={clsx(
                      "px-2.5 py-1 rounded text-xs font-medium transition-colors uppercase",
                      !activeGroup ? "bg-amber-500/20 text-amber-600 dark:text-amber-500" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                    )}
                  >
                    {t('actions.all')}
                  </button>
                  {serviceGroups.map(group => (
                    <button
                      key={group}
                      onClick={() => setActiveGroup(group)}
                      className={clsx(
                        "px-2.5 py-1 rounded text-xs font-medium transition-colors uppercase",
                        activeGroup === group ? "bg-amber-500/20 text-amber-600 dark:text-amber-500" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                      )}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <div className="h-6 w-px bg-[var(--border)] mx-1" />



                <div className="flex items-center bg-[var(--surface)] rounded-md border border-[var(--border)] p-0.5">
                  <button
                    onClick={() => setViewMode('card')}
                    className={clsx("p-1.5 rounded-md transition-all", viewMode === 'card' ? "bg-amber-500 text-black shadow-sm" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] opacity-50 hover:opacity-100 hover:bg-[var(--surface-hover)]")}
                    title={t('actions.view_card')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={clsx("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-amber-500 text-black shadow-sm" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] opacity-50 hover:opacity-100 hover:bg-[var(--surface-hover)]")}
                    title={t('actions.view_list')}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>


              </div>
            </div>

            <TagFilter
              selectedTags={selectedTags}
              onToggleTag={(tag) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
              onClear={() => setSelectedTags([])}
            />


            {/* Stats Bar */}
            <div className="flex items-center gap-6 px-1 text-xs font-mono text-[var(--foreground-muted)] opacity-60 uppercase tracking-tight border-b border-[var(--border)] pb-4">
              <div>{t('stats.svc')}: <span className="text-[var(--foreground)]">{filteredServices.length}</span></div>
              <div>Links: <span className="text-[var(--foreground)]">{totalLinks}</span></div>
              <div>{t('stats.col')}: <span className="text-[var(--foreground)]">{config.columns.length}</span></div>
              {searchQuery && (
                <div className="text-amber-500">{t('app.filtered')}: {filteredServices.length}</div>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500" />
              </div>
            ) : (
              <div className="space-y-8 pb-16">
                {config.columns.map(col => {
                  const links = getLinksForCategory(col.id);
                  if (links.length === 0) return null;
                  const Icon = getIconComponent(col.icon);
                  return (
                    <section key={col.id}>
                      <h2 className="text-xs font-bold text-[var(--foreground-muted)] opacity-70 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-[var(--border)] pb-2 transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                        {col.title}
                        <span className="text-[var(--border)]">/</span>
                        <span className="text-[var(--foreground-muted)] opacity-50">{links.length}</span>
                      </h2>
                      <div className={clsx(
                        viewMode === 'card'
                          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3"
                          : "grid grid-cols-1 lg:grid-cols-2 gap-3"
                      )}>
                        {links.map(item => (
                          viewMode === 'card' ? (
                            <LinkCard
                              key={`${item.service.id}-${item.link.id}`}
                              service={item.service}
                              link={item.link}
                              column={col}
                            />
                          ) : (
                            <LinkListItem
                              key={`${item.service.id}-${item.link.id}`}
                              service={item.service}
                              link={item.link}
                              column={col}
                            />
                          )
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}


          </div>
        );
      case 'env-settings':
        return <Suspense fallback={<LoadingFallback />}><EnvironmentSettings /></Suspense>;
      case 'env-group-settings':
        return <Suspense fallback={<LoadingFallback />}><EnvGroupSettings /></Suspense>;
      case 'column-settings':
        return <Suspense fallback={<LoadingFallback />}><ColumnSettings /></Suspense>;
      case 'service-settings':
        return <Suspense fallback={<LoadingFallback />}><ServiceSettings /></Suspense>;
      case 'import-export':
        return <Suspense fallback={<LoadingFallback />}><ImportExport /></Suspense>;
      case 'tutorial':
        return <TutorialPage />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen selection:bg-amber-500/30 font-sans transition-colors bg-[var(--background)]">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
      />
      <main className="flex-1 overflow-auto relative">
        <AnnouncementBanner />
        <div className="max-w-7xl mx-auto px-6 py-4">
          {renderPage()}
        </div>
      </main>
      <QuickSearch />


      {isTopologyOpen && <Suspense fallback={null}><TopologyModal onClose={() => setIsTopologyOpen(false)} /></Suspense>}


    </div>
  );
}

export default App;
