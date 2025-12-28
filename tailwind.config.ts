import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Premium dark palette
                background: {
                    DEFAULT: 'var(--background)',
                    secondary: 'var(--background-secondary)',
                },
                foreground: {
                    DEFAULT: 'var(--foreground)',
                    muted: 'var(--foreground-muted)',
                },
                primary: {
                    DEFAULT: 'var(--primary)',
                    hover: 'var(--primary-hover)',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    glow: 'var(--accent-glow)',
                },
                // Verdict colors
                verdict: {
                    buy: '#22c55e',
                    skip: '#ef4444',
                    continue: '#3b82f6',
                    pause: '#f59e0b',
                },
                // Glass effect
                glass: {
                    DEFAULT: 'rgba(255, 255, 255, 0.05)',
                    border: 'rgba(255, 255, 255, 0.1)',
                    hover: 'rgba(255, 255, 255, 0.08)',
                },
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                display: ['var(--font-display)', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'fade-in-up': 'fadeInUp 0.6s ease-out',
                'slide-in-left': 'slideInLeft 0.6s ease-out',
                'slide-in-right': 'slideInRight 0.6s ease-out',
                'float': 'float 6s ease-in-out infinite',
                'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite',
                'scroll-indicator': 'scrollIndicator 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideInLeft: {
                    '0%': { opacity: '0', transform: 'translateX(-50px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(50px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                pulseSubtle: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' },
                },
                glow: {
                    '0%, 100%': { boxShadow: '0 0 20px var(--accent-glow)' },
                    '50%': { boxShadow: '0 0 40px var(--accent-glow)' },
                },
                scrollIndicator: {
                    '0%, 100%': { transform: 'translateY(0)', opacity: '1' },
                    '50%': { transform: 'translateY(8px)', opacity: '0.5' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'glow-sm': '0 0 15px var(--accent-glow)',
                'glow-md': '0 0 30px var(--accent-glow)',
                'glow-lg': '0 0 50px var(--accent-glow)',
                'card': '0 4px 24px rgba(0, 0, 0, 0.3)',
                'card-hover': '0 8px 40px rgba(0, 0, 0, 0.4)',
            },
        },
    },
    plugins: [],
};

export default config;
