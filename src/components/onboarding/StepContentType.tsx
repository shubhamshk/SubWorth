'use client';

import { ContentType } from '@/types/onboarding';
import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Film, Tv, Clapperboard, Video, User } from 'lucide-react';

const OPTIONS: { id: ContentType; label: string; icon: any }[] = [
    { id: 'Movies', label: 'Movies', icon: Film },
    { id: 'Web Series', label: 'Web Series', icon: Tv },
    { id: 'Anime', label: 'Anime', icon: Clapperboard },
    { id: 'Documentaries', label: 'Documentaries', icon: Video },
    { id: 'Reality Shows', label: 'Reality Shows', icon: User },
];

export default function StepContentType() {
    const { profile, setProfile } = useStore();

    const toggleOption = (id: ContentType) => {
        const current = profile.contentTypes;
        const next = current.includes(id)
            ? current.filter((item) => item !== id)
            : [...current, id];
        setProfile({ contentTypes: next });
    };

    return (
        <div className="flex flex-col h-full justify-center">
            <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">What do you mostly watch?</h2>
                <p className="text-foreground-muted">Select all that apply. This helps us filter noise.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {OPTIONS.map((option) => {
                    const isSelected = profile.contentTypes.includes(option.id);
                    const Icon = option.icon;

                    return (
                        <motion.button
                            key={option.id}
                            onClick={() => toggleOption(option.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                                relative p-6 rounded-2xl border transition-all duration-200 text-left flex flex-col gap-4 group
                                ${isSelected
                                    ? 'bg-primary/20 border-primary text-primary'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                }
                            `}
                        >
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center transition-colors
                                ${isSelected ? 'bg-primary text-white' : 'bg-white/10'}
                            `}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-lg">{option.label}</span>

                            {isSelected && (
                                <motion.div
                                    layoutId="outline"
                                    className="absolute inset-0 border-2 border-primary rounded-2xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    )
                })}
            </div>
        </div>
    );
}
