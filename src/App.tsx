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
import { Search, SlidersHorizontal, LayoutGrid, Table2, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

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

  // Filter services by search and group
  const filteredServices = useMemo(() => {
    let services = config.services;

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
  }, [config.services, searchQuery, activeGroup]);

  const renderPage = () => {
    switch (currentPage) {
      case 'matrix':
        return (
          <div className="space-y-6">
            {/* Search Header */}
            <div className="flex flex-col items-center pt-4 pb-8">
              {/* Tabs */}
              <div className="flex items-center gap-8 mb-6 text-sm">
                <button className="text-amber-400 border-b-2 border-amber-400 pb-1 font-medium">
                  服務搜索
                </button>
                <button className="text-slate-400 hover:text-white transition-colors">
                  環境管理
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full max-w-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-xl rounded-2xl" />
                <div className="relative flex items-center bg-slate-900/80 border border-amber-500/30 rounded-xl overflow-hidden backdrop-blur-sm">
                  <Search className="w-5 h-5 text-slate-400 ml-4" />
                  <input
                    type="text"
                    placeholder="輸入服務名稱..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 px-4 py-4 text-base"
                  />
                  <button className="bg-amber-500 hover:bg-amber-400 text-black font-medium px-6 py-2 m-2 rounded-lg transition-colors">
                    搜索
                  </button>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex items-center gap-4 mt-4">
                <EnvSelector />
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300 font-medium">服務列表</span>
                <span className="text-slate-500 text-sm ml-2">
                  {filteredServices.length} 個服務
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Group Filters */}
                <div className="flex items-center gap-1 bg-slate-900/50 rounded-lg p-1 border border-white/5">
                  <button
                    onClick={() => setActiveGroup(null)}
                    className={clsx(
                      "px-3 py-1.5 rounded-md text-sm transition-all",
                      !activeGroup
                        ? "bg-amber-500/20 text-amber-400"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    全部
                  </button>
                  {serviceGroups.map(group => (
                    <button
                      key={group}
                      onClick={() => setActiveGroup(group)}
                      className={clsx(
                        "px-3 py-1.5 rounded-md text-sm transition-all",
                        activeGroup === group
                          ? "bg-amber-500/20 text-amber-400"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      {group}
                    </button>
                  ))}
                </div>

                <div className="w-px h-6 bg-white/10" />

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-slate-900/50 rounded-lg p-1 border border-white/5">
                  <button
                    onClick={() => setViewMode('card')}
                    className={clsx(
                      "p-1.5 rounded-md transition-all",
                      viewMode === 'card' ? "bg-amber-500 text-black" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={clsx(
                      "p-1.5 rounded-md transition-all",
                      viewMode === 'table' ? "bg-amber-500 text-black" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Table2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Config Button */}
                <button
                  onClick={() => setIsConfigOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-white/5"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>配置</span>
                </button>
              </div>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-dashed border-slate-700 bg-slate-900/20">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-slate-300 mb-2">
                  {searchQuery ? '找不到匹配的服務' : '尚無服務'}
                </h3>
                <p className="text-slate-500 text-sm">
                  {searchQuery ? '請嘗試其他關鍵字' : '請先添加服務配置'}
                </p>
              </div>
            ) : (
              <div className={clsx(
                viewMode === 'card'
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-2"
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
