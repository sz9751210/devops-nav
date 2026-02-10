import React, { useState, useEffect, useMemo } from 'react';
import { Search, Settings, LayoutGrid, Terminal, FileText, Moon, Database } from 'lucide-react';
import { useNavigationStore } from '../../store/useMatrixStore';
import { clsx } from 'clsx';
import type { PageId } from '../layout/Sidebar';

interface CommandPaletteModalProps {
    onClose: () => void;
    onNavigate: (page: PageId) => void;
    currentEnv: string;
}

type CommandItem = {
    id: string;
    title: string;
    sub?: string;
    icon: React.ElementType;
    action: () => void;
    tags?: string[];
};

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ onClose, onNavigate }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { config } = useNavigationStore();

    // Define Actions
    const actions: CommandItem[] = useMemo(() => [
        { id: 'goto-navigation', title: 'Go to Dashboard', icon: LayoutGrid, action: () => onNavigate('navigation') },
        { id: 'goto-env', title: 'Environment Settings', icon: Settings, action: () => onNavigate('env-settings') },
        { id: 'goto-col', title: 'Column Settings', icon: Settings, action: () => onNavigate('column-settings') },
        { id: 'goto-svc', title: 'Service Settings', icon: Database, action: () => onNavigate('service-settings') },
        { id: 'goto-imp', title: 'Import / Export', icon: FileText, action: () => onNavigate('import-export') },
        // Mock actions
        { id: 'toggle-theme', title: 'Toggle Theme (Demo)', icon: Moon, action: () => alert('Theme toggle demo!') },
    ], [onNavigate]);

    // Filtered Items (Actions + Services)
    const items = useMemo(() => {
        const q = query.toLowerCase();
        const filteredActions = actions.filter(a => a.title.toLowerCase().includes(q));

        const filteredServices: CommandItem[] = config.services.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.description?.toLowerCase().includes(q)
        ).map(s => ({
            id: `svc-${s.id}`,
            title: s.name,
            sub: s.description || 'Service',
            icon: Terminal,
            action: () => {
                console.log('Jump to service', s.id);
                onClose();
            },
            tags: s.tags
        }));

        return [...filteredActions, ...filteredServices];
    }, [query, actions, config.services, onClose]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                items[selectedIndex]?.action();
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [items, selectedIndex, onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[60vh]">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--header-bg)]/50">
                    <Search className="w-5 h-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Type a command or search..."
                        className="flex-1 bg-transparent border-none outline-none text-[var(--foreground)] text-lg placeholder-slate-500"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                    />
                    <div className="px-2 py-0.5 rounded bg-white/10 text-xs text-slate-400 font-mono">ESC</div>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                    {items.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">No results found</div>
                    ) : (
                        items.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        item.action();
                                        onClose();
                                    }}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                                        index === selectedIndex ? "bg-amber-500 text-black" : "text-slate-300 hover:bg-white/5"
                                    )}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <Icon className={clsx("w-5 h-5", index === selectedIndex ? "text-black" : "text-slate-500")} />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm flex items-center gap-2">
                                            {item.title}
                                            {item.tags?.map(t => (
                                                <span key={t} className={clsx("text-xs px-1 rounded border", index === selectedIndex ? "border-black/20 bg-black/10" : "border-white/10 bg-white/5")}>
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                        {item.sub && <div className={clsx("text-xs truncate", index === selectedIndex ? "text-slate-800" : "text-slate-400")}>{item.sub}</div>}
                                    </div>
                                    {index === selectedIndex && <div className="text-xs opacity-60">↵</div>}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-[var(--background)] border-t border-[var(--border)] text-xs text-slate-400 flex justify-end gap-3">
                    <span><strong className="text-slate-300">↑↓</strong> to navigate</span>
                    <span><strong className="text-slate-300">↵</strong> to select</span>
                </div>
            </div>

            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
};
