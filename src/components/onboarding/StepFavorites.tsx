'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Check } from 'lucide-react';


// Mock popular shows
const POPULAR_SHOWS = [
    { id: 'stranger-things', title: 'Stranger Things' },
    { id: 'breaking-bad', title: 'Breaking Bad' },
    { id: 'game-of-thrones', title: 'Game of Thrones' },
    { id: 'the-office', title: 'The Office' },
    { id: 'friends', title: 'Friends' },
    { id: 'naruto', title: 'Naruto' },
    { id: 'one-piece', title: 'One Piece' },
    { id: 'mirzapur', title: 'Mirzapur' },
];

export default function StepFavorites() {
    const { profile, setProfile } = useStore();
    const [search, setSearch] = useState('');

    const toggleShow = (show: { id: string; title: string }) => {
        const current = profile.favoriteShows;
        const exists = current.find(s => s.id === show.id);

        if (exists) {
            setProfile({ favoriteShows: current.filter(s => s.id !== show.id) });
        } else {
            setProfile({ favoriteShows: [...current, show] });
        }
    };

    // Filter popular shows
    const filteredShows = POPULAR_SHOWS.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Pick your favorites</h2>
                <p className="text-foreground-muted">We'll find similar content gems for you.</p>
            </div>

            {/* Search Input */}
            <div className="relative mb-6">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">
                    <Search className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    placeholder="Search for shows..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                />
            </div>

            {/* Selected Chips */}
            {profile.favoriteShows.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <AnimatePresence>
                        {profile.favoriteShows.map((show) => (
                            <motion.button
                                key={show.id}
                                layout
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                onClick={() => toggleShow(show)}
                                className="pl-3 pr-2 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors group"
                            >
                                {show.title}
                                <X className="w-3.5 h-3.5 group-hover:scale-110" />
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Selection Grid */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pb-8">
                    {filteredShows.map((show) => {
                        const isSelected = profile.favoriteShows.some(s => s.id === show.id);
                        return (
                            <button
                                key={show.id}
                                onClick={() => toggleShow(show)}
                                className={`
                                    p-4 rounded-xl text-left text-sm font-medium border transition-all flex items-center justify-between group
                                    ${isSelected
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }
                                `}
                            >
                                <span>{show.title}</span>
                                {isSelected ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Plus className="w-4 h-4 opacity-0 group-hover:opacity-50" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
