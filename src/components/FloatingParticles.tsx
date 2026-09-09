import { motion } from 'motion/react';

interface FloatingParticlesProps {
  parallaxX?: number;
  parallaxY?: number;
}

export function FloatingParticles({ parallaxX = 0, parallaxY = 0 }: FloatingParticlesProps) {
  const particles = [
    { id: 1, top: '12%', left: '15%', size: 5, duration: 6, delay: 0 },
    { id: 2, top: '22%', right: '20%', size: 7, duration: 8, delay: 1.2 },
    { id: 3, top: '48%', left: '8%', size: 4, duration: 7, delay: 2.5 },
    { id: 4, top: '65%', right: '12%', size: 6, duration: 9, delay: 0.8 },
    { id: 5, top: '80%', left: '30%', size: 5, duration: 7.5, delay: 1.7 },
  ];

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          animate={{
            y: [-12, 12, -12],
            x: [-6, 6, -6],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            width: `${p.size}px`,
            height: `${p.size}px`,
            transform: `translate3d(${parallaxX * 22}px, ${parallaxY * 22}px, 0px)`,
          }}
          className="absolute rounded-full bg-white/40 backdrop-blur-sm shadow-[0_0_8px_rgba(255,255,255,0.6)]"
        />
      ))}
    </div>
  );
}
