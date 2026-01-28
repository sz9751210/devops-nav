import { useState } from 'react';
import { useMatrixStore } from './store/useMatrixStore';
import { MatrixContainer } from './components/matrix/MatrixContainer';
import { EnvSelector } from './components/matrix/EnvSelector';
import { QuickSearch } from './components/matrix/QuickSearch';
import { Sidebar, type PageId } from './components/layout/Sidebar';
import { EnvironmentSettings } from './components/settings/EnvironmentSettings';
import { ColumnSettings } from './components/settings/ColumnSettings';
import { ServiceSettings } from './components/settings/ServiceSettings';
import { ImportExport } from './components/settings/ImportExport';
import { EnvGroupSettings } from './components/settings/EnvGroupSettings';

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('matrix');
  const { config } = useMatrixStore();

  const renderPage = () => {
    switch (currentPage) {
      case 'matrix':
        return (
          <div className="space-y-6">
            {/* Header for Matrix */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Service Matrix</h1>
                <p className="text-sm text-slate-500">
                  {config.services.length} services · {config.columns.length} columns
                </p>
              </div>
              <EnvSelector />
            </div>

            {config.services.length === 0 || config.columns.length === 0 ? (
              <div className="text-center py-32 rounded-3xl border border-white/5 bg-slate-900/20 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative z-10 flex flex-col items-center">
                  <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 ring-1 ring-white/10 shadow-2xl">
                    <span className="text-5xl filter drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">🚀</span>
                  </div>

                  <h3 className="text-2xl font-display font-medium text-white mb-3">
                    Welcome to OpsBridge
                  </h3>

                  <p className="text-slate-400 max-w-md mx-auto leading-relaxed mb-10">
                    Configure your service matrix to get started. Define your environments, resource types, and map your services.
                  </p>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setCurrentPage('env-settings')}
                      className="px-6 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 rounded-xl text-sm font-medium transition-all hover:scale-105 border border-white/5 hover:border-white/10 backdrop-blur-md"
                    >
                      Add Environments
                    </button>
                    <button
                      onClick={() => setCurrentPage('column-settings')}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 rounded-xl text-sm font-medium transition-all hover:scale-105"
                    >
                      Add Columns
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <MatrixContainer />
            )}
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
    <div className="flex min-h-screen selection:bg-indigo-500/30">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      <main className="flex-1 overflow-auto relative">
        <div className="max-w-7xl mx-auto p-8">
          {renderPage()}
        </div>
      </main>

      <QuickSearch />
    </div>
  );
}

export default App;
