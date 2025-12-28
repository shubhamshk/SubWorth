'use client';

import Link from 'next/link';
import { Zap, Twitter, Github, Mail } from 'lucide-react';

const footerLinks = {
    product: [
        { label: 'Features', href: '#' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'API', href: '#' },
    ],
    company: [
        { label: 'About', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Contact', href: '#' },
    ],
    legal: [
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
        { label: 'Cookies', href: '#' },
    ],
};

const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Mail, href: '#', label: 'Email' },
];

export default function Footer() {
    return (
        <footer className="border-t border-glass-border bg-background-secondary/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-12 md:py-16">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand */}
                    <div className="col-span-2 sm:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-primary flex items-center justify-center">
                                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <span className="font-bold text-lg sm:text-xl">
                                OTT<span className="text-gradient">Manager</span>
                            </span>
                        </Link>
                        <p className="text-xs sm:text-sm text-foreground-muted mb-4 max-w-xs">
                            Smart subscription recommendations based on what's releasing this month.
                        </p>
                        {/* Social links */}
                        <div className="flex gap-2 sm:gap-3">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-glass hover:bg-glass-hover flex items-center justify-center transition-colors"
                                        aria-label={social.label}
                                    >
                                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Product links */}
                    <div>
                        <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
                        <ul className="space-y-2 sm:space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-xs sm:text-sm text-foreground-muted hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company links */}
                    <div>
                        <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
                        <ul className="space-y-2 sm:space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-xs sm:text-sm text-foreground-muted hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal links */}
                    <div>
                        <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
                        <ul className="space-y-2 sm:space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-xs sm:text-sm text-foreground-muted hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-glass-border flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    <p className="text-xs sm:text-sm text-foreground-muted text-center sm:text-left">
                        © {new Date().getFullYear()} OTT Manager. All rights reserved.
                    </p>
                    <p className="text-xs sm:text-sm text-foreground-muted">
                        Made with ❤️ for smart streamers
                    </p>
                </div>
            </div>
        </footer>
    );
}
