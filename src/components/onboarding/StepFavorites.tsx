'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Check, Loader2, Film, Tv } from 'lucide-react';
import { getPopularMovies, getPopularSeries, searchTMDB, TMDBItem } from '@/app/actions/tmdb';
import Image from 'next/image';
import { FavoriteShow } from '@/types/onboarding';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function StepFavorites() {
    const { profile, setProfile } = useStore();
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<TMDBItem[]>([]);
    const [searchResults, setSearchResults] = useState<TMDBItem[]>([]);
    const [activeTab, setActiveTab] = useState<'movies' | 'series'>('movies');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (search.length > 2) {
                setLoading(true);
                const results = await searchTMDB(search);
                setSearchResults(results);
                setLoading(false);
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Load initial data
    useEffect(() => {
        const loadInitial = async () => {
            setLoading(true);
            try {
                const [movies, series] = await Promise.all([
                    getPopularMovies(),
                    getPopularSeries()
                ]);
                // Combine or just toggle based on tab. 
                // Let's store them in state to switch quickly without refetching if possible,
                // but for simplicity we'll just fetch based on tab or fetch all.
                // Actually, let's just fetch once and store in separate refs or state if we want tabs.
                // For now, let's just load movies initially as default tab.
                setItems(movies);
            } catch (error) {
                console.error("Failed to load TMDB data", error);
            } finally {
                setLoading(false);
            }
        };
        loadInitial();
    }, []);

    // Switch tabs
    const switchTab = async (tab: 'movies' | 'series') => {
        setActiveTab(tab);
        if (search) return; // If searching, tabs don't matter as much, or we could filter search results.

        setLoading(true);
        try {
            if (tab === 'movies') {
                const res = await getPopularMovies();
                setItems(res);
            } else {
                const res = await getPopularSeries();
                setItems(res);
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleShow = (item: TMDBItem) => {
        const current = profile.favoriteShows;
        const existingIndex = current.findIndex(s => s.tmdb_id === item.id && s.media_type === item.media_type);

        if (existingIndex >= 0) {
            // Remove
            const updated = [...current];
            updated.splice(existingIndex, 1);
            setProfile({ favoriteShows: updated });
        } else {
            // Add
            if (current.length >= 10) return; // Limit

            const newShow: FavoriteShow = {
                id: `${item.media_type}-${item.id}`,
                tmdb_id: item.id,
                title: item.title || item.name || 'Unknown',
                media_type: item.media_type || (activeTab === 'movies' ? 'movie' : 'tv'),
                poster_path: item.poster_path
            };
            setProfile({ favoriteShows: [...current, newShow] });
        }
    };

    const displayItems = search.length > 2 ? searchResults : items;

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Pick your favorites</h2>
                <p className="text-foreground-muted">Select up to 10 movies or TV shows you love. ({profile.favoriteShows.length}/10)</p>
            </div>

            {/* Search Input */}
            <div className="relative mb-6">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">
                    <Search className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    placeholder="Search movies & TV shows..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                />
            </div>

            {/* Tabs (Only show if not searching) */}
            {search.length <= 2 && (
                <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
                    <button
                        onClick={() => switchTab('movies')}
                        className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors ${activeTab === 'movies' ? 'text-primary border-b-2 border-primary' : 'text-foreground-muted hover:text-foreground'}`}
                    >
                        <Film className="w-4 h-4" /> Movies
                    </button>
                    <button
                        onClick={() => switchTab('series')}
                        className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors ${activeTab === 'series' ? 'text-primary border-b-2 border-primary' : 'text-foreground-muted hover:text-foreground'}`}
                    >
                        <Tv className="w-4 h-4" /> TV Series
                    </button>
                </div>
            )}

            {/* Selected Chips */}
            {profile.favoriteShows.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6 p-4 bg-white/5 rounded-2xl border border-white/5 max-h-[120px] overflow-y-auto custom-scrollbar">
                    <AnimatePresence>
                        {profile.favoriteShows.map((show) => (
                            <motion.button
                                key={show.id}
                                layout
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                onClick={() => {
                                    // Manually construct a skeletal TMDB item to toggle off
                                    // logic checks ID so this works
                                    toggleShow({
                                        id: show.tmdb_id,
                                        media_type: show.media_type
                                    } as TMDBItem);
                                }}
                                className="pl-3 pr-2 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors group"
                            >
                                <span className="truncate max-w-[150px]">{show.title}</span>
                                <X className="w-3.5 h-3.5 group-hover:scale-110 flex-shrink-0" />
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Selection Grid */}
            <div className="flex-1 overflow-y-auto scrollbar-hide min-h-[300px]">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-3 pb-8">
                        {displayItems.map((item) => {
                            // Correctly check if item is selected
                            const isSelected = profile.favoriteShows.some(
                                s => s.tmdb_id === item.id && s.media_type === (item.media_type || (activeTab === 'movies' ? 'movie' : 'tv'))
                            );

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => toggleShow(item)}
                                    className={`
                                        relative aspect-[2/3] rounded-xl overflow-hidden group transition-all duration-200
                                        ${isSelected ? 'ring-2 ring-primary scale-95' : 'hover:scale-105'}
                                    `}
                                >
                                    {item.poster_path ? (
                                        <Image
                                            src={`${IMAGE_BASE_URL}${item.poster_path}`}
                                            alt={item.title || item.name || 'Poster'}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 33vw, 20vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-white/10 flex items-center justify-center p-2 text-center text-xs text-muted-foreground">
                                            No Image
                                        </div>
                                    )}

                                    {/* Overlay Gradient */}
                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity ${isSelected ? 'opacity-80' : ''}`} />

                                    {/* Selection Check */}
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 bg-primary rounded-full p-1 shadow-lg z-10">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}

                                    {/* Title at bottom */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3 pt-6 bg-gradient-to-t from-black to-transparent">
                                        <p className="text-xs font-semibold text-white truncate text-shadow-sm">
                                            {item.title || item.name}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {!loading && displayItems.length === 0 && (
                    <div className="text-center text-foreground-muted mt-10">
                        {search ? 'No results found.' : 'No items to display.'}
                    </div>
                )}

                <div className="py-4 text-center">
                    <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/20 uppercase tracking-widest hover:text-white/40 transition-colors">
                        Powered by TMDB
                    </a>
                </div>
            </div>
        </div>
    );
}
