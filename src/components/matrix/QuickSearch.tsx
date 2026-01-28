import React, { useEffect, useState, useMemo } from 'react';
import { useMatrixStore } from '../../store/useMatrixStore';
import { resolveUrl } from '../../lib/urlResolver';
import { Search, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import type { ServiceDefinition, ColumnDefinition } from '../../types/schema';

// Helper for fuzzy match could go here, for now using simple includes
const filterItems = (
    services: ServiceDefinition[],
    columns: ColumnDefinition[],
    query: string,
    env: string
): Array<{ service: ServiceDefinition, column?: ColumnDefinition, url?: string }> => {
    if (!query) return [];

    const lowerQuery = query.toLowerCase();
    const results: Array<{ service: ServiceDefinition, column?: ColumnDefinition, url?: string }> = [];

    // Match "Service Name" + "Column" logic
    // e.g. "payment logs"

    // Naive implementation: 
    // 1. Loop through all cells

    services.forEach(svc => {
        // If just service matches
        if (svc.name.toLowerCase().includes(lowerQuery) || svc.id.includes(lowerQuery)) {
            results.push({ service: svc });
        }

        columns.forEach(col => {
            const combined = `${svc.name} ${col.title}`.toLowerCase();
            if (combined.includes(lowerQuery)) {
                const url = resolveUrl(svc, col, env);
                if (url) {
                    results.push({ service: svc, column: col, url });
                }
            }
        });
    });

    // Deduplicate/Sort logic would go here
    // Return top 10
    return results.slice(0, 10);
};

export const QuickSearch: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    const { config, currentEnv } = useMatrixStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && e.metaKey) {
                e.preventDefault();
                setIsOpen(prev => !prev);
                setQuery('');
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const results = useMemo(() => {
        if (!config || !query) return [];
        return filterItems(config.services, config.columns, query, currentEnv);
    }, [query, config, currentEnv]);

    // Handle arrow keys navigation
    useEffect(() => {
        const handleNav = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (results[activeIndex]?.url) {
                    window.open(results[activeIndex].url, '_blank');
                    setIsOpen(false);
                } else if (results[activeIndex]?.service) {
                    // Maybe verify navigation? For now just close
                    setIsOpen(false);
                }
            }
        };
        window.addEventListener('keydown', handleNav);
        return () => window.removeEventListener('keydown', handleNav);
    }, [isOpen, results, activeIndex]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-md transition-all">
            <div className="w-full max-w-lg bg-slate-900/80 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/5">
                <div className="flex items-center px-4 py-4 border-b border-white/5">
                    <Search className="w-5 h-5 text-indigo-400 mr-3" />
                    <input
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 font-medium"
                        placeholder="Search services or resources..."
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value);
                            setActiveIndex(0);
                        }}
                        autoFocus
                    />
                    <kbd className="text-[10px] text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/5 font-sans">ESC</kbd>
                </div>

                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                    {results.length === 0 && query && (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            No results found.
                        </div>
                    )}
                    {results.length === 0 && !query && (
                        <div className="p-8 text-center text-slate-500 text-xs">
                            Type keywords to jump to a service or resource...
                        </div>
                    )}

                    {results.map((result, idx) => (
                        <div
                            key={idx}
                            className={clsx(
                                "flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200",
                                idx === activeIndex
                                    ? "bg-indigo-500/10 text-white border border-indigo-500/20 shadow-sm"
                                    : "text-slate-400 border border-transparent hover:bg-white/5"
                            )}
                            onClick={() => {
                                if (result.url) {
                                    window.open(result.url, '_blank');
                                    setIsOpen(false);
                                }
                            }}
                            onMouseEnter={() => setActiveIndex(idx)}
                        >
                            <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-sm flex items-center gap-2">
                                    <span className={clsx(idx === activeIndex ? "text-indigo-300" : "text-slate-300")}>
                                        {result.service.name}
                                    </span>
                                    {result.column && <span className="text-slate-600">/</span>}
                                    {result.column && result.column.title}
                                </span>
                                {result.url && (
                                    <span className="text-[10px] text-slate-500 truncate max-w-[350px] font-mono opacity-70">{result.url}</span>
                                )}
                            </div>

                            {result.url && (
                                <ArrowRight className={clsx(
                                    "w-4 h-4 transition-transform duration-200",
                                    idx === activeIndex ? "text-indigo-400 translate-x-0" : "opacity-0 -translate-x-2"
                                )} />
                            )}
                        </div>
                    ))}
                </div>

                {results.length > 0 && (
                    <div className="px-4 py-2 bg-white/5 text-[10px] text-slate-500 flex justify-between border-t border-white/5">
                        <span>Use arrows to navigate</span>
                        <span>Enter to select</span>
                    </div>
                )}
            </div>
        </div>
    );
};
