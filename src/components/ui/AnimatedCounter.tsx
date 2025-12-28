'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
    target: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
}

export default function AnimatedCounter({
    target,
    duration = 2,
    prefix = '',
    suffix = '',
    className = '',
}: AnimatedCounterProps) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    useEffect(() => {
        if (!isInView) return;

        const startTime = Date.now();
        const endTime = startTime + duration * 1000;

        const updateCount = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / (duration * 1000), 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = Math.floor(easeOutQuart * target);

            setCount(currentCount);

            if (now < endTime) {
                requestAnimationFrame(updateCount);
            } else {
                setCount(target);
            }
        };

        requestAnimationFrame(updateCount);
    }, [isInView, target, duration]);

    return (
        <motion.span
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className={`tabular-nums ${className}`}
        >
            {prefix}
            {count.toLocaleString()}
            {suffix}
        </motion.span>
    );
}
