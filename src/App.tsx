import { useState, useMemo, useEffect, useCallback } from 'react';
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
import { LinkCard } from './components/matrix/LinkCard';
import { CommandPaletteModal } from './components/matrix/CommandPaletteModal';
import { Search, SlidersHorizontal, LayoutGrid, List, Sparkles, ExternalLink, Activity, FileText, Settings, Terminal, Eye, Database, Link2, Globe, Command, AlertCircle, AlertTriangle, Info as InfoIcon, Network, StickyNote } from 'lucide-react';
import { clsx } from 'clsx';
import { QuickNotes } from './components/matrix/QuickNotes';
import { TopologyModal } from './components/matrix/TopologyModal';

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [showServices, setShowServices] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isTopologyOpen, setIsTopologyOpen] = useState(false);

  const { config, currentEnv, isLoading } = useMatrixStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdKOpen(true);
      }
      // Escape
      if (e.key === 'Escape') {
        if (isCmdKOpen) setIsCmdKOpen(false);
        else if (isConfigOpen) setIsConfigOpen(false);
        else if (isNotesOpen) setIsNotesOpen(false);
        else if (isTopologyOpen) setIsTopologyOpen(false);
        else if (searchQuery) setSearchQuery('');
      }
      // 1/2 shortcuts
      if (!isSearchFocused && !isCmdKOpen && !isConfigOpen && !isNotesOpen && !isTopologyOpen) {
        if (e.key === '1') setViewMode('card');
        if (e.key === '2') setViewMode('table');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConfigOpen, searchQuery, isSearchFocused, isCmdKOpen, isNotesOpen, isTopologyOpen]);

  // Derived State
  const serviceGroups = useMemo(() => {
    const groups = new Set<string>();
    config.services.forEach(s => {
      if (s.group) groups.add(s.group);
    });
    return Array.from(groups);
  }, [config.services]);

  const envVisibleServices = useMemo(() => {
    const envConfig = config.envConfigs?.[currentEnv];
    if (envConfig?.visibleServices && envConfig.visibleServices.length > 0) {
      return envConfig.visibleServices;
    }
    return null;
  }, [config.envConfigs, currentEnv]);

  const filteredServices = useMemo(() => {
    let services = config.services;
    if (envVisibleServices) {
      services = services.filter(s => envVisibleServices.includes(s.id));
    }
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
    return services;
  }, [config.services, envVisibleServices, searchQuery, activeGroup]);

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
      case 'matrix':
        return (
          <div className="space-y-6">
            {/* Announcement Banner */}
            {config.announcement?.active && (
              <div className={clsx(
                "rounded-lg p-3 flex items-center gap-3 mb-4 animate-in slide-in-from-top-2",
                config.announcement.level === 'error' ? "bg-red-500/10 border border-red-500/20 text-red-200" :
                  config.announcement.level === 'warning' ? "bg-amber-500/10 border border-amber-500/20 text-amber-200" :
                    "bg-blue-500/10 border border-blue-500/20 text-blue-200"
              )}>
                {config.announcement.level === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> :
                  config.announcement.level === 'warning' ? <AlertTriangle className="w-5 h-5 shrink-0" /> :
                    <InfoIcon className="w-5 h-5 shrink-0" />}
                <div className="text-sm font-medium">{config.announcement.message}</div>
              </div>
            )}

            <div className="flex flex-col gap-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="main-search"
                    type="text"
                    placeholder="搜尋服務、連結或標籤..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-lg pl-9 pr-20 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-600 text-xs cursor-pointer hover:text-amber-500 transition-colors" onClick={() => setIsCmdKOpen(true)}>
                    <Command className="w-3 h-3" />
                    <span>K</span>
                  </div>
                </div>
                <EnvSelector />
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>{filteredServices.length} 服務</span>
                <span className="text-slate-700">|</span>
                <span>{totalLinks} 連結</span>
                <span className="text-slate-700">|</span>
                <span>{config.columns.length} 分類</span>
                {searchQuery && (
                  <>
                    <span className="text-slate-700">|</span>
                    <span className="text-amber-500">篩選結果: {filteredServices.length}</span>
                  </>
                )}
              </div>
            </div>

            <div className="sticky top-0 z-20 -mx-6 px-6 py-2 bg-black/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-medium text-slate-400">總覽</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 bg-slate-900/60 rounded-md p-0.5 border border-white/5">
                  <button
                    onClick={() => setActiveGroup(null)}
                    className={clsx(
                      "px-2 py-1 rounded text-[10px] transition-all",
                      !activeGroup ? "bg-amber-500/20 text-amber-400" : "text-slate-500 hover:text-white"
                    )}
                  >
                    全部
                  </button>
                  {serviceGroups.map(group => (
                    <button
                      key={group}
                      onClick={() => setActiveGroup(group)}
                      className={clsx(
                        "px-2 py-1 rounded text-[10px] transition-all",
                        activeGroup === group ? "bg-amber-500/20 text-amber-400" : "text-slate-500 hover:text-white"
                      )}
                    >
                      {group}
                    </button>
                  ))}
                </div>

                <div className="w-px h-4 bg-white/10" />

                <div className="flex items-center gap-0.5 bg-slate-900/60 rounded-md p-0.5 border border-white/5">
                  <button
                    onClick={() => setIsTopologyOpen(true)}
                    className="p-1 rounded transition-all text-slate-500 hover:text-white hover:bg-white/10"
                    title="拓撲圖"
                  >
                    <Network className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setIsNotesOpen(!isNotesOpen)}
                    className={clsx("p-1 rounded transition-all", isNotesOpen ? "text-amber-400 bg-amber-500/10" : "text-slate-500 hover:text-white hover:bg-white/10")}
                    title="隨手筆記"
                  >
                    <StickyNote className="w-3 h-3" />
                  </button>
                </div>

                <div className="w-px h-4 bg-white/10" />

                <div className="flex items-center gap-0.5 bg-slate-900/60 rounded-md p-0.5 border border-white/5">
                  <button
                    onClick={() => setShowServices(!showServices)}
                    className={clsx(
                      "px-2 py-1 rounded text-[10px] transition-all",
                      showServices ? "bg-amber-500/20 text-amber-400" : "text-slate-500 hover:text-white"
                    )}
                    title={showServices ? "隱藏服務列表" : "顯示服務列表"}
                  >
                    顯示服務
                  </button>
                </div>

                <div className="w-px h-4 bg-white/10" />

                <div className="flex items-center gap-0.5 bg-slate-900/60 rounded-md p-0.5 border border-white/5">
                  <button
                    onClick={() => setViewMode('card')}
                    className={clsx("p-1 rounded transition-all", viewMode === 'card' ? "bg-amber-500 text-black" : "text-slate-500 hover:text-white")}
                    title="卡片檢視 (1)"
                  >
                    <LayoutGrid className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={clsx("p-1 rounded transition-all", viewMode === 'table' ? "bg-amber-500 text-black" : "text-slate-500 hover:text-white")}
                    title="列表檢視 (2)"
                  >
                    <List className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => setIsConfigOpen(true)}
                  className="p-1 rounded-md text-slate-500 hover:text-white bg-slate-900/60 border border-white/5 transition-colors"
                  title="配置"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500" />
              </div>
            ) : (
              <div className="space-y-10 pb-16">
                {showServices && (
                  <section>
                    <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-amber-500" />
                      服務
                      <span className="text-slate-600 font-normal">({filteredServices.length})</span>
                    </h2>
                    {filteredServices.length === 0 ? (
                      <p className="text-xs text-slate-600 italic py-4">無匹配服務</p>
                    ) : (
                      <div className={clsx(
                        viewMode === 'card'
                          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
                          : "space-y-1"
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
                )}

                {config.columns.map(col => {
                  const links = getLinksForCategory(col.id);
                  if (links.length === 0) return null;
                  const Icon = getIconComponent(col.icon);
                  return (
                    <section key={col.id}>
                      <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2 border-b border-white/5 pb-2">
                        <div className="p-1.5 bg-amber-500/10 rounded">
                          <Icon className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                        {col.title}
                        <span className="text-slate-600 font-normal">({links.length})</span>
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
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
        <div className="max-w-6xl mx-auto px-6 py-4">
          {renderPage()}
        </div>
      </main>
      <QuickSearch />

      <QuickNotes isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} />
      {isTopologyOpen && <TopologyModal onClose={() => setIsTopologyOpen(false)} />}

      {isCmdKOpen && (
        <CommandPaletteModal
          onClose={() => setIsCmdKOpen(false)}
          onNavigate={(page) => {
            setCurrentPage(page);
            setIsCmdKOpen(false);
          }}
          currentEnv={currentEnv}
        />
      )}
    </div>
  );
}

export default App;
