'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, BarChart3, CheckCircle } from 'lucide-react';

interface AIAnalysisLoaderProps {
    currentStep?: number;
}

const ANALYSIS_STEPS = [
    { icon: Sparkles, text: 'Analyzing your viewing taste...' },
    { icon: Zap, text: 'Matching platforms with your preferences...' },
    { icon: BarChart3, text: 'Calculating personalized verdicts...' },
    { icon: CheckCircle, text: 'Preparing your dashboard...' },
];

/**
 * AIAnalysisLoader
 * 
 * A full-screen animated loader that creates a premium "AI analysis" experience.
 * ONLY contains visuals - NO routing or business logic.
 * The parent component (OnboardingWizard) handles all state and navigation.
 */
export default function AIAnalysisLoader({ currentStep = 0 }: AIAnalysisLoaderProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[180px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-md px-6">
                {/* Animated Logo/Icon */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 relative mx-auto w-24 h-24"
                >
                    {/* Outer ring */}
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary/30"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                    {/* Middle ring */}
                    <motion.div
                        className="absolute inset-2 rounded-full border-2 border-accent/40"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                    />
                    {/* Inner glow */}
                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl sm:text-3xl font-bold mb-4 text-white"
                >
                    Preparing Your Experience
                </motion.h2>

                {/* Progress Steps */}
                <div className="space-y-3 mb-8">
                    {ANALYSIS_STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                        ? 'bg-primary/20 border border-primary/50'
                                        : isCompleted
                                            ? 'bg-white/5 border border-white/10'
                                            : 'bg-white/5 border border-transparent opacity-50'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-primary' : isCompleted ? 'bg-green-500/20' : 'bg-white/10'
                                    }`}>
                                    {isCompleted ? (
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/50'}`} />
                                    )}
                                </div>
                                <span className={`text-sm font-medium ${isActive ? 'text-white' : isCompleted ? 'text-white/70' : 'text-white/40'
                                    }`}>
                                    {step.text}
                                </span>
                                {isActive && (
                                    <motion.div
                                        className="ml-auto w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Subtle footer text */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-xs text-white/40"
                >
                    This will only take a moment
                </motion.p>
            </div>
        </div>
    );
}
