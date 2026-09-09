import type { ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
}

export function GlassPanel({ children }: GlassPanelProps) {
  return (
    <div 
      id="left-liquid-glass-panel" 
      className="liquid-glass-panel w-full lg:w-[52%] h-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 z-10 select-none overflow-hidden transition-all duration-300"
    >
      {/* Subtle liquid glass ambient light reflection in corner */}
      <div 
        className="absolute top-0 left-1/4 w-3/5 h-24 bg-gradient-to-b from-white/[0.07] to-transparent rounded-full blur-2xl pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute bottom-0 right-1/4 w-1/2 h-20 bg-gradient-to-t from-white/[0.03] to-transparent rounded-full blur-xl pointer-events-none" 
        aria-hidden="true" 
      />

      {children}
    </div>
  );
}
