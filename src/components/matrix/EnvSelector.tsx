import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useMatrixStore } from '../../store/useMatrixStore';
import { ChevronDown, Search, Star, Clock, Globe } from 'lucide-react';
import { clsx } from 'clsx';
import type { Environment, EnvGroup } from '../../types/schema';

export const EnvSelector: React.FC = () => {
    const { config, currentEnv, setEnv, recentEnvs, toggleFavoriteEnv, isFavoriteEnv } = useMatrixStore();
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
                className="flex items-center gap-2 px-4 py-2 bg-slate-900/40 border border-white/5 rounded-xl hover:bg-slate-800/50 transition-all backdrop-blur-sm min-w-[200px] justify-between group"
            >
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span className="font-medium text-white">{currentEnv.toUpperCase()}</span>
                </div>
                <ChevronDown className={clsx(
                    "w-4 h-4 text-slate-400 transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-[320px] bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Search */}
                    <div className="p-3 border-b border-white/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search environments..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-white/5 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {/* Favorites */}
                        {favorites.length > 0 && !searchQuery && (
                            <div className="p-2 border-b border-white/5">
                                <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
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
                            <div className="p-2 border-b border-white/5">
                                <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
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
                                <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
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
                            <div className="p-8 text-center text-slate-500 text-sm">
                                No environments found
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

const EnvItem: React.FC<EnvItemProps> = ({ env, isActive, isFavorite, onSelect, onToggleFavorite }) => {
    return (
        <div
            className={clsx(
                "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all group",
                isActive
                    ? "bg-indigo-500/10 text-white border border-indigo-500/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
        >
            <button
                onClick={() => onSelect(env)}
                className="flex-1 text-left font-medium text-sm uppercase tracking-wide"
            >
                {env}
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(env);
                }}
                className={clsx(
                    "p-1 rounded transition-colors opacity-0 group-hover:opacity-100",
                    isFavorite ? "text-yellow-400 opacity-100" : "text-slate-500 hover:text-yellow-400"
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
