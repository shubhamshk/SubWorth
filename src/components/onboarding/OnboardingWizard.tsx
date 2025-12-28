'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
    StepContentType,
    StepGenres,
    StepLanguages,
    StepFavorites,
    StepBehavior
} from './';
import { useRouter } from 'next/navigation';

const STEPS = [
    { id: 'content', title: 'Content Preference' },
    { id: 'genres', title: 'Your Taste' },
    { id: 'languages', title: 'Languages' },
    { id: 'favorites', title: 'Favorite Shows' },
    { id: 'behavior', title: 'Watch Habits' },
];

export default function OnboardingWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { profile, updateConfidence } = useStore();

    const handleNext = async () => {
        updateConfidence(); // Recalculate confidence on every step

        if (currentStep < STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            // FINISH
            setIsSubmitting(true);
            try {
                const supabase = getSupabaseClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    await (supabase
                        .from('user_profiles') as any)
                        .update({
                            taste_profile: profile,
                            onboarding_completed: true
                        })
                        .eq('id', user.id);
                }

                // Simulate calculation delay for "AI Feel"
                await new Promise(resolve => setTimeout(resolve, 1500));

                router.push('/dashboard');
            } catch (error) {
                console.error('Failed to save profile', error);
                setIsSubmitting(false);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    return (
        <div className="min-h-screen bg-black text-foreground flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-background z-0" />
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />

            <div className="w-full max-w-4xl z-10 relative">
                {/* Progress Header */}
                <div className="mb-8 flex items-center justify-between px-2">
                    <div className="flex gap-2">
                        {STEPS.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx <= currentStep ? 'w-8 bg-primary' : 'w-2 bg-white/10'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                        Step {currentStep + 1}/{STEPS.length}
                    </span>
                </div>

                {/* Main Card */}
                <div className="bg-glass-panel border border-white/10 rounded-3xl p-6 md:p-12 min-h-[500px] flex flex-col backdrop-blur-xl shadow-2xl relative overflow-hidden">

                    {/* Step Content */}
                    <div className="flex-1 flex flex-col">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex-1 flex flex-col"
                            >
                                {currentStep === 0 && <StepContentType />}
                                {currentStep === 1 && <StepGenres />}
                                {currentStep === 2 && <StepLanguages />}
                                {currentStep === 3 && <StepFavorites />}
                                {currentStep === 4 && <StepBehavior />}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Bar */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0 || isSubmitting}
                            className={`
                                flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-colors
                                ${currentStep === 0
                                    ? 'opacity-0 pointer-events-none'
                                    : 'text-foreground-muted hover:text-white hover:bg-white/5'
                                }
                            `}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Calculating Verdicts...
                                </span>
                            ) : (
                                <>
                                    {currentStep === STEPS.length - 1 ? 'Finish' : 'Next'}
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
