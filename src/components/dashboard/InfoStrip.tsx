'use client';

import { ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function InfoStrip() {
    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="w-full bg-blue-500/10 border-y border-blue-500/20 backdrop-blur-sm"
        >
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-blue-100/90">
                        Your customized feedback page for this month is being prepared. It will be ready within the next few hours.
                    </span>
                </div>

                <Link
                    href="/dashboard/verdict"
                    className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium transition-colors whitespace-nowrap group"
                >
                    View detailed verdict
                    <ExternalLink className="w-3 h-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
            </div>
        </motion.div>
    );
}
