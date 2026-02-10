import React, { useEffect, useState, useMemo } from 'react';
import { useNavigationStore } from '../../store/useMatrixStore';
import { Search, ArrowRight, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import type { ServiceDefinition, ColumnDefinition, ServiceLink } from '../../types/schema';

// Get visible links for current environment
const getVisibleLinks = (links: ServiceLink[] | undefined, env: string): ServiceLink[] => {
    if (!links) return [];
    return links.filter(link => {
        if (!link.environments || link.environments.length === 0) return true;
        return link.environments.includes(env);
    });
};

// Filter and search results
const filterItems = (
    services: ServiceDefinition[],
    columns: ColumnDefinition[],
    query: string,
    env: string
): Array<{ service: ServiceDefinition, link?: ServiceLink, column?: ColumnDefinition }> => {
    if (!query) return [];

    const lowerQuery = query.toLowerCase();
    const results: Array<{ service: ServiceDefinition, link?: ServiceLink, column?: ColumnDefinition }> = [];

    services.forEach(svc => {
        const visibleLinks = getVisibleLinks(svc.links, env);

        // If just service matches
        if (svc.name.toLowerCase().includes(lowerQuery) || svc.id.includes(lowerQuery)) {
            results.push({ service: svc });
        }

        // Search through links
        visibleLinks.forEach(link => {
            const column = columns.find(c => c.id === link.columnId);
            const combined = `${svc.name} ${link.name} ${column?.title || ''}`.toLowerCase();
            if (combined.includes(lowerQuery)) {
                results.push({ service: svc, link, column });
            }
        });
    });

    // Deduplicate and return top 10
    const seen = new Set<string>();
    return results.filter(r => {
        const key = r.link ? `${r.service.id}-${r.link.id}` : r.service.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    }).slice(0, 10);
};

export const QuickSearch: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const { config, currentEnv } = useNavigationStore();

    const results = useMemo(() => {
        return filterItems(config.services, config.columns, query, currentEnv);
    }, [config.services, config.columns, query, currentEnv]);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            // Cmd+K or Ctrl+K opens search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            // Escape closes
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', down);
        return () => window.removeEventListener('keydown', down);
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [results]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => (i + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => (i - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            const item = results[selectedIndex];
            if (item?.link?.url) {
                window.open(item.link.url, '_blank');
                setIsOpen(false);
                setQuery('');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
        >
            <div
                className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-[var(--border)] bg-[var(--header-bg)]/50">
                    <Search className="w-5 h-5 text-[var(--foreground-muted)] group-focus-within:text-amber-500 transition-colors" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="搜索服務或連結..."
                        className="flex-1 bg-transparent text-[var(--foreground)] placeholder-[var(--foreground-muted)] text-lg focus:outline-none"
                        autoFocus
                    />
                    <kbd className="px-2 py-1 rounded bg-[var(--background)] text-[var(--foreground-muted)] text-xs font-mono border border-[var(--border)]">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[50vh] overflow-y-auto p-2">
                    {results.length === 0 ? (
                        <div className="p-8 text-center text-[var(--foreground-muted)] opacity-50">
                            {query ? '找不到匹配的結果' : '輸入關鍵字搜索...'}
                        </div>
                    ) : (
                        results.map((item, index) => (
                            <div
                                key={item.link ? `${item.service.id}-${item.link.id}` : item.service.id}
                                className={clsx(
                                    "flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors",
                                    index === selectedIndex
                                        ? "bg-amber-500/10 border border-amber-500/30"
                                        : "hover:bg-[var(--surface-hover)]"
                                )}
                                onMouseEnter={() => setSelectedIndex(index)}
                                onClick={() => {
                                    if (item.link?.url) {
                                        window.open(item.link.url, '_blank');
                                        setIsOpen(false);
                                        setQuery('');
                                    }
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-amber-400 font-medium">
                                        {item.service.name}
                                    </div>
                                    {item.link && (
                                        <>
                                            <ArrowRight className="w-3 h-3 text-[var(--foreground-muted)] opacity-30" />
                                            <div className="text-[var(--foreground-muted)] text-sm">
                                                {item.link.name}
                                            </div>
                                            {item.column && (
                                                <span className="text-xs text-[var(--foreground-muted)] bg-[var(--surface-hover)] px-1.5 py-0.5 rounded">
                                                    {item.column.title}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                                {item.link && (
                                    <ExternalLink className="w-4 h-4 text-[var(--foreground-muted)] opacity-50" />
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-3 border-t border-[var(--border)] bg-[var(--background)]/50 text-xs text-[var(--foreground-muted)] opacity-60">
                    <div className="flex items-center gap-4">
                        <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] mr-1">↑↓</kbd> 導航</span>
                        <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] mr-1">Enter</kbd> 打開</span>
                    </div>
                    <span>⌘K 切換搜索</span>
                </div>
            </div>
        </div>
    );
};
