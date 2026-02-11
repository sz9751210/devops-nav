import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, Search, Star, Clock, Globe, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigationStore } from '../../store/useMatrixStore'; // Still need store for favorites/recent logic? Or pass as props?
// Better to use store for config/favorites/recent to keep it self-contained if possible, 
// OR pass everything as props for maximum purity. 
// Given the plan says "Reuse Logic", and it's used in AppForm where we might not want to couple *too* tightly to nav store for *selection state* but we DO need the *options* from config.
// Let's rely on store for VALID OPTIONS (config.environments) and favorites/recents, but control SELECTION via props.

import type { Environment, EnvGroup } from '../../types/schema';

interface EnvironmentPickerProps {
    selected: string | string[]; // Single string or array
    onSelect: (env: string | string[]) => void;
    multi?: boolean;
    placeholder?: string;
    variant?: 'global' | 'form';
}

export const EnvironmentPicker: React.FC<EnvironmentPickerProps> = ({
    selected,
    onSelect,
    multi = false,
    placeholder = "Select Environment",
    variant = 'global'
}) => {
    const { config, recentEnvs, toggleFavoriteEnv, isFavoriteEnv } = useNavigationStore();
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

    // Helper to check if an env is selected
    const isSelected = (env: string) => {
        if (Array.isArray(selected)) {
            return selected.includes(env);
        }
        return selected === env;
    };

    const handleSelect = (env: string) => {
        if (multi) {
            const current = Array.isArray(selected) ? selected : (selected ? [selected] : []);
            if (current.includes(env)) {
                onSelect(current.filter(e => e !== env));
            } else {
                onSelect([...current, env]);
            }
            // Don't close on multi-select
        } else {
            onSelect(env);
            setIsOpen(false);
            setSearchQuery('');
        }
    };

    // --- Grouping Logic (Reused from EnvSelector) ---
    const groupedEnvs = useMemo(() => {
        const envs = config.environments;
        const manualGroups = config.envGroups || [];

        if (manualGroups.length > 0) {
            const matchedEnvs = new Set<string>();
            const processedGroups: EnvGroup[] = [];

            manualGroups.forEach(group => {
                const groupEnvs: Environment[] = [];

                if (group.pattern) {
                    const regexPattern = group.pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
                    const regex = new RegExp(`^${regexPattern}$`);
                    envs.forEach(env => {
                        if (regex.test(env) && !matchedEnvs.has(env)) {
                            groupEnvs.push(env);
                            matchedEnvs.add(env);
                        }
                    });
                }

                if (group.environments) {
                    group.environments.forEach(env => {
                        if (envs.includes(env) && !matchedEnvs.has(env)) {
                            groupEnvs.push(env);
                            matchedEnvs.add(env);
                        }
                    });
                }

                if (groupEnvs.length > 0) {
                    processedGroups.push({ ...group, environments: groupEnvs });
                }
            });

            const ungrouped = envs.filter(env => !matchedEnvs.has(env));
            if (ungrouped.length > 0) {
                processedGroups.push({ id: 'other', name: 'Other', environments: ungrouped, icon: '📦' });
            }
            return processedGroups;
        }

        // Auto-group by prefix
        const grouped = new Map<string, Environment[]>();
        const ungrouped: Environment[] = [];
        envs.forEach(env => {
            const match = env.match(/^([a-z]+)-/);
            if (match) {
                const prefix = match[1];
                if (!grouped.has(prefix)) grouped.set(prefix, []);
                grouped.get(prefix)!.push(env);
            } else {
                ungrouped.push(env);
            }
        });

        const autoGroups: EnvGroup[] = Array.from(grouped.entries()).map(([prefix, environments]) => ({
            id: prefix,
            name: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Environments`,
            environments,
            icon: getGroupIcon(prefix),
        }));

        if (ungrouped.length > 0) {
            autoGroups.push({ id: 'other', name: 'Other', environments: ungrouped, icon: '📦' });
        }
        return autoGroups;
    }, [config.environments, config.envGroups]);

    // --- Filtering Logic ---
    const filteredGroups = useMemo(() => {
        if (!searchQuery) return groupedEnvs;
        const query = searchQuery.toLowerCase();
        return groupedEnvs.map(group => ({
            ...group,
            environments: group.environments.filter(env => env.toLowerCase().includes(query))
        })).filter(group => group.environments.length > 0);
    }, [groupedEnvs, searchQuery]);

    const favorites = config.favoriteEnvs || [];
    const recent = recentEnvs.filter(env => config.environments.includes(env));


    // Display Value
    const displayValue = useMemo(() => {
        if (Array.isArray(selected)) {
            if (selected.length === 0) return placeholder;
            if (selected.length === 1) return selected[0].toUpperCase();
            return `${selected.length} Selected`;
        }
        return selected ? selected.toUpperCase() : placeholder;
    }, [selected, placeholder]);

    if (!config || config.environments.length === 0) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
                className={clsx(
                    "flex items-center gap-2 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-hover)] transition-all justify-between group shadow-sm text-sm",
                    variant === 'global' ? "min-w-[200px]" : "w-full"
                )}
            >
                <div className="flex items-center gap-2 truncate">
                    <Globe className="w-4 h-4 text-[var(--foreground-muted)] flex-shrink-0" />
                    <span className={clsx("font-medium truncate", !selected || (Array.isArray(selected) && selected.length === 0) ? "text-[var(--foreground-muted)]" : "text-[var(--foreground)]")}>
                        {displayValue}
                    </span>
                </div>
                <ChevronDown className={clsx("w-4 h-4 text-[var(--foreground-muted)] transition-transform flex-shrink-0", isOpen && "rotate-180")} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-[320px] bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-2xl backdrop-blur-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Search */}
                    <div className="p-3 border-b border-[var(--border)] bg-[var(--header-bg)]/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
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
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
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
                                        isActive={isSelected(env)}
                                        isFavorite={true}
                                        onSelect={handleSelect}
                                        onToggleFavorite={toggleFavoriteEnv}
                                        multi={multi}
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
                                        isActive={isSelected(env)}
                                        isFavorite={isFavoriteEnv(env)}
                                        onSelect={handleSelect}
                                        onToggleFavorite={toggleFavoriteEnv}
                                        multi={multi}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Groups */}
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
                                        isActive={isSelected(env)}
                                        isFavorite={isFavoriteEnv(env)}
                                        onSelect={handleSelect}
                                        onToggleFavorite={toggleFavoriteEnv}
                                        multi={multi}
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


// --- Helper Components & Functions ---

interface EnvItemProps {
    env: Environment;
    isActive: boolean;
    isFavorite: boolean;
    onSelect: (env: Environment) => void;
    onToggleFavorite: (env: Environment) => void;
    multi: boolean;
}

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

const EnvItem: React.FC<EnvItemProps> = ({ env, isActive, isFavorite, onSelect, onToggleFavorite, multi }) => {
    const color = getEnvColor(env);

    return (
        <div
            className={clsx(
                "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all group",
                isActive
                    ? `${color.bg} ${color.text} border ${color.border}`
                    : "text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            )}
            onClick={() => onSelect(env)}
        >
            <div className="flex items-center gap-2 flex-1 text-left min-w-0">
                {multi && (
                    <div className={clsx(
                        "w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                        isActive ? `bg-amber-500 border-amber-500 text-black` : "border-[var(--foreground-muted)]"
                    )}>
                        {isActive && <Check className="w-3 h-3" />}
                    </div>
                )}
                {!multi && (
                    <span className={clsx(
                        "w-1 h-3 rounded-full shrink-0",
                        color.bg.replace('/10', '')
                    )} />
                )}
                <span className="font-medium text-sm uppercase tracking-wide truncate">{env}</span>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(env);
                }}
                className={clsx(
                    "p-1 rounded transition-colors",
                    isFavorite ? "text-yellow-500 opacity-100" : "text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 hover:text-yellow-500"
                )}
            >
                <Star className={clsx("w-3.5 h-3.5", isFavorite && "fill-current")} />
            </button>
        </div>
    );
};
