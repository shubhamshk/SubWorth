'use client';

import { Language } from '@/types/onboarding';
import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Globe, Languages } from 'lucide-react';

const LANGUAGES: { id: Language; label: string; sub: string }[] = [
    { id: 'English', label: 'English', sub: 'Hollywood & UK' },
    { id: 'Hindi', label: 'Hindi', sub: 'Bollywood & Web Series' },
    { id: 'Korean', label: 'Korean', sub: 'K-Dramas & Movies' },
    { id: 'Japanese', label: 'Japanese', sub: 'Anime & Live Action' },
    { id: 'Regional', label: 'Regional', sub: 'Tamil, Telugu, Malayalam etc.' },
    { id: 'International', label: 'International', sub: 'Spanish, French, etc.' },
];

export default function StepLanguages() {
    const { profile, setProfile } = useStore();

    const toggleLanguage = (lang: Language) => {
        const current = profile.languages;
        const next = current.includes(lang)
            ? current.filter((l) => l !== lang)
            : [...current, lang];
        setProfile({ languages: next });
    };

    return (
        <div className="flex flex-col h-full justify-center">
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Preferred Languages</h2>
                <p className="text-foreground-muted">We'll prioritize content in these languages.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {LANGUAGES.map((lang, idx) => {
                    const isSelected = profile.languages.includes(lang.id);

                    return (
                        <motion.button
                            key={lang.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => toggleLanguage(lang.id)}
                            className={`
                                flex items-center p-4 rounded-xl border transition-all text-left gap-4
                                ${isSelected
                                    ? 'bg-primary/20 border-primary'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }
                            `}
                        >
                            <div className={`
                                w-10 h-10 rounded-lg flex items-center justify-center
                                ${isSelected ? 'bg-primary text-white' : 'bg-white/10 text-foreground-muted'}
                            `}>
                                <Languages className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                    {lang.label}
                                </h3>
                                <p className="text-xs text-foreground-muted">{lang.sub}</p>
                            </div>

                            <div className="ml-auto">
                                <div className={`
                                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                                    ${isSelected ? 'border-primary bg-primary' : 'border-white/20'}
                                `}>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
