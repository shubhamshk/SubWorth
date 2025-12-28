'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen bg-background overflow-hidden">
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
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-glass-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="p-2 rounded-lg hover:bg-glass-hover text-foreground transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-lg">
                        OTT<span className="text-gradient">Manager</span>
                    </span>
                    <div className="w-9" /> {/* Spacer */}
                </div>

                {/* Content Scroller */}
                <div className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
