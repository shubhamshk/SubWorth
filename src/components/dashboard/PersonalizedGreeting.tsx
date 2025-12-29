'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { TasteProfile } from '@/types/onboarding';
import { generatePersonalityHook, getPersonalizedGreeting } from '@/lib/personalityHooks';

interface PersonalizedGreetingProps {
    profile: TasteProfile;
}

export default function PersonalizedGreeting({ profile }: PersonalizedGreetingProps) {
    const greeting = getPersonalizedGreeting(profile.userName);
    const personalityHook = generatePersonalityHook(profile);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 space-y-4"
        >
            {/* Greeting */}
            <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                    {greeting}
                </h1>

                {/* Personality Hook Line */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl"
                >
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                    <p className={`
                        font-medium
                        ${personalityHook.tone === 'bold' ? 'text-red-400' : ''}
                        ${personalityHook.tone === 'warm' ? 'text-pink-400' : ''}
                        ${personalityHook.tone === 'intelligent' ? 'text-purple-400' : ''}
                        ${personalityHook.tone === 'playful' ? 'text-yellow-400' : ''}
                        ${personalityHook.tone === 'passionate' ? 'text-violet-400' : ''}
                        ${personalityHook.tone === 'curious' ? 'text-cyan-400' : ''}
                    `}>
                        {personalityHook.line}
                    </p>
                </motion.div>
            </div>

            {/* Subtle divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </motion.div>
    );
}
