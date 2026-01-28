import { useState, useMemo } from 'react';
import { useMatrixStore } from './store/useMatrixStore';
import { Sidebar, type PageId } from './components/layout/Sidebar';
import { EnvironmentSettings } from './components/settings/EnvironmentSettings';
import { ColumnSettings } from './components/settings/ColumnSettings';
import { ServiceSettings } from './components/settings/ServiceSettings';
import { ImportExport } from './components/settings/ImportExport';
import { EnvGroupSettings } from './components/settings/EnvGroupSettings';
import { QuickSearch } from './components/matrix/QuickSearch';
import { ServiceCard } from './components/matrix/ServiceCard';
import { EnvSelector } from './components/matrix/EnvSelector';
import { ViewConfigModal } from './components/matrix/ViewConfigModal';
import { Search, SlidersHorizontal, LayoutGrid, Table2, Sparkles, ExternalLink, Activity, FileText, Settings, Terminal, Eye, Database, Link2, Globe } from 'lucide-react';
import { clsx } from 'clsx';
import { LinkCard } from './components/matrix/LinkCard';

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const { config, currentEnv, isLoading } = useMatrixStore();

  // Get unique service groups
  const serviceGroups = useMemo(() => {
    const groups = new Set<string>();
    config.services.forEach(s => {
      if (s.group) groups.add(s.group);
    });
    return Array.from(groups);
  }, [config.services]);

  // Get environment-specific visible services
  const envVisibleServices = useMemo(() => {
    const envConfig = config.envConfigs?.[currentEnv];
    if (envConfig?.visibleServices && envConfig.visibleServices.length > 0) {
      return envConfig.visibleServices;
    }
    return null; // null means show all
  }, [config.envConfigs, currentEnv]);

  // Filter services by env config, search and group
  const filteredServices = useMemo(() => {
    let services = config.services;

    // Filter by environment visibility first
    if (envVisibleServices) {
      services = services.filter(s => envVisibleServices.includes(s.id));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      services = services.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query)
      );
    }

    if (activeGroup) {
      services = services.filter(s => s.group === activeGroup);
    }

    return services;
  }, [config.services, envVisibleServices, searchQuery, activeGroup]);

  // Helper to get links for a specific column across all services
  const getLinksForCategory = (columnId: string) => {
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
  };

  const getIconComponent = (iconName?: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'terminal': Terminal,
      'globe': Globe,
      'file': FileText,
      'database': Database,
      'activity': Activity,
      'settings': Settings,
      'eye': Eye,
      'link': Link2,
    };
    return iconMap[iconName || ''] || ExternalLink;
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'matrix':
        return (
          <div className="space-y-12">
            {/* Search Header */}
            <div className="flex flex-col items-center pt-4 pb-4">
              {/* Search Bar */}
              <div className="relative w-full max-w-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-xl rounded-2xl" />
                <div className="relative flex items-center bg-slate-900/80 border border-amber-500/30 rounded-xl overflow-hidden backdrop-blur-sm shadow-2xl shadow-black/50">
                  <Search className="w-5 h-5 text-slate-400 ml-4" />
                  <input
                    type="text"
                    placeholder="輸入服務名稱、連結名稱或搜尋關鍵字..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 px-4 py-4 text-base"
                  />
                  <button className="bg-amber-500 hover:bg-amber-400 text-black font-medium px-6 py-2 m-2 rounded-lg transition-colors">
                    搜尋
                  </button>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex items-center gap-4 mt-6">
                <EnvSelector />
              </div>
            </div>

            {/* Dashboad Content */}
            <div className="space-y-12 pb-20">
              {/* Toolbar & Global Filters (Sticky if possible) */}
              <div className="sticky top-0 z-10 py-2 bg-black/50 backdrop-blur-md -mx-4 px-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300 font-medium">總覽模式</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-slate-900/50 rounded-lg p-1 border border-white/5">
                    <button
                      onClick={() => setActiveGroup(null)}
                      className={clsx(
                        "px-3 py-1 rounded-md text-xs transition-all",
                        !activeGroup ? "bg-amber-500/20 text-amber-400" : "text-slate-400 hover:text-white"
                      )}
                    >
                      全部群組
                    </button>
                    {serviceGroups.map(group => (
                      <button
                        key={group}
                        onClick={() => setActiveGroup(group)}
                        className={clsx(
                          "px-3 py-1 rounded-md text-xs transition-all",
                          activeGroup === group ? "bg-amber-500/20 text-amber-400" : "text-slate-400 hover:text-white"
                        )}
                      >
                        {group}
                      </button>
                    ))}
                  </div>

                  <div className="w-px h-4 bg-white/10" />

                  <div className="flex items-center gap-1 bg-slate-900/50 rounded-lg p-1 border border-white/5">
                    <button
                      onClick={() => setViewMode('card')}
                      className={clsx(
                        "p-1 rounded-md transition-all",
                        viewMode === 'card' ? "bg-amber-500 text-black" : "text-slate-400 hover:text-white"
                      )}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={clsx(
                        "p-1 rounded-md transition-all",
                        viewMode === 'table' ? "bg-amber-500 text-black" : "text-slate-400 hover:text-white"
                      )}
                    >
                      <Table2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setIsConfigOpen(true)}
                    className="p-1 rounded-md text-slate-400 hover:text-white bg-slate-900/50 border border-white/5"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
                </div>
              ) : (
                <div className="space-y-16">
                  {/* 1. Services Section */}
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 text-amber-500" />
                        服務列表
                        <span className="text-sm font-normal text-slate-500 ml-2">({filteredServices.length})</span>
                      </h2>
                    </div>
                    {filteredServices.length === 0 ? (
                      <p className="text-slate-500 italic py-4">沒有匹配的服務</p>
                    ) : (
                      <div className={clsx(
                        viewMode === 'card' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-2"
                      )}>
                        {filteredServices.map(service => (
                          <ServiceCard
                            key={service.id}
                            service={service}
                            columns={config.columns}
                            currentEnv={currentEnv}
                            viewMode={viewMode}
                          />
                        ))}
                      </div>
                    )}
                  </section>

                  {/* 2. Category Sections (Links) */}
                  {config.columns.map(col => {
                    const links = getLinksForCategory(col.id);
                    if (links.length === 0 && !searchQuery) return null; // Hide empty unless searching
                    if (links.length === 0 && searchQuery) return null;

                    const Icon = getIconComponent(col.icon);
                    return (
                      <section key={col.id} className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                              <Icon className="w-5 h-5 text-amber-400" />
                            </div>
                            {col.title}
                            <span className="text-sm font-normal text-slate-500 ml-2">({links.length})</span>
                          </h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {links.map(item => (
                            <LinkCard
                              key={`${item.service.id}-${item.link.id}`}
                              service={item.service}
                              link={item.link}
                              column={col}
                            />
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modals */}
            {isConfigOpen && <ViewConfigModal onClose={() => setIsConfigOpen(false)} />}
          </div>
        );
      case 'env-settings':
        return <EnvironmentSettings />;
      case 'env-group-settings':
        return <EnvGroupSettings />;
      case 'column-settings':
        return <ColumnSettings />;
      case 'service-settings':
        return <ServiceSettings />;
      case 'import-export':
        return <ImportExport />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen selection:bg-amber-500/30">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      <main className="flex-1 overflow-auto relative">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {renderPage()}
        </div>
      </main>

      <QuickSearch />
    </div>
  );
}

export default App;
