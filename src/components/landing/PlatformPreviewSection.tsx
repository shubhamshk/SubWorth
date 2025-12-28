'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Badge from '@/components/ui/Badge';

const platforms = [
    {
        id: 1,
        name: 'Netflix',
        logo: 'N',
        color: 'from-red-600 to-red-800',
        price: '$15.49/mo',
        verdict: 'buy' as const,
        score: 8.5,
        releases: [
            'Squid Game S2',
            'Black Mirror S7',
            'The Witcher: Sirens',
        ],
    },
    {
        id: 2,
        name: 'Prime Video',
        logo: 'P',
        color: 'from-blue-500 to-blue-700',
        price: '$8.99/mo',
        verdict: 'continue' as const,
        score: 7.2,
        releases: [
            'Reacher S3',
            'The Boys: Gen V S2',
            'Citadel S2',
        ],
    },
    {
        id: 3,
        name: 'Disney+',
        logo: 'D+',
        color: 'from-blue-600 to-purple-700',
        price: '$13.99/mo',
        verdict: 'skip' as const,
        score: 4.1,
        releases: [
            'Skeleton Crew',
            'Mufasa (Coming Soon)',
        ],
    },
    {
        id: 4,
        name: 'HBO Max',
        logo: 'H',
        color: 'from-purple-600 to-purple-800',
        price: '$15.99/mo',
        verdict: 'buy' as const,
        score: 8.1,
        releases: [
            'House of the Dragon S2',
            'The Penguin',
            'Dune: Prophecy',
        ],
    },
    {
        id: 5,
        name: 'Hulu',
        logo: 'h',
        color: 'from-green-500 to-green-700',
        price: '$7.99/mo',
        verdict: 'pause' as const,
        score: 5.5,
        releases: [
            'Only Murders S4',
            'The Bear S3',
        ],
    },
];

export default function PlatformPreviewSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    return (
        <section ref={sectionRef} className="py-16 sm:py-24 md:py-32 relative">
            {/* Section header */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-12 mb-8 sm:mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                        This Month's <span className="text-gradient">Verdicts</span>
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-foreground-muted max-w-2xl mx-auto px-4">
                        December 2024's platform breakdown — scroll to explore
                    </p>
                </motion.div>
            </div>

            {/* Horizontal scrolling cards - added padding top/bottom for hover space */}
            <div className="relative py-4">
                <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-12 snap-x snap-mandatory">
                    {/* Spacer for centering */}
                    <div className="flex-shrink-0 w-[calc((100vw-1200px)/2)] hidden lg:block" />

                    {platforms.map((platform, index) => (
                        <motion.div
                            key={platform.id}
                            initial={{ opacity: 0, y: 40 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.1 * index }}
                            whileHover={{ y: -12, scale: 1.03 }}
                            onHoverStart={() => setHoveredId(platform.id)}
                            onHoverEnd={() => setHoveredId(null)}
                            className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] snap-center"
                            style={{
                                zIndex: hoveredId === platform.id ? 50 : 1,
                                position: 'relative'
                            }}
                        >
                            <div
                                className={`
                  glass-card p-4 sm:p-6 h-full transition-all duration-300
                  ${hoveredId === platform.id
                                        ? 'shadow-2xl shadow-primary/20 border-primary/40'
                                        : 'hover:shadow-card-hover hover:border-primary/30'
                                    }
                `}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4 sm:mb-6">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white font-bold text-base sm:text-xl shadow-lg`}>
                                            {platform.logo}
                                        </div>
                                        <div>
                                            <h3 className="text-base sm:text-xl font-semibold">{platform.name}</h3>
                                            <p className="text-xs sm:text-sm text-foreground-muted">{platform.price}</p>
                                        </div>
                                    </div>
                                    <Badge verdict={platform.verdict} size="sm" />
                                </div>

                                {/* Score bar */}
                                <div className="mb-4 sm:mb-6">
                                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                                        <span className="text-foreground-muted">Value Score</span>
                                        <span className="font-semibold">{platform.score}/10</span>
                                    </div>
                                    <div className="h-1.5 sm:h-2 bg-background rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={isInView ? { width: `${platform.score * 10}%` } : {}}
                                            transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                                            className={`h-full rounded-full ${platform.score >= 7 ? 'bg-verdict-buy' :
                                                    platform.score >= 5 ? 'bg-verdict-pause' : 'bg-verdict-skip'
                                                }`}
                                        />
                                    </div>
                                </div>

                                {/* Releases */}
                                <div>
                                    <h4 className="text-xs sm:text-sm font-medium text-foreground-muted mb-2 sm:mb-3">Top Releases</h4>
                                    <ul className="space-y-1.5 sm:space-y-2">
                                        {platform.releases.map((release, i) => (
                                            <li key={i} className="flex items-center gap-2 text-xs sm:text-sm">
                                                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                <span className="truncate">{release}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Spacer for centering */}
                    <div className="flex-shrink-0 w-[calc((100vw-1200px)/2)] hidden lg:block" />
                </div>
            </div>

            {/* Scroll hint */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.8 }}
                className="flex justify-center mt-6 sm:mt-8 gap-1.5 sm:gap-2"
            >
                {platforms.map((_, i) => (
                    <div
                        key={i}
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${i === 0 ? 'bg-primary' : 'bg-glass-border'
                            }`}
                    />
                ))}
            </motion.div>
        </section>
    );
}
