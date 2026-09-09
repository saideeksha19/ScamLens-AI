import { motion } from 'motion/react';
import { Scan, ArrowRight } from 'lucide-react';

interface ScanCTAProps {
  onClick?: () => void;
}

export function ScanCTA({ onClick }: ScanCTAProps) {
  return (
    <motion.button
      id="scan-cta-button"
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.975 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 rounded-full glass-button cursor-pointer overflow-hidden transition-all duration-300"
    >
      {/* Specular highlight glint */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      
      <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-white group-hover:bg-white/20 transition-colors">
        <Scan className="w-3.5 h-3.5" strokeWidth={2.2} />
      </div>

      <span className="text-sm sm:text-[15px] font-medium tracking-[0.14em] uppercase text-zinc-100 group-hover:text-white whitespace-nowrap">
        Scan For Scams
      </span>

      <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
    </motion.button>
  );
}
