import { useState } from 'react';

export function BackgroundVideo() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  return (
    <div 
      id="background-video-container" 
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none"
      aria-hidden="true"
    >
      {/* Fallback & Ambient Dark Mesh Background */}
      <div 
        id="background-ambient-mesh"
        className="absolute inset-0 bg-[#070709]"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-zinc-800/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-zinc-900/20 blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-black/40 blur-[120px]" />
      </div>

      {/* Video element */}
      {!videoError && (
        <video
          id="hero-background-video"
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-45' : 'opacity-0'
          }`}
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4"
            type="video/mp4"
          />
        </video>
      )}

      {/* Dark Translucent & Vignette Overlays */}
      <div 
        id="bg-translucent-overlay" 
        className="absolute inset-0 bg-gradient-to-b from-[#070709]/80 via-[#070709]/65 to-[#070709]/95" 
      />
      <div 
        id="bg-radial-vignette" 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,7,9,0.75)_100%)]" 
      />
      {/* Subtle scanline texture for cinematic cybersecurity feel */}
      <div 
        id="bg-scanline-grid" 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" 
      />
    </div>
  );
}
