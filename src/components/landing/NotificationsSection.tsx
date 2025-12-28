'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Bell, X, Check, Clock } from 'lucide-react';

const notifications = [
    {
        id: 1,
        type: 'skip',
        platform: 'Disney+',
        message: 'Not worth renewing this month',
        detail: 'Only 2 relevant releases for you',
        icon: X,
        color: 'text-verdict-skip',
        bgColor: 'bg-verdict-skip/10',
        borderColor: 'border-verdict-skip/30',
        direction: 'left',
    },
    {
        id: 2,
        type: 'buy',
        platform: 'HBO Max',
        message: 'Worth subscribing!',
        detail: 'House of Dragon + 5 new releases',
        icon: Check,
        color: 'text-verdict-buy',
        bgColor: 'bg-verdict-buy/10',
        borderColor: 'border-verdict-buy/30',
        direction: 'right',
    },
    {
        id: 3,
        type: 'reminder',
        platform: 'Prime Video',
        message: 'Subscription renews in 3 days',
        detail: 'Worth continuing based on your interests',
        icon: Clock,
        color: 'text-verdict-continue',
        bgColor: 'bg-verdict-continue/10',
        borderColor: 'border-verdict-continue/30',
        direction: 'left',
    },
];

export default function NotificationsSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    return (
        <section ref={sectionRef} className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-accent/5 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10 sm:mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass border border-glass-border mb-4 sm:mb-6">
                        <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                        <span className="text-xs sm:text-sm text-foreground-muted">Smart Notifications</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                        Never Miss a <span className="text-gradient">Good Deal</span>
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-foreground-muted max-w-2xl mx-auto px-4">
                        Get notified before your subscription renews. We'll tell you if it's worth it.
                    </p>
                </motion.div>

                {/* Notification cards */}
                <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
                    {notifications.map((notif, index) => {
                        const Icon = notif.icon;
                        return (
                            <motion.div
                                key={notif.id}
                                initial={{
                                    opacity: 0,
                                    x: notif.direction === 'left' ? -50 : 50
                                }}
                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                transition={{
                                    duration: 0.6,
                                    delay: 0.2 + index * 0.15,
                                    type: 'spring',
                                    stiffness: 100
                                }}
                                className={`
                  glass-card p-4 sm:p-5 flex items-start gap-3 sm:gap-4 
                  border ${notif.borderColor}
                  hover:shadow-card-hover transition-shadow
                `}
                            >
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${notif.bgColor} flex items-center justify-center flex-shrink-0`}>
                                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${notif.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                                        <span className="text-sm sm:text-base font-semibold">{notif.platform}</span>
                                        <span className="text-[10px] sm:text-xs text-foreground-muted">• Just now</span>
                                    </div>
                                    <p className={`text-sm sm:text-base font-medium ${notif.color}`}>{notif.message}</p>
                                    <p className="text-xs sm:text-sm text-foreground-muted mt-0.5 sm:mt-1">{notif.detail}</p>
                                </div>
                                <button className="text-foreground-muted hover:text-foreground transition-colors p-1">
                                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Features */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="mt-10 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto"
                >
                    {[
                        { label: 'Email Reminders', desc: '3 days before' },
                        { label: 'Push Alerts', desc: 'Real-time' },
                        { label: 'Monthly Summary', desc: 'Savings report' },
                    ].map((feature, i) => (
                        <div key={i} className="text-center">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary mx-auto mb-2 sm:mb-3" />
                            <h4 className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">{feature.label}</h4>
                            <p className="text-[10px] sm:text-xs text-foreground-muted">{feature.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
