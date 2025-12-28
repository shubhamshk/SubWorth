'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
    LogOut,
} from 'lucide-react';

import { getSupabaseClient } from '@/lib/supabase/client';
import { useTheme } from '@/providers/ThemeProvider';

function LogoutButton({ collapsed }: { collapsed: boolean }) {
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <button
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            className={`
                flex items-center gap-3 w-full p-3 rounded-lg 
                text-red-400 hover:text-red-300 hover:bg-red-500/10 
                transition-all duration-200 group
                ${collapsed ? 'justify-center' : ''}
            `}
        >
            <LogOut className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />

            <div className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
            `}>
                <span className="font-medium whitespace-nowrap">Logout</span>
            </div>
        </button>
    );
}

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/platforms', label: 'Platforms', icon: Tv2 },
    { href: '/dashboard/analytics', label: 'Analytics', icon: TrendingUp },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    return (
        <aside
            className={`
                h-full bg-background-secondary border-r border-glass-border
                flex flex-col transition-all duration-300 ease-in-out relative
                ${collapsed ? 'w-[70px]' : 'w-[260px]'}
            `}
        >
            {/* Logo */}
            <div className={`
                h-[72px] flex items-center border-b border-glass-border
                ${collapsed ? 'justify-center px-0' : 'px-6'}
            `}>
                <Link href="/" className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                        <Zap className="w-5 h-5 text-white fill-current" />
                    </div>
                    <div className={`
                        transition-all duration-300 ease-in-out
                        ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
                    `}>
                        <span className="font-bold text-lg whitespace-nowrap">
                            OTT<span className="text-gradient">Manager</span>
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={collapsed ? item.label : undefined}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                                ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-foreground-muted hover:text-foreground hover:bg-white/5'
                                }
                                ${collapsed ? 'justify-center' : ''}
                            `}
                        >
                            <Icon className={`
                                w-5 h-5 flex-shrink-0 transition-colors
                                ${isActive ? 'text-primary' : 'text-foreground-muted group-hover:text-foreground'}
                            `} />

                            <div className={`
                                overflow-hidden transition-all duration-300 ease-in-out
                                ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
                            `}>
                                <span className={`font-medium whitespace-nowrap ${isActive ? 'text-primary' : ''}`}>
                                    {item.label}
                                </span>
                            </div>

                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-glass-border space-y-1">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    title={collapsed ? "Toggle Theme" : undefined}
                    className={`
                        flex items-center gap-3 w-full p-3 rounded-lg
                        text-foreground-muted hover:text-foreground hover:bg-white/5 
                        transition-colors group
                        ${collapsed ? 'justify-center' : ''}
                    `}
                >
                    {theme === 'dark' ? (
                        <Sun className="w-5 h-5 flex-shrink-0" />
                    ) : (
                        <Moon className="w-5 h-5 flex-shrink-0" />
                    )}

                    <div className={`
                        overflow-hidden transition-all duration-300 ease-in-out
                        ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
                    `}>
                        <span className="font-medium whitespace-nowrap">Theme</span>
                    </div>
                </button>

                {/* Collapse Toggle */}
                <button
                    onClick={onToggle}
                    className={`
                        flex items-center gap-3 w-full p-3 rounded-lg
                        text-foreground-muted hover:text-foreground hover:bg-white/5 
                        transition-colors group hidden lg:flex
                        ${collapsed ? 'justify-center' : ''}
                    `}
                >
                    <ChevronLeft className={`
                        w-5 h-5 flex-shrink-0 transition-transform duration-300
                        ${collapsed ? 'rotate-180' : ''}
                    `} />

                    <div className={`
                        overflow-hidden transition-all duration-300 ease-in-out
                        ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
                    `}>
                        <span className="font-medium whitespace-nowrap">Collapse</span>
                    </div>
                </button>

                {/* Logout */}
                <LogoutButton collapsed={collapsed} />
            </div>
        </aside>
    );
}
