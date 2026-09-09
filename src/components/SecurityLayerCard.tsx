import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

interface SecurityLayerCardProps {
  parallaxX?: number;
  parallaxY?: number;
}

export function SecurityLayerCard({ parallaxX = 0, parallaxY = 0 }: SecurityLayerCardProps) {
  return (
    <motion.div
      id="security-layer-card"
      animate={{
        y: [5, -5, 5],
      }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        transform: `translate3d(${parallaxX * 10}px, ${parallaxY * 10}px, 0px)`,
      }}
      className="liquid-glass-card px-4 py-3 sm:py-3.5 max-w-xs shadow-xl select-none transition-transform duration-200"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-zinc-800/80 ring-1 ring-white/15 shrink-0">
          <ShieldCheck className="w-4 h-4 text-zinc-200" />
        </div>
        <div>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400 block">
            Your AI Security Layer
          </span>
          <p className="text-[11.5px] text-zinc-200 font-normal leading-tight mt-0.5">
            Analyze suspicious digital content before you trust it.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
