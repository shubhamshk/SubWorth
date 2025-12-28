import { Navbar, Footer } from '@/components/layout';
import {
    HeroSection,
    HowItWorksSection,
    PlatformPreviewSection,
    ValueSection,
    PersonalizationSection,
    NotificationsSection,
    CTASection,
} from '@/components/landing';

export default function HomePage() {
    return (
        <>
            <Navbar />
            <main>
                <HeroSection />
                <div className="section-divider" />
                <section id="how-it-works">
                    <HowItWorksSection />
                </section>
                <div className="section-divider" />
                <section id="platforms">
                    <PlatformPreviewSection />
                </section>
                <div className="section-divider" />
                <ValueSection />
                <div className="section-divider" />
                <PersonalizationSection />
                <div className="section-divider" />
                <NotificationsSection />
                <div className="section-divider" />
                <CTASection />
            </main>
            <Footer />
        </>
    );
}
