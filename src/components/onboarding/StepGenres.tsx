'use client';

import { Genre } from '@/types/onboarding';
import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';

const GENRES: Genre[] = [
    'Action', 'Drama', 'Thriller', 'Romance', 'Comedy',
    'Sci-Fi', 'Horror', 'Fantasy', 'Crime', 'Slice of Life'
];

export default function StepGenres() {
    const { profile, setProfile } = useStore();

    const toggleGenre = (genre: Genre) => {
        const current = profile.genres;
        const next = current.includes(genre)
            ? current.filter((g) => g !== genre)
            : [...current, genre];
        setProfile({ genres: next });
    };

    return (
        <div className="flex flex-col h-full justify-center">
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">What keeps you hooked?</h2>
                <p className="text-foreground-muted">Select your go-to genres for a chill evening.</p>
            </div>

            <div className="flex flex-wrap gap-3">
                {GENRES.map((genre, idx) => {
                    const isSelected = profile.genres.includes(genre);

                    return (
                        <motion.button
                            key={genre}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => toggleGenre(genre)}
                            className={`
                                px-6 py-3 rounded-full text-sm font-medium border transition-all duration-200
                                ${isSelected
                                    ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                                    : 'bg-transparent text-foreground-muted border-white/20 hover:border-white/50 hover:text-white'
                                }
                            `}
                        >
                            {genre}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
