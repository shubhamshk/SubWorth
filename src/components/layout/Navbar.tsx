'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Zap } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

const navLinks = [
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#platforms', label: 'Platforms' },
    { href: '/pricing', label: 'Pricing' },
];

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { handleProtectedClick } = useAuthRedirect();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when clicking a link
    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${isScrolled
                        ? 'py-2 sm:py-3 bg-background/80 backdrop-blur-xl border-b border-glass-border'
                        : 'py-3 sm:py-5 bg-transparent'
                    }
        `}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-primary flex items-center justify-center group-hover:shadow-glow-sm transition-shadow">
                                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <span className="font-bold text-lg sm:text-xl hidden xs:block">
                                Sub<span className="text-gradient">Worth</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-foreground-muted hover:text-foreground transition-colors text-sm font-medium"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Theme toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg bg-glass hover:bg-glass-hover transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                                ) : (
                                    <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                            </button>

                            {/* CTA */}
                            <div className="hidden sm:block">
                                <Button size="sm" onClick={() => handleProtectedClick('/dashboard')}>Get Started</Button>
                            </div>

                            {/* Mobile menu toggle */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-lg bg-glass hover:bg-glass-hover transition-colors md:hidden"
                                aria-label="Toggle menu"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Menu className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-x-0 top-[56px] sm:top-[72px] z-40 p-4 md:hidden"
                    >
                        <div className="glass-card p-4 sm:p-6 space-y-3 sm:space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={handleLinkClick}
                                    className="block text-foreground-muted hover:text-foreground transition-colors font-medium py-2"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-3 sm:pt-4 border-t border-glass-border">
                                <Button
                                    className="w-full"
                                    onClick={() => {
                                        handleLinkClick();
                                        handleProtectedClick('/dashboard');
                                    }}
                                >
                                    Get Started
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
