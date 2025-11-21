'use client';

import dynamic from 'next/dynamic';
import SmoothScroll from '@/components/SmoothScroll';

// Lazy load sections for better performance
const HeroSection = dynamic(() => import('@/components/sections/HeroSection'), {
  loading: () => <div className="min-h-screen bg-black" />,
});

const ProblemTwistSection = dynamic(() => import('@/components/sections/ProblemTwistSection'), {
  loading: () => <div className="min-h-screen bg-black" />,
});

const FeatureGrid = dynamic(() => import('@/components/sections/FeatureGrid'), {
  loading: () => <div className="min-h-screen bg-black" />,
});

const TerminalDemo = dynamic(() => import('@/components/sections/TerminalDemo'), {
  loading: () => <div className="min-h-screen bg-black" />,
});

const HowItWorks = dynamic(() => import('@/components/sections/HowItWorks'), {
  loading: () => <div className="min-h-screen bg-black" />,
});

const InstallationSection = dynamic(() => import('@/components/sections/InstallationSection'), {
  loading: () => <div className="min-h-screen bg-black" />,
});

const DiffShowcase = dynamic(() => import('@/components/sections/DiffShowcase'), {
  loading: () => <div className="min-h-screen bg-black" />,
});

const FinalCTA = dynamic(() => import('@/components/sections/FinalCTA'), {
  loading: () => <div className="min-h-screen bg-black" />,
});

export default function Home() {
  return (
    <SmoothScroll>
      <main className="bg-black text-white">
        <HeroSection />
        <ProblemTwistSection />
        <FeatureGrid />
        <TerminalDemo />
        <HowItWorks />
        <InstallationSection />
        <DiffShowcase />
        <FinalCTA />
      </main>
    </SmoothScroll>
  );
}