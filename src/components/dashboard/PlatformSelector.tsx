'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search, X, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getWatchProviders, WatchProvider } from '@/app/actions/tmdb';
import Image from 'next/image';

interface PlatformSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    isInitialSetup?: boolean;
}

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

export default function PlatformSelector({ isOpen, onClose, isInitialSetup = false }: PlatformSelectorProps) {
    const {
        preferences,
        setSubscribedPlatforms,
        trackedProviders,
        setTrackedProviders
    } = useStore() as any; // Need to update store type

    const [providers, setProviders] = useState<WatchProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<WatchProvider[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getWatchProviders('US');
                setProviders(data);

                // Initialize selected from store
                // We need to map store IDs to provider objects if possible, 
                // but for now we might start clean or try to match.
                // Simplified: Start clean or persist provider IDs in store.
            } catch (e) {
                console.error("Failed to load providers", e);
            } finally {
                setLoading(false);
            }
        };
        if (isOpen) load();
    }, [isOpen]);

    const toggleProvider = (provider: WatchProvider) => {
        const isSelected = selected.find(p => p.provider_id === provider.provider_id);
        if (isSelected) {
            setSelected(prev => prev.filter(p => p.provider_id !== provider.provider_id));
        } else {
            if (selected.length >= 5) return; // Limit 5
            setSelected(prev => [...prev, provider]);
        }
    };

    const handleSave = () => {
        setTrackedProviders(selected);
        onClose();
    };

    const filtered = providers.filter(p => p.provider_name.toLowerCase().includes(search.toLowerCase()));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0f0f12] border border-white/10 w-full max-w-3xl max-h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-white/5">
                    <h2 className="text-2xl font-bold mb-1">
                        {isInitialSetup ? "Let's set up your dashboard" : "Manage Platforms"}
                    </h2>
                    <p className="text-foreground-muted">
                        Select up to 5 platforms you want us to track for you.
                    </p>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-white/5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search Netflix, Prime, Disney+..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {filtered.map(provider => {
                                const isSelected = selected.some(s => s.provider_id === provider.provider_id);
                                return (
                                    <button
                                        key={provider.provider_id}
                                        onClick={() => toggleProvider(provider)}
                                        className={`
                                            flex items-center gap-3 p-3 rounded-xl border transition-all text-left group
                                            ${isSelected
                                                ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]'
                                                : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10'}
                                        `}
                                    >
                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                                            {provider.logo_path && (
                                                <Image
                                                    src={`${IMAGE_BASE_URL}${provider.logo_path}`}
                                                    alt={provider.provider_name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium text-sm truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                                {provider.provider_name}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-white/5 flex items-center justify-between">
                    <div className="text-sm text-foreground-muted">
                        Selected: <span className="text-white font-bold">{selected.length}</span>/5
                    </div>
                    <div className="flex gap-3">
                        {!isInitialSetup && (
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl hover:bg-white/10 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={selected.length === 0}
                            className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                        >
                            {isInitialSetup ? 'Start Dashboard' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
