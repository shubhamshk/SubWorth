'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    glow?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', glow = false, children, ...props }, ref) => {
        const baseStyles = 'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary: 'bg-gradient-primary text-white hover:opacity-90 focus:ring-primary',
            secondary: 'glass border border-glass-border text-foreground hover:bg-glass-hover focus:ring-accent',
            ghost: 'bg-transparent text-foreground hover:bg-glass focus:ring-accent',
            outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
        };

        const sizes = {
            sm: 'px-4 py-2 text-sm',
            md: 'px-6 py-3 text-base',
            lg: 'px-8 py-4 text-lg',
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${glow ? 'glow-effect' : ''} ${className}`}
                {...props}
            >
                {children}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
