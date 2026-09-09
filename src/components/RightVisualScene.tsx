import { SuspiciousEmailCard } from './SuspiciousEmailCard';
import { FakeWebsiteCard } from './FakeWebsiteCard';
import { SmsScamCard } from './SmsScamCard';
import { FloatingShield } from './FloatingShield';
import { SecurityLayerCard } from './SecurityLayerCard';
import { FeaturePanel } from './FeaturePanel';
import { FloatingParticles } from './FloatingParticles';

interface RightVisualSceneProps {
  parallaxX: number;
  parallaxY: number;
}

export function RightVisualScene({ parallaxX, parallaxY }: RightVisualSceneProps) {
  return (
    <aside 
      id="right-visual-scene"
      aria-label="Interactive cybersecurity visualization"
      className="hidden lg:flex lg:w-[48%] h-full flex-col justify-between relative p-2 select-none overflow-hidden"
    >
      {/* 3D Floating Particles in background */}
      <FloatingParticles parallaxX={parallaxX} parallaxY={parallaxY} />

      {/* Top Floating Zone: Security Layer (left) & Suspicious Email (right) */}
      <div className="relative z-10 w-full flex items-start justify-between gap-3 shrink-0 pt-1">
        <div className="transform -translate-y-1">
          <SecurityLayerCard parallaxX={parallaxX} parallaxY={parallaxY} />
        </div>
        <div className="transform translate-x-1 -translate-y-1">
          <SuspiciousEmailCard parallaxX={parallaxX} parallaxY={parallaxY} />
        </div>
      </div>

      {/* Middle 3D Anchor Zone: Central Shield with Fake Website (left) & SMS Scam (right) */}
      <div className="relative z-20 my-auto w-full flex items-center justify-between py-1 sm:py-2">
        {/* Left side card */}
        <div className="transform -translate-y-2">
          <FakeWebsiteCard parallaxX={parallaxX} parallaxY={parallaxY} />
        </div>

        {/* Central Visual Anchor Shield */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <FloatingShield parallaxX={parallaxX} parallaxY={parallaxY} />
        </div>

        {/* Right side card */}
        <div className="transform translate-y-2">
          <SmsScamCard parallaxX={parallaxX} parallaxY={parallaxY} />
        </div>
      </div>

      {/* Bottom Zone: Feature Panel */}
      <div className="relative z-10 w-full shrink-0 pb-1">
        <FeaturePanel />
      </div>
    </aside>
  );
}
