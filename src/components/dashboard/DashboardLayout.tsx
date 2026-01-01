'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { useStore } from '@/lib/store';

interface DashboardLayoutProps {
    children: React.ReactNode;
    header?: React.ReactNode;
}

export default function DashboardLayout({ children, header }: DashboardLayoutProps) {
    const [collapsed, setCollapsed] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { profile } = useStore();

    // Capitalize first letter
    const planName = profile.plan ? (profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) + ' Plan') : 'Pro Plan';

    return (
        <div className="flex h-screen bg-[#0a0a0a] overflow-hidden selection:bg-primary/20 selection:text-primary relative">
            {/* Background Gradients/Mesh */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-primary/10 blur-[100px]" />
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar Wrapper */}
            <div className={`
                fixed inset-y-0 left-0 z-50 lg:relative lg:z-0
                transform transition-transform duration-300 ease-in-out
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <Sidebar
                    collapsed={collapsed}
                    onToggle={() => setCollapsed(!collapsed)}
                />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header (Desktop + Mobile) */}
                <div className="flex items-center justify-between p-4 lg:p-6 sticky top-0 z-30 pointer-events-none">
                    {/* Mobile Menu Button - Visible only on mobile */}
                    <div className="pointer-events-auto lg:hidden mr-4">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="p-2 rounded-lg hover:bg-glass-hover text-foreground transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Dynamic Header Content (Greeting etc) */}
                    <div className="flex-1 min-w-0 mr-4">
                        {header ? (
                            header
                        ) : (
                            <span className="lg:hidden font-bold text-lg">
                                OTT<span className="text-gradient">Manager</span>
                            </span>
                        )}
                    </div>

                    {/* Pro Badge - Top Right */}
                    <div className="ml-auto pointer-events-auto shrink-0">
                        <div className="relative group cursor-default">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative flex items-center px-4 py-1.5 bg-black rounded-lg border border-white/10 leading-none">
                                <span className="text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text uppercase tracking-widest">
                                    {planName}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Scroller */}
                <div className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
