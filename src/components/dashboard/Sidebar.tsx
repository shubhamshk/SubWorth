'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Tv2,
    Settings,
    TrendingUp,
    Bell,
    Zap,
    ChevronLeft,
    Sun,
    Moon,
} from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { useStore } from '@/store/useStore';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/platforms', label: 'Platforms', icon: Tv2 },
    { href: '/dashboard/analytics', label: 'Analytics', icon: TrendingUp },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const preferences = useStore((state) => state.preferences);

    // Calculate estimated monthly savings (mock value)
    const monthlySavings = 899;

    return (
        <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`
        fixed left-0 top-0 h-full bg-background-secondary border-r border-glass-border
        flex flex-col z-40 transition-all duration-300
        ${collapsed ? 'w-20' : 'w-64'}
      `}
        >
            {/* Logo */}
            <div className="p-6 border-b border-glass-border">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="font-bold text-lg">
                            OTT<span className="text-gradient">Manager</span>
                        </span>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                    : 'text-foreground-muted hover:text-foreground hover:bg-glass'
                                }
              `}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span className="font-medium">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Savings Card */}
            {!collapsed && (
                <div className="p-4">
                    <div className="p-4 rounded-xl bg-verdict-buy/10 border border-verdict-buy/20">
                        <p className="text-sm text-foreground-muted mb-1">Monthly Savings</p>
                        <p className="text-2xl font-bold text-verdict-buy">
                            <AnimatedCounter target={monthlySavings} prefix="₹" />
                        </p>
                        <p className="text-xs text-foreground-muted mt-1">
                            {preferences.interests.length} interests tracked
                        </p>
                    </div>
                </div>
            )}

            {/* Bottom actions */}
            <div className="p-4 border-t border-glass-border space-y-2">
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-foreground-muted hover:text-foreground hover:bg-glass transition-colors"
                >
                    {theme === 'dark' ? (
                        <Sun className="w-5 h-5" />
                    ) : (
                        <Moon className="w-5 h-5" />
                    )}
                    {!collapsed && <span className="font-medium">Toggle Theme</span>}
                </button>

                {/* Collapse toggle */}
                {onToggle && (
                    <button
                        onClick={onToggle}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-foreground-muted hover:text-foreground hover:bg-glass transition-colors"
                    >
                        <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                        {!collapsed && <span className="font-medium">Collapse</span>}
                    </button>
                )}
            </div>
        </motion.aside>
    );
}
