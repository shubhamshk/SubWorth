'use client';

import { WatchBehavior } from '@/types/onboarding';
import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Clock, Flame, Sofa, Calendar } from 'lucide-react';

const BEHAVIORS: { id: WatchBehavior; label: string; icon: any }[] = [
    { id: 'Binge watch', label: 'Binge Watch (Finisher)', icon: Flame },
    { id: 'Casual weekends', label: 'Casual Weekends', icon: Sofa },
    { id: 'Only trending shows', label: 'Only Trending Hype', icon: Flame },
    { id: 'Watch 1-2 shows/month', label: 'Selective (1-2 shows/mo)', icon: Calendar },
];

export default function StepBehavior() {
    const { profile, setProfile } = useStore();

    return (
        <div className="flex flex-col h-full justify-center">
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">What's your style?</h2>
                <p className="text-foreground-muted">This helps us calculate the "Value Score" for subscriptions.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {BEHAVIORS.map((b, idx) => {
                    const isSelected = profile.behavior === b.id;
                    const Icon = b.icon;

                    return (
                        <motion.button
                            key={b.id}
                            onClick={() => setProfile({ behavior: b.id })}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`
                                flex items-center p-5 rounded-2xl border transition-all text-left gap-6 group
                                ${isSelected
                                    ? 'bg-gradient-to-r from-primary/20 to-transparent border-primary'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                }
                            `}
                        >
                            <div className={`
                                w-12 h-12 rounded-xl flex items-center justify-center transition-all
                                ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/10 text-foreground-muted'}
                            `}>
                                <Icon className="w-6 h-6" />
                            </div>

                            <div className="flex-1">
                                <h3 className={`text-lg font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                    {b.label}
                                </h3>
                            </div>

                            <div className={`
                                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                ${isSelected ? 'border-primary' : 'border-white/20 group-hover:border-white/40'}
                            `}>
                                {isSelected && <motion.div layoutId="dot" className="w-3 h-3 rounded-full bg-primary" />}
                            </div>
                        </motion.button>
                    )
                })}
            </div>
        </div>
    );
}
