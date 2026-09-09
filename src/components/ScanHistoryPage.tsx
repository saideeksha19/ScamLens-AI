/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Globe, 
  Mail, 
  Image as ImageIcon, 
  Shield, 
  Trash2, 
  ArrowLeft,
  X,
  Tag,
  Clock
} from 'lucide-react';
import type { ScanHistoryRecord, ScamAnalysisResult, ScamClassification } from '../types';

interface ScanHistoryPageProps {
  records: ScanHistoryRecord[];
  onOpenScanner: () => void;
  onOpenDashboard: () => void;
  onViewReport: (result: ScamAnalysisResult) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

type ClassificationFilter = 'ALL' | ScamClassification;
type ScanTypeFilter = 'ALL' | 'WEBSITE' | 'MESSAGE' | 'SCREENSHOT';

export function ScanHistoryPage({
  records,
  onOpenScanner,
  onOpenDashboard,
  onViewReport,
  onDeleteRecord,
  onClearAll,
}: ScanHistoryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<ClassificationFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<ScanTypeFilter>('ALL');
  const [confirmClear, setConfirmClear] = useState(false);

  // Filter and search logic
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Classification filter
      if (classFilter !== 'ALL' && rec.classification !== classFilter) {
        return false;
      }

      // Scan type filter
      if (typeFilter !== 'ALL') {
        if (typeFilter === 'WEBSITE' && rec.scanType !== 'url') return false;
        if (typeFilter === 'MESSAGE' && rec.scanType !== 'message') return false;
        if (typeFilter === 'SCREENSHOT' && rec.scanType !== 'screenshot') return false;
      }

      // Search query across URL, message summary, screenshot filename, detected indicator
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesSummary = rec.targetSummary?.toLowerCase().includes(query);
        const matchesFilename = rec.filename?.toLowerCase().includes(query);
        const matchesDomain = rec.domain?.toLowerCase().includes(query);
        const matchesPreview = rec.messagePreview?.toLowerCase().includes(query);
        const matchesIndicators = rec.indicators?.some((ind) => ind.toLowerCase().includes(query));
        const matchesRecommendation = rec.recommendation?.toLowerCase().includes(query);

        if (!matchesSummary && !matchesFilename && !matchesDomain && !matchesPreview && !matchesIndicators && !matchesRecommendation) {
          return false;
        }
      }

      return true;
    });
  }, [records, classFilter, typeFilter, searchQuery]);

  const getScanTypeIcon = (type: string) => {
    switch (type) {
      case 'url':
        return <Globe className="w-3.5 h-3.5" />;
      case 'message':
        return <Mail className="w-3.5 h-3.5" />;
      case 'screenshot':
        return <ImageIcon className="w-3.5 h-3.5" />;
      default:
        return <Shield className="w-3.5 h-3.5" />;
    }
  };

  const getScanTypeLabel = (type: string) => {
    switch (type) {
      case 'url':
        return 'Website URL';
      case 'message':
        return 'Email / Message';
      case 'screenshot':
        return 'Screenshot';
      default:
        return type;
    }
  };

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'SCAM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-white/10 text-white ring-1 ring-white/30">
            <ShieldAlert className="w-3 h-3 text-white" />
            <span>SCAM</span>
          </span>
        );
      case 'SUSPICIOUS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-white/5 text-zinc-300 ring-1 ring-white/20">
            <AlertTriangle className="w-3 h-3 text-zinc-300" />
            <span>SUSPICIOUS</span>
          </span>
        );
      case 'SAFE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-white/[0.04] text-zinc-400 ring-1 ring-white/10">
            <ShieldCheck className="w-3 h-3 text-zinc-400" />
            <span>SAFE</span>
          </span>
        );
    }
  };

  return (
    <div id="scan-history-page" className="w-full max-w-7xl mx-auto flex flex-col gap-5 py-2 px-1 sm:px-2">
      {/* 1. SCAN HISTORY HEADER */}
      {/* [ ← BACK TO THREAT INTELLIGENCE ]        SCAN HISTORY */}
      <div 
        id="scan-history-nav-header" 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-white/10"
      >
        {/* Back Button: liquid-glass pill with ArrowLeft icon, subtle scale 1.03 on hover */}
        <button
          id="back-to-threat-intelligence-btn"
          type="button"
          onClick={onOpenDashboard}
          className="glass-pill group inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase text-zinc-200 hover:text-white transition-all duration-200 hover:scale-[1.03] active:scale-95 ring-1 ring-white/10 hover:ring-white/25 cursor-pointer bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)] w-fit shrink-0 focus:outline-none focus:ring-1 focus:ring-white/30"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-zinc-300 group-hover:text-white transition-colors" strokeWidth={2} />
          <span>BACK TO THREAT INTELLIGENCE</span>
        </button>

        {/* Right side: Page Title + Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white uppercase font-sans">
            SCAN HISTORY
          </h1>

          <div className="flex items-center gap-2">
            <button
              id="history-new-scan-btn"
              type="button"
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-button text-xs font-medium tracking-wider uppercase text-zinc-100 hover:text-white transition-all cursor-pointer ring-1 ring-white/15 hover:ring-white/25"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>New Scan</span>
            </button>

            {records.length > 0 && (
              confirmClear ? (
                <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl ring-1 ring-white/15">
                  <span className="text-[11px] text-zinc-400 pl-1.5">Clear all?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClearAll();
                      setConfirmClear(false);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10.5px] font-medium uppercase cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 text-[10.5px] uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer ring-1 ring-white/10"
                  title="Clear all stored scan history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* 2. BREADCRUMB */}
      {/* THREAT INTELLIGENCE  /  SCAN HISTORY */}
      <nav id="scan-history-breadcrumb" aria-label="Breadcrumb" className="flex items-center gap-2 text-xs py-0.5">
        <button
          id="breadcrumb-threat-intelligence-btn"
          type="button"
          onClick={onOpenDashboard}
          className="text-zinc-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer font-medium hover:underline focus:outline-none"
        >
          THREAT INTELLIGENCE
        </button>
        <span className="text-zinc-600 font-mono select-none" aria-hidden="true">/</span>
        <span className="text-zinc-200 uppercase tracking-wider font-semibold" aria-current="page">
          SCAN HISTORY
        </span>
      </nav>

      {/* Empty State when no scans exist */}
      {records.length === 0 ? (
        <div id="scan-history-empty-container" className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <Clock className="w-8 h-8 text-zinc-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white uppercase mb-2">
            NO SCANS YET
          </h2>
          <p className="text-sm text-zinc-400 font-light max-w-md mb-8 leading-relaxed">
            Your threat intelligence history will appear here after your first analysis.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenScanner}
              className="px-6 py-3 rounded-xl glass-button text-xs font-medium tracking-wider uppercase text-zinc-100 hover:text-white transition-all cursor-pointer ring-1 ring-white/20 hover:ring-white/30"
            >
              SCAN YOUR FIRST TARGET
            </button>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium tracking-wider uppercase text-zinc-300 hover:text-white transition-all cursor-pointer ring-1 ring-white/10"
            >
              Go to Threat Intelligence
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 5. HISTORY PAGE STRUCTURE: Search & Filters Toolbar */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 backdrop-blur-xl ring-1 ring-white/10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                id="scan-history-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scans..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-white/[0.04] text-xs text-white placeholder:text-zinc-500 focus:outline-none ring-1 ring-white/10 focus:ring-white/25 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Groups */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Classification Filters: [ ALL ] [ SCAM ] [ SUSPICIOUS ] [ SAFE ] */}
              <div className="flex items-center p-1 rounded-xl bg-white/[0.03] ring-1 ring-white/10">
                {(['ALL', 'SCAM', 'SUSPICIOUS', 'SAFE'] as const).map((cf) => (
                  <button
                    key={cf}
                    type="button"
                    onClick={() => setClassFilter(cf)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium tracking-wider uppercase transition-all cursor-pointer ${
                      classFilter === cf
                        ? 'bg-white/15 text-white font-semibold shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {cf}
                  </button>
                ))}
              </div>

              {/* Scan Type Filters: [ ALL ] [ WEBSITE ] [ MESSAGE ] [ SCREENSHOT ] */}
              <div className="flex items-center p-1 rounded-xl bg-white/[0.03] ring-1 ring-white/10">
                {(['ALL', 'WEBSITE', 'MESSAGE', 'SCREENSHOT'] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTypeFilter(tf)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium tracking-wider uppercase transition-all cursor-pointer ${
                      typeFilter === tf
                        ? 'bg-white/15 text-white font-semibold shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Metrics Counter */}
          <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
            <span>
              Showing <span className="font-mono text-zinc-300 font-medium">{filteredRecords.length}</span> of{' '}
              <span className="font-mono text-zinc-300 font-medium">{records.length}</span> recorded scans
            </span>
            {(classFilter !== 'ALL' || typeFilter !== 'ALL' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setClassFilter('ALL');
                  setTypeFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-zinc-400 hover:text-white underline cursor-pointer text-[11px]"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Records List */}
          {filteredRecords.length === 0 ? (
            <div className="p-12 rounded-2xl bg-zinc-950/40 backdrop-blur-xl ring-1 ring-white/10 text-center flex flex-col items-center justify-center">
              <Search className="w-8 h-8 text-zinc-600 mb-3" />
              <p className="text-sm text-zinc-300 font-medium uppercase tracking-wider">
                No matching scans found
              </p>
              <p className="text-xs text-zinc-500 font-light mt-1 max-w-sm mb-4">
                Try adjusting your search keywords or switching filters to view previous scan records.
              </p>
              <button
                type="button"
                onClick={() => {
                  setClassFilter('ALL');
                  setTypeFilter('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium uppercase tracking-wider text-zinc-300 hover:text-white ring-1 ring-white/10 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-4 sm:p-5 rounded-2xl bg-zinc-950/70 backdrop-blur-xl ring-1 ring-white/10 hover:ring-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  {/* Left Column: Classification, Target info, Indicators */}
                  <div className="flex-1 flex flex-col gap-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {getClassificationBadge(record.classification)}

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.03] text-zinc-400 ring-1 ring-white/5">
                        {getScanTypeIcon(record.scanType)}
                        <span>{getScanTypeLabel(record.scanType)}</span>
                      </span>

                      <span className="text-[11px] text-zinc-500 font-mono">
                        {record.formattedDate}
                      </span>
                    </div>

                    {/* Target Description */}
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-wide truncate max-w-2xl">
                        {record.targetSummary}
                      </h3>
                      {record.summary && (
                        <p className="text-xs text-zinc-400 font-light line-clamp-2 mt-1 leading-relaxed">
                          {record.summary}
                        </p>
                      )}
                    </div>

                    {/* Detected Indicators Pill Tags */}
                    {record.indicators && record.indicators.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                          <Tag className="w-3 h-3 text-zinc-500" />
                          {record.indicators.length} {record.indicators.length === 1 ? 'Indicator' : 'Indicators'}:
                        </span>
                        {record.indicators.slice(0, 4).map((indicator, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[10.5px] font-medium text-zinc-300 ring-1 ring-white/10"
                          >
                            {indicator}
                          </span>
                        ))}
                        {record.indicators.length > 4 && (
                          <span className="text-[10px] text-zinc-500">
                            +{record.indicators.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Risk Metric, Confidence, Action */}
                  <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                    {/* Risk Score */}
                    <div className="flex flex-col items-start md:items-end">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        Risk Score
                      </span>
                      <div className="flex items-baseline gap-1 font-mono">
                        <span className="text-lg font-semibold text-white">
                          {record.riskScore}
                        </span>
                        <span className="text-[10px] text-zinc-500">/ 100</span>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="flex flex-col items-start md:items-end">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        Confidence
                      </span>
                      <span className="text-sm font-semibold font-mono text-zinc-300">
                        {record.confidence}%
                      </span>
                    </div>

                    {/* Reopen Report Button */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onViewReport(record.result)}
                        className="px-4 py-2 rounded-xl glass-button text-xs font-semibold tracking-wider uppercase text-zinc-100 hover:text-white transition-all cursor-pointer ring-1 ring-white/20 hover:ring-white/30 active:scale-95"
                      >
                        VIEW REPORT
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteRecord(record.id)}
                        className="p-2 rounded-lg bg-white/[0.02] hover:bg-white/10 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                        title="Delete this scan record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
