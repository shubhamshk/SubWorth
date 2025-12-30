'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Platform } from '@/data/platforms';
import { getContentByProvider, TMDBItem } from '@/app/actions/tmdb';
import Image from 'next/image';
import { Film, Tv, Star } from 'lucide-react';

interface PlatformPreviewCardProps {
    platform: Platform;
    tmdbProviderId: number;
}

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // Optimized size for cards

export default function PlatformPreviewCard({ platform, tmdbProviderId }: PlatformPreviewCardProps) {
    const [content, setContent] = useState<{ movies: TMDBItem[], series: TMDBItem[] }>({ movies: [], series: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await getContentByProvider(tmdbProviderId);
                setContent(data);
            } catch (error) {
                console.error("Failed to fetch content", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [tmdbProviderId]);

    const renderContentRow = (title: string, icon: React.ReactNode, items: TMDBItem[]) => (
        <div className="mb-6 last:mb-0">
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-foreground-muted uppercase tracking-wider">
                {icon}
                {title} <span className="text-xs opacity-50 ml-auto font-normal">Last 30 Days</span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mask-fade-right">
                {loading ? (
                    [1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-[110px] h-[165px] flex-shrink-0 bg-white/5 rounded-lg animate-pulse" />
                    ))
                ) : items.length > 0 ? (
                    items.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="w-[110px] flex-shrink-0 group cursor-pointer relative"
                            title={item.title || item.name}
                        >
                            <div className="aspect-[2/3] relative rounded-lg overflow-hidden mb-2 shadow-lg group-hover:scale-105 transition-transform duration-300 border border-white/5 group-hover:border-white/20">
                                {item.poster_path ? (
                                    <Image
                                        src={`${IMAGE_BASE_URL}${item.poster_path}`}
                                        alt={item.title || item.name || ''}
                                        fill
                                        className="object-cover"
                                        sizes="110px"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-white/10 flex items-center justify-center p-2 text-[10px] text-center">
                                        {item.title || item.name}
                                    </div>
                                )}
                                <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md rounded px-1.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                                    <Star className="w-2.5 h-2.5 text-yellow-500 fill-current" />
                                    {item.vote_average?.toFixed(1)}
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="w-full py-8 text-center text-sm text-foreground-muted bg-white/5 rounded-lg border border-dashed border-white/10">
                        No recent releases found
                    </div>
                )}
            </div>
        </div>
    );

    // Only render if there is content or while loading
    if (!loading && content.movies.length === 0 && content.series.length === 0) return null;

    return (
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white font-bold text-lg shadow-lg relative z-10 overflow-hidden shrink-0`}
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
                    <h3 className="text-xl font-bold">{platform.name}</h3>
                    <p className="text-sm text-foreground-muted">
                        Trending releases in the last 30 days
                    </p>
                </div>
            </div>

            {/* Content Lists */}
            {renderContentRow('Top Movies', <Film className="w-4 h-4 text-blue-400" />, content.movies)}
            {renderContentRow('Top Series', <Tv className="w-4 h-4 text-purple-400" />, content.series)}
        </div>
    );
}
