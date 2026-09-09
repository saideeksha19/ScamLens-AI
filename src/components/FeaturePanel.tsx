import { Globe2, Brain, Activity } from 'lucide-react';

export function FeaturePanel() {
  return (
    <div 
      id="right-bottom-feature-panel"
      className="liquid-glass-card p-3 sm:p-3.5 w-full shadow-2xl select-none relative overflow-hidden"
    >
      {/* Top row with 2 feature pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-2.5 border-b border-white/10">
        {/* Feature 1: URL Intelligence */}
        <div className="flex items-start gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-zinc-800/80 ring-1 ring-white/10 shrink-0 mt-0.5">
            <Globe2 className="w-3 h-3 text-zinc-300" />
          </div>
          <div>
            <h4 className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-200">
              URL Intelligence
            </h4>
            <p className="text-[10px] sm:text-[10.5px] text-zinc-400 font-light leading-snug mt-0.5">
              Analyze suspicious websites and links.
            </p>
          </div>
        </div>

        {/* Feature 2: AI Threat Analysis */}
        <div className="flex items-start gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-zinc-800/80 ring-1 ring-white/10 shrink-0 mt-0.5">
            <Brain className="w-3 h-3 text-zinc-300" />
          </div>
          <div>
            <h4 className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-200">
              AI Threat Analysis
            </h4>
            <p className="text-[10px] sm:text-[10.5px] text-zinc-400 font-light leading-snug mt-0.5">
              Understand why content looks suspicious.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom row: Real-Time Scam Detection banner */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-zinc-400" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-200">
            Real-Time Scam Detection
          </span>
        </div>

        <div className="text-[9.5px] sm:text-[10px] text-zinc-400 tracking-wide font-light flex items-center gap-1.5">
          <span>Website URLs</span>
          <span className="text-zinc-600">•</span>
          <span>Emails</span>
          <span className="text-zinc-600">•</span>
          <span>Messages</span>
          <span className="text-zinc-600">•</span>
          <span>Screenshots</span>
        </div>
      </div>
    </div>
  );
}
