/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, type MouseEvent } from 'react';
import { BackgroundVideo } from './components/BackgroundVideo';
import { GlassPanel } from './components/GlassPanel';
import { Navbar, type AppView } from './components/Navbar';
import { Hero } from './components/Hero';
import { BottomQuote } from './components/BottomQuote';
import { RightVisualScene } from './components/RightVisualScene';
import { ScanModal } from './components/ScanModal';
import { MenuModal } from './components/MenuModal';
import { ThreatDashboard } from './components/ThreatDashboard';
import { ScanHistoryPage } from './components/ScanHistoryPage';
import { useScanHistory } from './hooks/useScanHistory';
import type { AnalysisCategory, ScamAnalysisResult } from './types';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<AnalysisCategory | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [viewingReportResult, setViewingReportResult] = useState<ScamAnalysisResult | null>(null);

  // Real scan history & stats service hook
  const { records, stats, removeRecord, clearAll } = useScanHistory();
  
  // Parallax coordinates (-1 to 1)
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });

  // Handle smooth mouse parallax
  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Normalize coordinates around center: -1 to 1
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    setMouseParallax({ x, y });
  }, []);

  const handleOpenScannerWithCategory = (category: AnalysisCategory) => {
    setViewingReportResult(null);
    setActiveCategory(category);
    setIsScanModalOpen(true);
  };

  const handleOpenGeneralScanner = () => {
    setViewingReportResult(null);
    setActiveCategory('url');
    setIsScanModalOpen(true);
  };

  const handleViewReport = (result: ScamAnalysisResult) => {
    setViewingReportResult(result);
    setIsScanModalOpen(true);
  };

  const handleCloseScanModal = () => {
    setIsScanModalOpen(false);
    // Clear viewing report after modal exit animation
    setTimeout(() => {
      setViewingReportResult(null);
    }, 300);
  };

  return (
    <main 
      id="scamlens-app-root"
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-[700px] h-[100svh] overflow-y-auto lg:overflow-hidden bg-[#070709] text-white flex items-center justify-center p-3 sm:p-5 lg:p-6"
    >
      {/* Full-screen Background Video with Fallback and Vignette */}
      <BackgroundVideo />

      {/* VIEW 1: HOME (Landing Page Composition: Left 52%, Right 48%) */}
      {currentView === 'home' && (
        <div 
          id="hero-composition-container"
          className="relative z-10 w-full max-w-[1720px] h-full flex flex-col lg:flex-row items-stretch justify-between gap-5 sm:gap-6 lg:gap-7"
        >
          {/* LEFT LIQUID GLASS PANEL (~52%) */}
          <GlassPanel>
            {/* Row 1: Navigation (never overlaps hero) */}
            <Navbar 
              currentView={currentView}
              onNavigate={setCurrentView}
              onOpenScanner={handleOpenGeneralScanner}
              onOpenMenu={() => setIsMenuModalOpen(true)} 
            />

            {/* Row 2: Hero (centered vertically and horizontally) */}
            <Hero 
              onScanClick={handleOpenGeneralScanner}
              onSelectCategory={handleOpenScannerWithCategory}
              activeCategory={activeCategory}
            />

            {/* Row 3: Bottom Quote (never overlaps hero) */}
            <BottomQuote />
          </GlassPanel>

          {/* RIGHT SIDE VISUAL SCENE (~48%) */}
          <RightVisualScene 
            parallaxX={mouseParallax.x} 
            parallaxY={mouseParallax.y} 
          />
        </div>
      )}

      {/* VIEW 2: THREAT INTELLIGENCE DASHBOARD */}
      {currentView === 'threat-intelligence' && (
        <div 
          id="threat-intelligence-container"
          className="relative z-10 w-full max-w-[1720px] h-full liquid-glass-panel flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto"
        >
          {/* Top Navbar */}
          <Navbar 
            currentView={currentView}
            onNavigate={setCurrentView}
            onOpenScanner={handleOpenGeneralScanner}
            onOpenMenu={() => setIsMenuModalOpen(true)} 
          />

          {/* Main Dashboard Content */}
          <div className="flex-1 mt-4 sm:mt-6">
            <ThreatDashboard 
              records={records}
              stats={stats}
              onOpenScanner={handleOpenGeneralScanner}
              onOpenHistory={() => setCurrentView('history')}
              onViewReport={handleViewReport}
            />
          </div>
        </div>
      )}

      {/* VIEW 3: SCAN HISTORY PAGE */}
      {currentView === 'history' && (
        <div 
          id="scan-history-container"
          className="relative z-10 w-full max-w-[1720px] h-full liquid-glass-panel flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto"
        >
          {/* Top Navbar */}
          <Navbar 
            currentView={currentView}
            onNavigate={setCurrentView}
            onOpenScanner={handleOpenGeneralScanner}
            onOpenMenu={() => setIsMenuModalOpen(true)} 
          />

          {/* Main History Content */}
          <div className="flex-1 mt-4 sm:mt-6">
            <ScanHistoryPage 
              records={records}
              onOpenScanner={handleOpenGeneralScanner}
              onOpenDashboard={() => setCurrentView('threat-intelligence')}
              onViewReport={handleViewReport}
              onDeleteRecord={removeRecord}
              onClearAll={clearAll}
            />
          </div>
        </div>
      )}

      {/* Target Scanner Modal (Handles both new scans and reopening saved reports without re-running API) */}
      <ScanModal 
        isOpen={isScanModalOpen}
        onClose={handleCloseScanModal}
        initialCategory={activeCategory}
        viewResult={viewingReportResult}
      />

      {/* Menu / Architecture / Navigation Modal */}
      <MenuModal 
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        onOpenScanner={handleOpenGeneralScanner}
        onNavigate={setCurrentView}
        currentView={currentView}
      />
    </main>
  );
}
