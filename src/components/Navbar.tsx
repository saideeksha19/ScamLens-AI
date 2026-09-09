/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, Sparkles, Activity, Clock } from 'lucide-react';

export type AppView = 'home' | 'threat-intelligence' | 'history';

interface NavbarProps {
  currentView?: AppView;
  onNavigate?: (view: AppView) => void;
  onOpenScanner?: () => void;
  onOpenMenu: () => void;
}

export function Navbar({ 
  currentView = 'home', 
  onNavigate, 
  onOpenScanner, 
  onOpenMenu 
}: NavbarProps) {
  return (
    <header 
      id="main-navbar" 
      className="w-full flex items-center justify-between py-2 px-1 sm:px-3 shrink-0 gap-2"
    >
      {/* Brand Identity */}
      <button
        id="nav-brand" 
        type="button"
        onClick={() => onNavigate?.('home')}
        className="flex items-center gap-2.5 sm:gap-3 text-left group cursor-pointer focus:outline-none"
      >
        <div 
          id="nav-logo-icon-container"
          className="relative flex items-center justify-center w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-white/[0.06] backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] ring-1 ring-white/10 group-hover:ring-white/25 transition-all"
        >
          <Shield className="w-4.5 h-4.5 text-zinc-100" strokeWidth={1.75} />
          <div className="absolute inset-0 rounded-xl bg-white/5 opacity-50 blur-[1px]" />
        </div>

        <div id="nav-brand-text" className="flex flex-col">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs sm:text-sm font-semibold tracking-[0.16em] uppercase text-white group-hover:text-zinc-100 transition-colors">
              ScamLens AI
            </span>
          </div>
          <span className="text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.24em] text-zinc-400 font-medium">
            Think Before You Click
          </span>
        </div>
      </button>

      {/* Nav Actions: Desktop Nav Pills + Menu Button */}
      <div id="nav-actions" className="flex items-center gap-1.5 sm:gap-2">
        {/* Navigation Items (HOME, SCAN, THREAT INTELLIGENCE, HISTORY) */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center p-1 rounded-full bg-white/[0.03] ring-1 ring-white/10">
          <button
            id="nav-link-home"
            type="button"
            onClick={() => onNavigate?.('home')}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wider uppercase transition-all cursor-pointer ${
              currentView === 'home'
                ? 'bg-white/20 text-white font-semibold shadow-[0_0_12px_rgba(255,255,255,0.1)] ring-1 ring-white/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            HOME
          </button>

          <button
            id="nav-link-scan"
            type="button"
            onClick={() => onOpenScanner?.()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wider uppercase text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-zinc-400" />
            <span>SCAN</span>
          </button>

          <button
            id="nav-link-intelligence"
            type="button"
            onClick={() => onNavigate?.('threat-intelligence')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wider uppercase transition-all cursor-pointer ${
              currentView === 'threat-intelligence'
                ? 'bg-white/20 text-white font-semibold shadow-[0_0_12px_rgba(255,255,255,0.1)] ring-1 ring-white/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3 h-3 text-zinc-400" />
            <span>THREAT INTELLIGENCE</span>
          </button>

          <button
            id="nav-link-history"
            type="button"
            onClick={() => onNavigate?.('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wider uppercase transition-all cursor-pointer ${
              currentView === 'history'
                ? 'bg-white/20 text-white font-semibold shadow-[0_0_12px_rgba(255,255,255,0.1)] ring-1 ring-white/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>HISTORY</span>
          </button>
        </nav>

        {/* Menu Action Pill (Always available) */}
        <button
          id="nav-menu-button"
          type="button"
          onClick={onOpenMenu}
          className="glass-pill group relative flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase text-zinc-200 hover:text-white transition-all duration-300 ring-1 ring-white/10 hover:ring-white/20 active:scale-95 cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 group-hover:bg-white transition-colors duration-200" />
          <span>Menu</span>
        </button>
      </div>
    </header>
  );
}
