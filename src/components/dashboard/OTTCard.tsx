'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Calendar, Star, Plus, Check } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { Platform, VerdictType } from '@/data/platforms';
import { PlatformScore } from '@/lib/recommendations';
import { getContentByProvider, TMDBItem } from '@/app/actions/tmdb';
import Image from 'next/image';

interface OTTCardProps {
    platform: Platform;
    score: PlatformScore;
    isSubscribed?: boolean;
    onToggleSubscription?: () => void;
    tmdbProviderId?: number; // Optional until all mapped
}

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

export default function OTTCard({
    platform,
    score,
    isSubscribed = false,
    onToggleSubscription,
    tmdbProviderId
}: OTTCardProps) {
    const [content, setContent] = useState<TMDBItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tmdbProviderId) {
            setContent(platform.thisMonthContent.map(c => ({
                id: parseInt(c.id),
                title: c.title,
                poster_path: null, // Fallback
                overview: '',
                vote_average: c.rating || 0,
                release_date: c.releaseDate
            } as any)));
            setLoading(false);
            return;
        }

        const fetchContent = async () => {
            try {
                const data = await getContentByProvider(tmdbProviderId);
                setContent([...data.movies, ...data.series]);
            } catch (error) {
                console.error("Failed to fetch content", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [tmdbProviderId, platform]);

    const scoreColor =
        score.totalScore >= 7.5
            ? 'text-verdict-buy'
            : score.totalScore >= 5.5
                ? 'text-verdict-continue'
                : score.totalScore >= 4
                    ? 'text-verdict-pause'
                    : 'text-verdict-skip';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="glass-card flex flex-col hover:shadow-card-hover transition-all duration-300 hover:border-primary/30 group relative overflow-hidden h-full"
        >
            {/* Header Section */}
            <div className="p-6 pb-2">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div
                            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white font-bold text-xl shadow-lg relative z-10 overflow-hidden`}
                        >
                            {platform.logoPath ? (
                                <Image
                                    src={'https://image.tmdb.org/t/p/original' + platform.logoPath}
                                    alt={platform.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                platform.logo
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">{platform.name}</h3>
                            <p className="text-foreground-muted">
                                {platform.currency}
                                {platform.monthlyPrice}/mo
                            </p>
                        </div>
                    </div>
                    {/* Track Button - Separated as requested */}
                    <button
                        onClick={onToggleSubscription}
                        className={`
                            px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border
                            ${isSubscribed
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                : 'bg-white/5 text-foreground-muted border-white/10 hover:border-white/30 hover:bg-white/10'
                            }
                        `}
                    >
                        {isSubscribed ? (
                            <span className="flex items-center gap-1">
                                <Check className="w-3 h-3" /> Tracked
                            </span>
                        ) : (
                            <span className="flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Track
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex items-center justify-between mt-2 mb-4">
                    <Badge verdict={score.verdict} size="md" pulse={score.verdict === 'buy'} />
                    <div className="text-right">
                        <div className={`text-2xl font-bold ${scoreColor}`}>
                            {score.totalScore}/10
                        </div>
                    </div>
                </div>

                {/* Score Bar */}
                <div className="h-1.5 bg-background rounded-full overflow-hidden mb-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score.totalScore * 10}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`h-full rounded-full ${score.totalScore >= 7.5
                            ? 'bg-verdict-buy'
                            : score.totalScore >= 5.5
                                ? 'bg-verdict-continue'
                                : score.totalScore >= 4
                                    ? 'bg-verdict-pause'
                                    : 'bg-verdict-skip'
                            }`}
                    />
                </div>
            </div>

            {/* Dynamic Content Grid - The "Animated Card Flow" */}
            <div className="flex-1 bg-black/20 p-4 border-t border-glass-border">
                <div className="flex items-center gap-2 mb-3 px-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-foreground-muted">Trending Now</span>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mask-fade-right">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="w-[100px] h-[150px] flex-shrink-0 bg-white/5 rounded-lg animate-pulse" />
                        ))
                    ) : (
                        content.slice(0, 10).map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="w-[100px] flex-shrink-0 group/poster cursor-pointer"
                            >
                                <div className="aspect-[2/3] relative rounded-lg overflow-hidden mb-2 shadow-lg group-hover/poster:scale-105 transition-transform duration-300">
                                    {item.poster_path ? (
                                        <Image
                                            src={`${IMAGE_BASE_URL}${item.poster_path}`}
                                            alt={item.title || item.name || ''}
                                            fill
                                            className="object-cover"
                                            sizes="100px"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-white/10 flex items-center justify-center p-2 text-[10px] text-center">
                                            {item.title || item.name}
                                        </div>
                                    )}
                                    <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md rounded px-1 text-[10px] font-bold flex items-center gap-0.5">
                                        <Star className="w-2 h-2 text-yellow-500 fill-current" />
                                        {item.vote_average?.toFixed(1) || 'N/A'}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Savings Footer */}
            {score.potentialSavings > 0 && (
                <div className="px-6 py-3 bg-verdict-buy/5 border-t border-verdict-buy/10">
                    <p className="text-xs flex items-center justify-between">
                        <span className="text-foreground-muted">Potential Savings</span>
                        <span className="font-bold text-verdict-buy">
                            {platform.currency}{score.potentialSavings}/mo
                        </span>
                    </p>
                </div>
            )}
        </motion.div>
    );
}
