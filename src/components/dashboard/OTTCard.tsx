'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Calendar, Star } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { Platform, VerdictType } from '@/data/platforms';
import { PlatformScore } from '@/lib/recommendations';

interface OTTCardProps {
    platform: Platform;
    score: PlatformScore;
    isSubscribed?: boolean;
    onToggleSubscription?: () => void;
}

export default function OTTCard({
    platform,
    score,
    isSubscribed = false,
    onToggleSubscription,
}: OTTCardProps) {
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
            className="glass-card p-6 hover:shadow-card-hover transition-all duration-300 hover:border-primary/30 group"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                    >
                        {platform.logo}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">{platform.name}</h3>
                        <p className="text-foreground-muted">
                            {platform.currency}
                            {platform.monthlyPrice}/mo
                        </p>
                    </div>
                </div>
                <Badge verdict={score.verdict} size="md" pulse={score.verdict === 'buy'} />
            </div>

            {/* Score with breakdown */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground-muted">Value Score</span>
                    <span className={`text-2xl font-bold ${scoreColor}`}>
                        {score.totalScore}/10
                    </span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
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

            {/* This month's releases */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-foreground-muted" />
                    <span className="text-sm font-medium">This Month</span>
                </div>
                <ul className="space-y-1.5">
                    {platform.thisMonthContent.slice(0, 3).map((content) => (
                        <li
                            key={content.id}
                            className="flex items-center justify-between text-sm"
                        >
                            <span className="truncate flex-1">{content.title}</span>
                            {content.rating && (
                                <span className="flex items-center gap-1 text-foreground-muted">
                                    <Star className="w-3 h-3 fill-current text-yellow-500" />
                                    {content.rating}
                                </span>
                            )}
                        </li>
                    ))}
                    {platform.thisMonthContent.length > 3 && (
                        <li className="text-sm text-foreground-muted">
                            +{platform.thisMonthContent.length - 3} more
                        </li>
                    )}
                </ul>
            </div>

            {/* Potential savings */}
            {score.potentialSavings > 0 && (
                <div className="p-3 rounded-lg bg-verdict-buy/10 border border-verdict-buy/20 mb-4">
                    <p className="text-sm">
                        <span className="text-foreground-muted">Skip to save: </span>
                        <span className="font-semibold text-verdict-buy">
                            {platform.currency}
                            {score.potentialSavings}/mo
                        </span>
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-glass-border">
                <button
                    onClick={onToggleSubscription}
                    className={`
            flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${isSubscribed
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-glass hover:bg-glass-hover text-foreground-muted hover:text-foreground'
                        }
          `}
                >
                    {isSubscribed ? 'Subscribed' : 'Track'}
                </button>
                <button className="px-4 py-2 rounded-lg bg-glass hover:bg-glass-hover transition-colors group-hover:text-primary">
                    <ExternalLink className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
