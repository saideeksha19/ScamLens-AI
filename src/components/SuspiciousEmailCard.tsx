import { motion } from 'motion/react';
import { AlertCircle, Mail, AlertTriangle } from 'lucide-react';

interface SuspiciousEmailCardProps {
  parallaxX?: number;
  parallaxY?: number;
}

export function SuspiciousEmailCard({ parallaxX = 0, parallaxY = 0 }: SuspiciousEmailCardProps) {
  return (
    <motion.div
      id="suspicious-email-card"
      animate={{
        y: [-6, 6, -6],
        rotate: [-1, 1, -1],
      }}
      transition={{
        duration: 6.8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        transform: `translate3d(${parallaxX * 14}px, ${parallaxY * 14}px, 0px)`,
      }}
      className="liquid-glass-card p-3 sm:p-3.5 w-60 sm:w-64 xl:w-72 shadow-2xl select-none transition-transform duration-200"
    >
      {/* Header with Suspicious tag and Incoming Email */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-zinc-800/80 ring-1 ring-white/10">
            <Mail className="w-3 h-3 text-zinc-300" />
          </div>
          <span className="text-[10px] font-medium tracking-wider uppercase text-zinc-400">
            Incoming Email
          </span>
        </div>

        {/* Suspicious tag in monochrome/grayscale */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-800/90 ring-1 ring-white/20 text-zinc-200 text-[9px] font-semibold tracking-wider uppercase">
          <AlertTriangle className="w-2.5 h-2.5 text-zinc-300" />
          <span>Suspicious</span>
        </div>
      </div>

      {/* Content */}
      <div className="mt-2 space-y-1">
        <h4 className="text-[11px] sm:text-xs font-semibold text-zinc-100 tracking-tight leading-snug">
          URGENT: Verify your account immediately
        </h4>
        <p className="text-[10px] sm:text-[10.5px] text-zinc-400 leading-relaxed font-light line-clamp-2">
          Your account will be suspended unless you verify your credentials within 24 hours...
        </p>
      </div>

      {/* Risk Badge Footer */}
      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-medium">
          Threat Vector
        </span>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900/90 ring-1 ring-white/15 text-[10.5px] font-mono font-medium text-zinc-200">
          <AlertCircle className="w-2.5 h-2.5 text-zinc-300" />
          <span>87% Risk</span>
        </div>
      </div>
    </motion.div>
  );
}
