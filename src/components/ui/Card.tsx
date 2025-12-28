'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    glow?: boolean;
}

export default function Card({ children, className = '', hover = true, glow = false }: CardProps) {
    return (
        <motion.div
            whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
            transition={{ duration: 0.3 }}
            className={`
        glass-card p-6
        ${hover ? 'cursor-pointer' : ''}
        ${glow ? 'glow-effect' : ''}
        transition-shadow duration-300
        hover:shadow-card-hover
        ${className}
      `}
        >
            {children}
        </motion.div>
    );
}
