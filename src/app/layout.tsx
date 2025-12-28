import type { Metadata } from 'next';
import { ThemeProvider } from '@/providers/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
    title: 'SubWorth | Stop Paying for What You Don\'t Watch',
    description: 'Smart subscription recommendations based on this month\'s releases. Save money by only paying for subscriptions worth your time.',
    keywords: ['OTT', 'subscription', 'Netflix', 'Prime Video', 'streaming', 'save money', 'SubWorth'],
    authors: [{ name: 'SubWorth' }],
    openGraph: {
        title: 'SubWorth',
        description: 'Stop paying for subscriptions you don\'t watch. Get smart subscription recommendations.',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body className="antialiased">
                <ThemeProvider>
                    <div className="gradient-mesh" />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
