import { motion } from 'motion/react';
import { Shield, Lock, Sparkles } from 'lucide-react';

interface FloatingShieldProps {
  parallaxX?: number;
  parallaxY?: number;
}

export function FloatingShield({ parallaxX = 0, parallaxY = 0 }: FloatingShieldProps) {
  return (
    <motion.div
      id="floating-central-shield-anchor"
      animate={{
        y: [-10, 10, -10],
        rotate: [-1.8, 1.8, -1.8],
      }}
      transition={{
        duration: 9.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        transform: `translate3d(${parallaxX * 8}px, ${parallaxY * 8}px, 0px)`,
      }}
      className="relative flex items-center justify-center select-none pointer-events-none"
    >
      {/* Outer ambient glow halo */}
      <div 
        className="absolute w-56 h-56 rounded-full bg-white/[0.04] blur-3xl" 
        aria-hidden="true" 
      />

      {/* Orbiting / Concentric subtle glass rings */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-dashed border-white/10"
      />
      <div className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full border border-white/15" />

      {/* Main 3D Liquid Glass Shield Container */}
      <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-zinc-900/60 backdrop-blur-2xl ring-1 ring-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.5)]">
        {/* Subtle glass reflection angled slice */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute -inset-[50%] bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-45" />
        </div>

        {/* Shield graphic with central Lock */}
        <div className="relative flex items-center justify-center">
          <Shield 
            className="w-16 h-16 sm:w-18 sm:h-18 text-zinc-200 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]" 
            strokeWidth={1.4} 
          />
          <div className="absolute flex items-center justify-center">
            <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]" strokeWidth={1.8} />
          </div>
        </div>

        {/* Floating Sparkles around shield */}
        <motion.div 
          animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-2.5 -right-2.5 flex items-center justify-center w-7 h-7 rounded-full bg-zinc-900/80 backdrop-blur-md ring-1 ring-white/25 shadow-lg"
        >
          <Sparkles className="w-3.5 h-3.5 text-zinc-100" />
        </motion.div>

        <motion.div 
          animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.6, 0.95, 0.6] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-2 -left-2 flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900/80 backdrop-blur-md ring-1 ring-white/25 shadow-lg"
        >
          <Sparkles className="w-3 h-3 text-zinc-200" />
        </motion.div>
      </div>
    </motion.div>
  );
}
