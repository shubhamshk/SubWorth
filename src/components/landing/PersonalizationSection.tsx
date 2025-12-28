'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Badge from '@/components/ui/Badge';

const interests = [
    { id: 'movies', label: 'Movies', emoji: '🎬' },
    { id: 'anime', label: 'Anime', emoji: '🎌' },
    { id: 'sports', label: 'Sports', emoji: '⚽' },
    { id: 'kdrama', label: 'K-Drama', emoji: '🇰🇷' },
    { id: 'documentary', label: 'Docs', emoji: '🎥' },
    { id: 'comedy', label: 'Comedy', emoji: '😂' },
];

const platformRecommendations: Record<string, { name: string; verdict: 'buy' | 'skip' | 'continue' | 'pause'; reason: string }[]> = {
    movies: [
        { name: 'Netflix', verdict: 'buy', reason: 'New releases this month' },
        { name: 'Prime Video', verdict: 'continue', reason: 'Good catalog' },
    ],
    anime: [
        { name: 'Crunchyroll', verdict: 'buy', reason: "Winter 2024 lineup" },
        { name: 'Netflix', verdict: 'continue', reason: 'Limited anime' },
    ],
    sports: [
        { name: 'ESPN+', verdict: 'buy', reason: 'NFL + Live sports' },
        { name: 'Peacock', verdict: 'pause', reason: 'Off-season' },
    ],
    kdrama: [
        { name: 'Netflix', verdict: 'buy', reason: 'Squid Game S2' },
        { name: 'Viki', verdict: 'continue', reason: 'Good selection' },
    ],
    documentary: [
        { name: 'Netflix', verdict: 'buy', reason: 'Strong doc catalog' },
        { name: 'Apple TV+', verdict: 'continue', reason: 'Quality originals' },
    ],
    comedy: [
        { name: 'Prime Video', verdict: 'buy', reason: 'Stand-up specials' },
        { name: 'Netflix', verdict: 'continue', reason: 'Comedy series' },
    ],
};

export default function PersonalizationSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
    const [selectedInterests, setSelectedInterests] = useState<string[]>(['movies', 'anime']);

    const toggleInterest = (id: string) => {
        setSelectedInterests(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    // Get recommendations based on selected interests
    const recommendations = selectedInterests.flatMap(interest =>
        platformRecommendations[interest] || []
    ).reduce((acc, curr) => {
        const existing = acc.find(p => p.name === curr.name);
        if (!existing) {
            acc.push(curr);
        }
        return acc;
    }, [] as typeof platformRecommendations['movies']);

    return (
        <section ref={sectionRef} className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute top-0 right-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-accent/10 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8 sm:mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                        Built for <span className="text-gradient">You</span>
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-foreground-muted max-w-2xl mx-auto px-4">
                        Toggle your interests and watch recommendations update in real time
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
                    {/* Interest toggles */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="glass-card p-5 sm:p-6 md:p-8"
                    >
                        <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-4 sm:mb-6">What do you watch?</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                            {interests.map((interest) => (
                                <motion.button
                                    key={interest.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => toggleInterest(interest.id)}
                                    className={`
                    p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-300 text-left
                    ${selectedInterests.includes(interest.id)
                                            ? 'bg-primary/20 border-primary/50 shadow-glow-sm'
                                            : 'bg-background/50 border-glass-border hover:border-primary/30'
                                        }
                  `}
                                >
                                    <span className="text-xl sm:text-2xl mb-1 sm:mb-2 block">{interest.emoji}</span>
                                    <span className="text-xs sm:text-sm font-medium">{interest.label}</span>
                                </motion.button>
                            ))}
                        </div>

                        <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-foreground-muted text-center">
                            Selected: {selectedInterests.length} interests
                        </p>
                    </motion.div>

                    {/* Live recommendations */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="glass-card p-5 sm:p-6 md:p-8"
                    >
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h3 className="text-base sm:text-lg md:text-xl font-semibold">Your Recommendations</h3>
                            <span className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-verdict-buy">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-verdict-buy animate-pulse" />
                                Live
                            </span>
                        </div>

                        <AnimatePresence mode="popLayout">
                            {recommendations.length > 0 ? (
                                <motion.div layout className="space-y-2 sm:space-y-3">
                                    {recommendations.map((rec, index) => (
                                        <motion.div
                                            key={rec.name}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-background/50 border border-glass-border"
                                        >
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center font-bold text-sm sm:text-base">
                                                    {rec.name[0]}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm sm:text-base font-medium">{rec.name}</h4>
                                                    <p className="text-xs sm:text-sm text-foreground-muted">{rec.reason}</p>
                                                </div>
                                            </div>
                                            <Badge verdict={rec.verdict} size="sm" />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-8 sm:py-12 text-foreground-muted"
                                >
                                    <p className="text-sm">Select interests to see recommendations</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.p
                            layout
                            className="mt-4 sm:mt-6 text-xs sm:text-sm text-foreground-muted text-center"
                        >
                            This app adapts to <span className="text-foreground font-medium">YOU</span>, not everyone.
                        </motion.p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
