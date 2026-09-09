import { ScanCTA } from './ScanCTA';
import { AnalysisPills } from './AnalysisPills';
import type { AnalysisCategory } from '../types';

interface HeroProps {
  onScanClick: () => void;
  onSelectCategory: (cat: AnalysisCategory) => void;
  activeCategory: AnalysisCategory | null;
}

export function Hero({ onScanClick, onSelectCategory, activeCategory }: HeroProps) {
  return (
    <section 
      id="hero-content-section" 
      className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 my-auto w-full max-w-xl mx-auto py-4 sm:py-6"
    >
      {/* Main Heading */}
      <h1 
        id="hero-main-heading"
        className="font-sans font-medium text-white text-center leading-[0.92] tracking-[-0.05em]"
        style={{ fontSize: 'clamp(56px, 5.5vw, 88px)' }}
      >
        Think Before You<br />
        <span className="font-serif italic font-normal text-zinc-100 inline-block mt-1">
          Click.
        </span>
      </h1>

      {/* Description Paragraphs */}
      <div 
        id="hero-descriptions"
        className="mt-5 sm:mt-6 space-y-1.5 text-center max-w-md mx-auto"
      >
        <p className="text-sm sm:text-[15px] leading-relaxed text-zinc-300/90 font-normal">
          Analyze suspicious websites, emails, messages and screenshots with AI-powered scam detection.
        </p>
        <p className="text-xs sm:text-sm leading-relaxed text-zinc-400 font-light">
          Understand the risk. See the evidence. Stay protected.
        </p>
      </div>

      {/* Primary CTA and Analysis Options */}
      <div id="hero-actions" className="mt-6 sm:mt-8 flex flex-col items-center w-full">
        <ScanCTA onClick={onScanClick} />
        <AnalysisPills 
          onSelectCategory={onSelectCategory}
          activeCategory={activeCategory}
        />
      </div>
    </section>
  );
}
