'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
    StepIdentity,
    StepContentType,
    StepGenres,
    StepLanguages,
    StepFavorites,
    StepBehavior,
    StepOTTPlatforms,
    AIAnalysisLoader
} from './';
import { useRouter } from 'next/navigation';
import { syncSelectedPlatforms } from '@/app/actions/platforms'; // Import server action

const STEPS = [
    { id: 'identity', title: 'Welcome' },
    { id: 'content', title: 'Content Preference' },
    { id: 'genres', title: 'Your Taste' },
    { id: 'languages', title: 'Languages' },
    { id: 'platforms', title: 'Calculated For' },
    { id: 'favorites', title: 'Favorite Shows' },
    { id: 'behavior', title: 'Watch Habits' },
];

const LOADER_STEP_DURATION = 900; // ms per step
const TOTAL_LOADER_STEPS = 4;

export default function OnboardingWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [loaderStep, setLoaderStep] = useState(0);
    const router = useRouter();
    const { profile, updateConfidence } = useStore();

    // Handle loader animation steps
    useEffect(() => {
        if (!showLoader) return;

        // Increment steps every LOADER_STEP_DURATION
        if (loaderStep < TOTAL_LOADER_STEPS - 1) {
            const timer = setTimeout(() => {
                setLoaderStep((prev) => prev + 1);
            }, LOADER_STEP_DURATION);
            return () => clearTimeout(timer);
        }
    }, [showLoader, loaderStep]);

    // Handle final redirect after all steps complete
    useEffect(() => {
        if (!showLoader) return;
        if (loaderStep < TOTAL_LOADER_STEPS - 1) return;

        // Last step reached - redirect after one more duration
        const timer = setTimeout(() => {
            console.log('🎯 Redirecting to dashboard after onboarding completion');
            // Use window.location with query param to signal completion
            window.location.href = '/dashboard?completed=true';
        }, LOADER_STEP_DURATION);

        return () => clearTimeout(timer);
    }, [showLoader, loaderStep]);

    const handleNext = async () => {
        updateConfidence(); // Recalculate confidence on every step

        if (currentStep < STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            // FINISH - Submit data and show loader
            setIsSubmitting(true);
            console.log('📝 Starting onboarding submission...');

            try {
                const supabase = getSupabaseClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    console.log('👤 User ID:', user.id);

                    // 1. Sync Platforms (Resolve TMDB IDs to DB UUIDs)
                    let finalPlatformIds = profile.selectedPlatforms || [];

                    try {
                        if (finalPlatformIds.length > 0) {
                            console.log('🔄 Syncing platforms to database...');
                            const syncRes = await syncSelectedPlatforms(finalPlatformIds);
                            if (syncRes.success && syncRes.data) {
                                finalPlatformIds = syncRes.data;
                                console.log('✅ Platforms synced. Resolved UUIDs:', finalPlatformIds.length);
                            }
                        }
                    } catch (e) {
                        console.error('⚠️ Sync failed, proceeding with original IDs:', e);
                    }

                    console.log('📊 Profile data:', {
                        fullName: profile.fullName,
                        age: profile.age,
                        contentTypes: profile.contentTypes,
                        genres: profile.genres,
                        platforms: finalPlatformIds
                    });

                    // Save taste profile (with Updated UUIDs for platforms)
                    const updatedProfile = { ...profile, selectedPlatforms: finalPlatformIds };

                    const { error } = await (supabase
                        .from('user_profiles') as any)
                        .upsert({
                            id: user.id,
                            full_name: profile.fullName,
                            age: profile.age,
                            taste_profile: updatedProfile,
                            onboarding_completed: true,
                            updated_at: new Date().toISOString()
                        }, {
                            onConflict: 'id'
                        });

                    if (error) {
                        console.error('❌ Supabase upsert error:', error);
                    } else {
                        console.log('✅ Profile saved successfully!');

                        // Sync to Relational Table: user_tracked_platforms
                        const { error: deleteError } = await supabase
                            .from('user_tracked_platforms')
                            .delete()
                            .eq('user_id', user.id);

                        if (!deleteError && finalPlatformIds.length > 0) {
                            const platformRows = finalPlatformIds.map(key => ({
                                user_id: user.id,
                                platform_key: key
                            }));

                            const { error: insertError } = await (supabase
                                .from('user_tracked_platforms') as any)
                                .insert(platformRows);

                            if (insertError) console.error('❌ Failed to sync tracked platforms:', insertError);
                            else console.log('✅ Tracked platforms synced to relational DB');
                        }
                    }

                    // Increased delay to ensure database write completes
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error('❌ Failed to save profile:', error);
            } finally {
                setIsSubmitting(false);
            }

            // Always show the AI analysis loader (even if save failed)
            // The middleware will handle proper routing
            setShowLoader(true);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    // Show loader full-screen when submitting is complete
    if (showLoader) {
        return <AIAnalysisLoader currentStep={loaderStep} />;
    }

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
                                {currentStep === 0 && <StepIdentity />}
                                {currentStep === 1 && <StepContentType />}
                                {currentStep === 2 && <StepGenres />}
                                {currentStep === 3 && <StepLanguages />}
                                {currentStep === 4 && <StepOTTPlatforms />}
                                {currentStep === 5 && <StepFavorites />}
                                {currentStep === 6 && <StepBehavior />}
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
                                    Saving...
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

