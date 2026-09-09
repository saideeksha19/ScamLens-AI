import { motion } from 'motion/react';
import { Globe, Lock, ShieldAlert } from 'lucide-react';

interface FakeWebsiteCardProps {
  parallaxX?: number;
  parallaxY?: number;
}

export function FakeWebsiteCard({ parallaxX = 0, parallaxY = 0 }: FakeWebsiteCardProps) {
  return (
    <motion.div
      id="fake-website-card"
      animate={{
        y: [7, -7, 7],
        rotate: [1.2, -1.2, 1.2],
      }}
      transition={{
        duration: 8.2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        transform: `translate3d(${parallaxX * -12}px, ${parallaxY * -12}px, 0px)`,
      }}
      className="liquid-glass-card p-3 sm:p-3.5 w-56 sm:w-60 xl:w-66 shadow-2xl select-none transition-transform duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3 h-3 text-zinc-400" />
          <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-300">
            Fake Website
          </span>
        </div>
        <span className="text-[9px] font-mono text-zinc-500 truncate max-w-[110px]">
          secure-bank-login.com
        </span>
      </div>

      {/* Mini Mock Fake Login Form */}
      <div className="mt-2 space-y-1.5">
        <div className="space-y-0.5">
          <div className="text-[9px] text-zinc-400 font-medium flex items-center justify-between">
            <span>Username</span>
            <span className="text-[8.5px] text-zinc-500">Phishing Input</span>
          </div>
          <div className="h-5.5 w-full rounded-md bg-zinc-900/80 ring-1 ring-white/10 px-2 flex items-center text-[9.5px] text-zinc-500">
            user@example.com
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="text-[9px] text-zinc-400 font-medium flex items-center justify-between">
            <span>Password</span>
            <Lock className="w-2 h-2 text-zinc-500" />
          </div>
          <div className="h-5.5 w-full rounded-md bg-zinc-900/80 ring-1 ring-white/10 px-2 flex items-center text-[10px] text-zinc-500 font-mono">
            ••••••••••••
          </div>
        </div>

        {/* Fake Verify Button */}
        <div className="pt-0.5">
          <div className="w-full py-1 rounded-md bg-zinc-800/80 ring-1 ring-white/20 text-center text-[10px] font-medium text-zinc-200">
            Verify Identity
          </div>
        </div>
      </div>

      {/* Flag Alert */}
      <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center gap-1.5 text-zinc-300">
        <ShieldAlert className="w-3 h-3 text-zinc-400 shrink-0" />
        <span className="text-[9.5px] font-medium tracking-tight text-zinc-300">
          Brand impersonation detected
        </span>
      </div>
    </motion.div>
  );
}
