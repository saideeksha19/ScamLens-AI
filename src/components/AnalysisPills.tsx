import { Globe, Mail, Image as ImageIcon } from 'lucide-react';
import type { AnalysisCategory } from '../types';

interface AnalysisPillsProps {
  onSelectCategory?: (category: AnalysisCategory) => void;
  activeCategory?: AnalysisCategory | null;
}

export function AnalysisPills({ onSelectCategory, activeCategory }: AnalysisPillsProps) {
  const pills: { id: AnalysisCategory; label: string; icon: typeof Globe }[] = [
    { id: 'url', label: 'Website URL', icon: Globe },
    { id: 'email', label: 'Email / Message', icon: Mail },
    { id: 'screenshot', label: 'Screenshot', icon: ImageIcon },
  ];

  return (
    <div 
      id="analysis-pills-container" 
      className="flex flex-wrap items-center justify-center gap-2.5 mt-5 sm:mt-6 w-full max-w-md mx-auto"
    >
      {pills.map(({ id, label, icon: Icon }) => {
        const isActive = activeCategory === id;
        return (
          <button
            key={id}
            id={`pill-${id}`}
            type="button"
            onClick={() => onSelectCategory?.(id)}
            className={`glass-pill group relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-normal tracking-wide transition-all duration-300 cursor-pointer ${
              isActive 
                ? 'bg-white/15 text-white ring-1 ring-white/30 shadow-[0_0_12px_rgba(255,255,255,0.12)]' 
                : 'text-zinc-300 hover:text-white hover:bg-white/10 ring-1 ring-white/5 hover:ring-white/15'
            }`}
          >
            <Icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
            <span className="whitespace-nowrap">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
