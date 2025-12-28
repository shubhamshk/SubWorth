'use client';

import { motion } from 'framer-motion';

type VerdictType = 'buy' | 'skip' | 'continue' | 'pause';

interface BadgeProps {
    verdict: VerdictType;
    size?: 'sm' | 'md' | 'lg';
    pulse?: boolean;
}

const verdictConfig = {
    buy: {
        label: 'BUY',
        bgColor: 'bg-verdict-buy/20',
        textColor: 'text-verdict-buy',
        borderColor: 'border-verdict-buy/40',
        glowColor: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
    },
    skip: {
        label: 'SKIP',
        bgColor: 'bg-verdict-skip/20',
        textColor: 'text-verdict-skip',
        borderColor: 'border-verdict-skip/40',
        glowColor: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    },
    continue: {
        label: 'CONTINUE',
        bgColor: 'bg-verdict-continue/20',
        textColor: 'text-verdict-continue',
        borderColor: 'border-verdict-continue/40',
        glowColor: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    },
    pause: {
        label: 'PAUSE',
        bgColor: 'bg-verdict-pause/20',
        textColor: 'text-verdict-pause',
        borderColor: 'border-verdict-pause/40',
        glowColor: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    },
};

export default function Badge({ verdict, size = 'md', pulse = false }: BadgeProps) {
    const config = verdictConfig[verdict];

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    return (
        <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className={`
        inline-flex items-center font-bold tracking-wider rounded-full border
        ${config.bgColor} ${config.textColor} ${config.borderColor} ${config.glowColor}
        ${sizes[size]}
        ${pulse ? 'animate-pulse-subtle' : ''}
      `}
        >
            {config.label}
        </motion.span>
    );
}
