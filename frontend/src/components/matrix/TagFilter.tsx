import React from 'react';
import { useNavigationStore } from '../../store/useMatrixStore';
import { Tag, Hash, X } from 'lucide-react';
import { clsx } from 'clsx';

interface TagFilterProps {
    selectedTags: string[];
    onToggleTag: (tag: string) => void;
    onClear: () => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({ selectedTags, onToggleTag, onClear }) => {
    const { config } = useNavigationStore();

    // Extract all unique tags
    const allTags = React.useMemo(() => {
        const tags = new Set<string>();
        config.services.forEach(s => {
            s.tags?.forEach(t => tags.add(t));
        });
        return Array.from(tags).sort();
    }, [config.services]);

    if (allTags.length === 0) return null;

    return (
        <div className="flex flex-col gap-2 p-1">
            <div className="flex items-center justify-between px-2 mb-1">
                <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                    <Tag className="w-3 h-3" />
                    Filter by Tags
                </div>
                {selectedTags.length > 0 && (
                    <button
                        onClick={onClear}
                        className="text-[9px] text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1"
                    >
                        Clear
                        <X className="w-2.5 h-2.5" />
                    </button>
                )}
            </div>

            <div className="flex flex-wrap gap-1.5">
                {allTags.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                        <button
                            key={tag}
                            onClick={() => onToggleTag(tag)}
                            className={clsx(
                                "flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all border",
                                isSelected
                                    ? "bg-amber-500/10 border-amber-500/50 text-amber-500"
                                    : "bg-white/5 border-white/5 text-[var(--foreground-muted)] hover:border-white/10 hover:text-[var(--foreground)]"
                            )}
                        >
                            <Hash className={clsx("w-2.5 h-2.5", isSelected ? "text-amber-500" : "text-[var(--foreground-muted)] opacity-50")} />
                            {tag}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
