import { motion } from 'motion/react';
import { MessageSquareWarning, Zap } from 'lucide-react';

interface SmsScamCardProps {
  parallaxX?: number;
  parallaxY?: number;
}

export function SmsScamCard({ parallaxX = 0, parallaxY = 0 }: SmsScamCardProps) {
  return (
    <motion.div
      id="sms-scam-card"
      animate={{
        y: [-8, 8, -8],
        rotate: [-1.4, 1.4, -1.4],
      }}
      transition={{
        duration: 7.4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        transform: `translate3d(${parallaxX * 18}px, ${parallaxY * 18}px, 0px)`,
      }}
      className="liquid-glass-card p-3 sm:p-3.5 w-56 sm:w-60 xl:w-66 shadow-2xl select-none transition-transform duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <MessageSquareWarning className="w-3 h-3 text-zinc-300" />
          <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-200">
            SMS Scam
          </span>
        </div>
        <span className="text-[8.5px] uppercase tracking-wider text-zinc-500 font-mono">
          Smishing Link
        </span>
      </div>

      {/* Message Balloon */}
      <div className="mt-2 p-2 rounded-xl bg-zinc-900/90 ring-1 ring-white/10">
        <p className="text-[10.5px] text-zinc-200 leading-snug">
          &ldquo;Your account will be blocked. Click here to verify your identity immediately.&rdquo;
        </p>
        <span className="block mt-1 text-[9px] font-mono text-zinc-400 underline underline-offset-2 truncate">
          https://tiny.cc/secure-auth-id
        </span>
      </div>

      {/* Threat Pattern indicator */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[9.5px] text-zinc-400 font-medium">
          <Zap className="w-2.5 h-2.5 text-zinc-400" />
          <span>Urgency + threat pattern</span>
        </div>
        <span className="px-1.5 py-0.5 rounded-full bg-zinc-800 text-[8.5px] font-semibold uppercase tracking-wider text-zinc-300 ring-1 ring-white/10">
          Flagged
        </span>
      </div>
    </motion.div>
  );
}
