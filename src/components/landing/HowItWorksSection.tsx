'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Eye, BarChart3, CheckCircle } from 'lucide-react';

const steps = [
    {
        icon: Eye,
        title: 'Tell us what you love watching',
        description: 'Anime, Movies, Sports, K-Drama, True Crime — pick your interests.',
        mockContent: ['🎬 Movies', '📺 Anime', '⚽ Sports', '🎭 Drama'],
    },
    {
        icon: BarChart3,
        title: 'We analyze this month\'s releases',
        description: 'Our algorithm scores every platform based on YOUR preferences.',
        mockContent: ['Scoring releases...', 'Checking quality...', 'Calculating value...'],
    },
    {
        icon: CheckCircle,
        title: 'Get a clear verdict — Buy or Skip',
        description: 'No guesswork. Just a simple, personalized recommendation.',
        mockContent: ['BUY Netflix', 'SKIP Disney+', 'CONTINUE Prime'],
    },
];

export default function HowItWorksSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    return (
        <section ref={sectionRef} className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-accent/5 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 sm:mb-16 md:mb-20"
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                        How It <span className="text-gradient">Works</span>
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-foreground-muted max-w-2xl mx-auto px-4">
                        Three simple steps to smarter subscriptions
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-12">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
                                className="relative group"
                            >
                                {/* Connection line - hidden on mobile */}
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-16 left-[calc(50%+80px)] w-[calc(100%-100px)] h-px bg-gradient-to-r from-glass-border to-transparent" />
                                )}

                                {/* Card */}
                                <div className="glass-card p-5 sm:p-6 md:p-8 h-full hover:border-primary/30 transition-all duration-300 group-hover:shadow-glow-sm">
                                    {/* Step number */}
                                    <div className="absolute -top-3 sm:-top-4 -left-1 sm:-left-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-glow-sm">
                                        {index + 1}
                                    </div>

                                    {/* Icon */}
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary/20 transition-colors">
                                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3">{step.title}</h3>
                                    <p className="text-sm text-foreground-muted mb-4 sm:mb-6">{step.description}</p>

                                    {/* Mini mock UI */}
                                    <div className="bg-background/50 rounded-lg p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                                        {step.mockContent.map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                                transition={{ delay: 0.5 + index * 0.15 + i * 0.1 }}
                                                className="flex items-center gap-2 text-xs sm:text-sm"
                                            >
                                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary" />
                                                <span className="text-foreground-muted">{item}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
