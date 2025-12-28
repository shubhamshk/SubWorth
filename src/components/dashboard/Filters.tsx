'use client';

import { Search, Filter, SortAsc, SortDesc, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';

const verdictOptions = [
    { value: 'buy', label: 'BUY', color: 'bg-verdict-buy' },
    { value: 'continue', label: 'CONTINUE', color: 'bg-verdict-continue' },
    { value: 'pause', label: 'PAUSE', color: 'bg-verdict-pause' },
    { value: 'skip', label: 'SKIP', color: 'bg-verdict-skip' },
];

const sortOptions = [
    { value: 'score', label: 'Score' },
    { value: 'price', label: 'Price' },
    { value: 'name', label: 'Name' },
];

export default function Filters() {
    const filters = useStore((state) => state.filters);
    const setSearchQuery = useStore((state) => state.setSearchQuery);
    const setVerdictFilter = useStore((state) => state.setVerdictFilter);
    const setSortBy = useStore((state) => state.setSortBy);
    const setSortOrder = useStore((state) => state.setSortOrder);
    const resetFilters = useStore((state) => state.resetFilters);

    const hasActiveFilters =
        filters.searchQuery || filters.verdictFilter || filters.sortBy !== 'score';

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 mb-6"
        >
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    <input
                        type="text"
                        placeholder="Search platforms..."
                        value={filters.searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background rounded-lg border border-glass-border focus:border-primary focus:outline-none transition-colors"
                    />
                </div>

                {/* Verdict filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-foreground-muted flex-shrink-0" />
                    <div className="flex gap-1">
                        {verdictOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() =>
                                    setVerdictFilter(
                                        filters.verdictFilter === option.value ? null : option.value
                                    )
                                }
                                className={`
                  px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all
                  ${filters.verdictFilter === option.value
                                        ? `${option.color} text-white`
                                        : 'bg-glass text-foreground-muted hover:text-foreground'
                                    }
                `}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                    <select
                        value={filters.sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'score' | 'price' | 'name')}
                        className="px-3 py-2 bg-background rounded-lg border border-glass-border focus:border-primary focus:outline-none text-sm"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                Sort: {option.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => setSortOrder(filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="p-2 rounded-lg bg-glass hover:bg-glass-hover transition-colors"
                    >
                        {filters.sortOrder === 'asc' ? (
                            <SortAsc className="w-5 h-5" />
                        ) : (
                            <SortDesc className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Reset */}
                {hasActiveFilters && (
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-foreground-muted hover:text-foreground hover:bg-glass transition-colors"
                    >
                        <X className="w-4 h-4" />
                        Reset
                    </button>
                )}
            </div>
        </motion.div>
    );
}
