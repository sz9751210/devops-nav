import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigationStore } from '../../store/useMatrixStore';
import { ChevronDown, Search, Star, Clock, Globe } from 'lucide-react';
import { clsx } from 'clsx';
import type { Environment, EnvGroup } from '../../types/schema';

export const EnvSelector: React.FC = () => {
    const { config, currentEnv, setEnv, recentEnvs, toggleFavoriteEnv, isFavoriteEnv } = useNavigationStore();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Auto-group environments by prefix if no manual groups defined
    const groupedEnvs = useMemo(() => {
        const envs = config.environments;
        const manualGroups = config.envGroups || [];

        if (manualGroups.length > 0) {
            // Use manual groups and match environments by pattern
            const matchedEnvs = new Set<string>();
            const processedGroups: EnvGroup[] = [];

            manualGroups.forEach(group => {
                const groupEnvs: Environment[] = [];

                if (group.pattern) {
                    // Convert glob pattern to regex (e.g., "brpp-*" -> /^brpp-.*$/)
                    const regexPattern = group.pattern
                        .replace(/\*/g, '.*')
                        .replace(/\?/g, '.');
                    const regex = new RegExp(`^${regexPattern}$`);

                    envs.forEach(env => {
                        if (regex.test(env) && !matchedEnvs.has(env)) {
                            groupEnvs.push(env);
                            matchedEnvs.add(env);
                        }
                    });
                } else {
                    // Use manually assigned environments
                    group.environments.forEach(env => {
                        if (envs.includes(env) && !matchedEnvs.has(env)) {
                            groupEnvs.push(env);
                            matchedEnvs.add(env);
                        }
                    });
                }

                if (groupEnvs.length > 0) {
                    processedGroups.push({
                        ...group,
                        environments: groupEnvs,
                    });
                }
            });

            // Add ungrouped environments
            const ungrouped = envs.filter(env => !matchedEnvs.has(env));
            if (ungrouped.length > 0) {
                processedGroups.push({
                    id: 'other',
                    name: 'Other',
                    environments: ungrouped,
                    icon: '📦',
                });
            }

            return processedGroups;
        }

        // Auto-group by prefix (e.g., lab-, platform-, prod-)
        const grouped = new Map<string, Environment[]>();
        const ungrouped: Environment[] = [];

        envs.forEach(env => {
            const match = env.match(/^([a-z]+)-/);
            if (match) {
                const prefix = match[1];
                if (!grouped.has(prefix)) {
                    grouped.set(prefix, []);
                }
                grouped.get(prefix)!.push(env);
            } else {
                ungrouped.push(env);
            }
        });

        // Convert to EnvGroup format
        const autoGroups: EnvGroup[] = Array.from(grouped.entries()).map(([prefix, environments]) => ({
            id: prefix,
            name: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Environments`,
            environments,
            icon: getGroupIcon(prefix),
        }));

        if (ungrouped.length > 0) {
            autoGroups.push({
                id: 'other',
                name: 'Other',
                environments: ungrouped,
                icon: '📦',
            });
        }

        return autoGroups;
    }, [config.environments, config.envGroups]);

    const favorites = config.favoriteEnvs || [];
    const recent = recentEnvs.filter(env => config.environments.includes(env));

    // Filter environments based on search
    const filteredGroups = useMemo(() => {
        if (!searchQuery) return groupedEnvs;

        const query = searchQuery.toLowerCase();
        return groupedEnvs.map(group => ({
            ...group,
            environments: group.environments.filter(env => env.toLowerCase().includes(query))
        })).filter(group => group.environments.length > 0);
    }, [groupedEnvs, searchQuery]);

    const handleSelect = (env: Environment) => {
        setEnv(env);
        setIsOpen(false);
        setSearchQuery('');
    };

    if (!config || config.environments.length === 0) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-hover)] transition-all backdrop-blur-sm min-w-[200px] justify-between group shadow-sm"
            >
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[var(--foreground-muted)]" />
                    <span className="font-medium text-[var(--foreground)]">{currentEnv.toUpperCase()}</span>
                </div>
                <ChevronDown className={clsx(
                    "w-4 h-4 text-[var(--foreground-muted)] transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-[320px] bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-2xl backdrop-blur-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Search */}
                    <div className="p-3 border-b border-[var(--border)] bg-[var(--header-bg)]/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)] group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search environments..."
                                className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-md text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {/* Favorites */}
                        {favorites.length > 0 && !searchQuery && (
                            <div className="p-2 border-b border-[var(--border)]">
                                <div className="px-3 py-2 text-xs font-bold text-[var(--foreground-muted)] opacity-60 uppercase tracking-wider flex items-center gap-2">
                                    <Star className="w-3 h-3" />
                                    Favorites
                                </div>
                                {favorites.map(env => (
                                    <EnvItem
                                        key={env}
                                        env={env}
                                        isActive={env === currentEnv}
                                        isFavorite={true}
                                        onSelect={handleSelect}
                                        onToggleFavorite={toggleFavoriteEnv}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Recent */}
                        {recent.length > 0 && !searchQuery && (
                            <div className="p-2 border-b border-[var(--border)]">
                                <div className="px-3 py-2 text-xs font-bold text-[var(--foreground-muted)] opacity-60 uppercase tracking-wider flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    Recent
                                </div>
                                {recent.slice(0, 5).map(env => (
                                    <EnvItem
                                        key={env}
                                        env={env}
                                        isActive={env === currentEnv}
                                        isFavorite={isFavoriteEnv(env)}
                                        onSelect={handleSelect}
                                        onToggleFavorite={toggleFavoriteEnv}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Grouped Environments */}
                        {filteredGroups.map(group => (
                            <div key={group.id} className="p-2 border-b border-white/5 last:border-0">
                                <div className="px-3 py-2 text-xs font-bold text-[var(--foreground-muted)] opacity-70 uppercase tracking-wider flex items-center gap-2">
                                    <span>{group.icon || '📦'}</span>
                                    {group.name}
                                </div>
                                {group.environments.map(env => (
                                    <EnvItem
                                        key={env}
                                        env={env}
                                        isActive={env === currentEnv}
                                        isFavorite={isFavoriteEnv(env)}
                                        onSelect={handleSelect}
                                        onToggleFavorite={toggleFavoriteEnv}
                                    />
                                ))}
                            </div>
                        ))}

                        {filteredGroups.length === 0 && (
                            <div className="p-8 text-center text-[var(--foreground-muted)] opacity-50 text-sm italic font-mono uppercase tracking-widest">
                                No matches found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper component for environment items
interface EnvItemProps {
    env: Environment;
    isActive: boolean;
    isFavorite: boolean;
    onSelect: (env: Environment) => void;
    onToggleFavorite: (env: Environment) => void;
}

// Helper function to get environment color based on type
function getEnvColor(env: string): { bg: string; border: string; text: string } {
    const envLower = env.toLowerCase();
    if (envLower.includes('prod') || envLower.includes('production') || envLower.includes('prd')) {
        return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' };
    }
    if (envLower.includes('staging') || envLower.includes('stg') || envLower.includes('uat')) {
        return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' };
    }
    if (envLower.includes('dev') || envLower.includes('development') || envLower.includes('local')) {
        return { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' };
    }
    if (envLower.includes('qa') || envLower.includes('test')) {
        return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' };
    }
    if (envLower.includes('lab')) {
        return { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' };
    }
    return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-[var(--foreground-muted)]' };
}

const EnvItem: React.FC<EnvItemProps> = ({ env, isActive, isFavorite, onSelect, onToggleFavorite }) => {
    const color = getEnvColor(env);
    return (
        <div
            className={clsx(
                "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all group",
                isActive
                    ? `${color.bg} ${color.text} border ${color.border}`
                    : "text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            )}
        >
            <button
                onClick={() => onSelect(env)}
                className="flex items-center gap-2 flex-1 text-left"
            >
                <span className={clsx(
                    "w-1 h-3 rounded-full shrink-0",
                    color.bg.replace('/10', '')
                )} />
                <span className="font-medium text-sm uppercase tracking-wide">{env}</span>
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(env);
                }}
                className={clsx(
                    "p-1 rounded transition-colors opacity-0 group-hover:opacity-100",
                    isFavorite ? "text-yellow-500 opacity-100" : "text-[var(--foreground-muted)] opacity-40 hover:opacity-100 hover:text-yellow-500"
                )}
            >
                <Star className={clsx("w-3.5 h-3.5", isFavorite && "fill-current")} />
            </button>
        </div>
    );
};

// Helper function to get icon for auto-grouped environments
function getGroupIcon(prefix: string): string {
    const iconMap: Record<string, string> = {
        'lab': '🧪',
        'platform': '🚀',
        'prod': '🔥',
        'production': '🔥',
        'staging': '🎭',
        'dev': '💻',
        'development': '💻',
        'test': '🧪',
        'qa': '✅',
    };
    return iconMap[prefix.toLowerCase()] || '📦';
}
