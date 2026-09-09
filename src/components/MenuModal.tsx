/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Shield, 
  Cpu, 
  Lock, 
  CheckCircle, 
  Terminal, 
  Layers, 
  Home, 
  Sparkles, 
  Activity, 
  Clock, 
  ArrowRight 
} from 'lucide-react';
import type { AppView } from './Navbar';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScanner: () => void;
  onNavigate?: (view: AppView) => void;
  currentView?: AppView;
}

export function MenuModal({ 
  isOpen, 
  onClose, 
  onOpenScanner, 
  onNavigate,
  currentView = 'home'
}: MenuModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleNav = (view: AppView) => {
    onClose();
    onNavigate?.(view);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="menu-modal-overlay" 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
        >
          <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

          <motion.div
            id="menu-modal-dialog"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
            className="relative z-10 w-full max-w-2xl liquid-glass-panel p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 ring-1 ring-white/20">
                  <Shield className="w-5 h-5 text-zinc-100" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-wider text-white uppercase">
                    ScamLens AI
                  </h3>
                  <p className="text-xs text-zinc-400 font-light tracking-wide">
                    Think Before You Click • Navigation & Platform
                  </p>
                </div>
              </div>

              <button
                id="close-menu-modal-button"
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors cursor-pointer ring-1 ring-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Destinations */}
            <div className="mt-6 flex flex-col gap-2">
              <span className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-semibold mb-1">
                Application Navigation
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* HOME */}
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className={`flex items-center justify-between p-3.5 rounded-xl text-left transition-all cursor-pointer ring-1 ${
                    currentView === 'home'
                      ? 'bg-white/15 ring-white/30 text-white'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] ring-white/10 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Home className="w-4 h-4 text-zinc-300" />
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider block">
                        Home
                      </span>
                      <span className="text-[11px] text-zinc-400 font-light">
                        Primary landing interface
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {/* SCAN */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenScanner();
                  }}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] ring-1 ring-white/10 text-zinc-300 hover:text-white text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-zinc-300" />
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider block">
                        Scan Target
                      </span>
                      <span className="text-[11px] text-zinc-400 font-light">
                        Multimodal inspection modal
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {/* THREAT INTELLIGENCE */}
                <button
                  type="button"
                  onClick={() => handleNav('threat-intelligence')}
                  className={`flex items-center justify-between p-3.5 rounded-xl text-left transition-all cursor-pointer ring-1 ${
                    currentView === 'threat-intelligence'
                      ? 'bg-white/15 ring-white/30 text-white'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] ring-white/10 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-zinc-300" />
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider block">
                        Threat Intelligence
                      </span>
                      <span className="text-[11px] text-zinc-400 font-light">
                        SOC stats & threat signals
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {/* SCAN HISTORY */}
                <button
                  type="button"
                  onClick={() => handleNav('history')}
                  className={`flex items-center justify-between p-3.5 rounded-xl text-left transition-all cursor-pointer ring-1 ${
                    currentView === 'history'
                      ? 'bg-white/15 ring-white/30 text-white'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] ring-white/10 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-zinc-300" />
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider block">
                        Scan History
                      </span>
                      <span className="text-[11px] text-zinc-400 font-light">
                        Search previous assessments
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                </button>
              </div>
            </div>

            {/* Core Pillars */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900/70 ring-1 ring-white/10">
                <div className="flex items-center gap-2 text-zinc-200 font-medium text-xs uppercase tracking-wider mb-1.5">
                  <Cpu className="w-4 h-4 text-zinc-400" />
                  <span>AI Scam Intelligence</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  Multimodal heuristics trained to identify social engineering, deceptive typosquatting, credential harvesting, and high-urgency smishing patterns.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/70 ring-1 ring-white/10">
                <div className="flex items-center gap-2 text-zinc-200 font-medium text-xs uppercase tracking-wider mb-1.5">
                  <Lock className="w-4 h-4 text-zinc-400" />
                  <span>Privacy-First Architecture</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  Zero retention of personal credentials or sensitive message data. Real-time inference without persistent user data collection.
                </p>
              </div>
            </div>

            {/* Analysis Output Specification */}
            <div className="mt-6 p-4.5 rounded-2xl bg-zinc-900/50 ring-1 ring-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-4 h-4 text-zinc-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                  Target Inspection Telemetry
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-zinc-950/60 ring-1 ring-white/5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Metric 01</span>
                  <span className="text-xs font-medium text-zinc-200">Risk Score</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/60 ring-1 ring-white/5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Metric 02</span>
                  <span className="text-xs font-medium text-zinc-200">Classification</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/60 ring-1 ring-white/5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Metric 03</span>
                  <span className="text-xs font-medium text-zinc-200">Confidence</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/60 ring-1 ring-white/5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Metric 04</span>
                  <span className="text-xs font-medium text-zinc-200">Evidence Log</span>
                </div>
              </div>
            </div>

            {/* Phase Status */}
            <div className="mt-6 p-4 rounded-2xl bg-zinc-950/80 ring-1 ring-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 ring-1 ring-white/10 shrink-0">
                  <Layers className="w-4 h-4 text-zinc-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">Phase 6: Threat Intelligence & History</span>
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 ring-1 ring-white/15">
                      <CheckCircle className="w-2.5 h-2.5" /> Active
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-light mt-0.5">
                    Real persistent scan history, SOC threat telemetry, and report restoration active.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenScanner();
                }}
                className="w-full sm:w-auto px-5 py-2 rounded-full glass-button text-xs font-medium tracking-wider uppercase text-zinc-100 hover:text-white shrink-0 cursor-pointer"
              >
                Open Scanner
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
