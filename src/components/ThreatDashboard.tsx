/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, ArrowUpRight, Globe, Mail, Image as ImageIcon, BarChart3, Activity, Clock, Terminal } from 'lucide-react';
import type { ScanHistoryRecord, ThreatStats, ScamAnalysisResult } from '../types';

interface ThreatDashboardProps {
  records: ScanHistoryRecord[];
  stats: ThreatStats;
  onOpenScanner: () => void;
  onOpenHistory: () => void;
  onViewReport: (result: ScamAnalysisResult) => void;
}

export function ThreatDashboard({
  records,
  stats,
  onOpenScanner,
  onOpenHistory,
  onViewReport,
}: ThreatDashboardProps) {
  const recentRecords = records.slice(0, 5);
  const hasScans = stats.totalScans > 0;

  const getScanTypeIcon = (type: string) => {
    switch (type) {
      case 'url':
        return <Globe className="w-3.5 h-3.5" />;
      case 'message':
        return <Mail className="w-3.5 h-3.5" />;
      case 'screenshot':
        return <ImageIcon className="w-3.5 h-3.5" />;
      default:
        return <Terminal className="w-3.5 h-3.5" />;
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
    <div id="threat-intelligence-dashboard" className="w-full max-w-7xl mx-auto flex flex-col gap-6 py-2 px-1 sm:px-2">
      {/* Page Header */}
      <div id="dashboard-header" className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/10 ring-1 ring-white/15">
              <Activity className="w-3.5 h-3.5 text-zinc-200" />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] font-medium text-zinc-400">
              Cybersecurity Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white uppercase font-sans">
            THREAT INTELLIGENCE
          </h1>
          <p className="text-sm text-zinc-400 font-light mt-1 max-w-2xl leading-relaxed">
            Understand your recent scam exposure and the signals detected by ScamLens AI.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="dashboard-new-scan-btn"
            type="button"
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-button text-xs font-medium tracking-wider uppercase text-zinc-100 hover:text-white transition-all cursor-pointer ring-1 ring-white/15 hover:ring-white/25"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Run New Scan</span>
          </button>
          <button
            id="dashboard-view-all-history-btn"
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium tracking-wider uppercase text-zinc-300 hover:text-white transition-all cursor-pointer ring-1 ring-white/10"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>All History</span>
          </button>
        </div>
      </div>

      {/* TOP STATISTICS GRID (4 major + 1 smaller) */}
      <div id="dashboard-top-stats" className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* TOTAL SCANS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/70 backdrop-blur-xl ring-1 ring-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs uppercase tracking-wider mb-2">
            <span>TOTAL SCANS</span>
            <Activity className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              {stats.totalScans}
            </span>
            <span className="text-xs text-zinc-500 font-mono">records</span>
          </div>
          <div className="mt-3 text-[11px] text-zinc-400 font-light border-t border-white/5 pt-2">
            Real scans inspected
          </div>
        </div>

        {/* SCAMS DETECTED */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/70 backdrop-blur-xl ring-1 ring-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs uppercase tracking-wider mb-2">
            <span>SCAMS DETECTED</span>
            <ShieldAlert className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              {stats.scamsDetected}
            </span>
            {hasScans && (
              <span className="text-xs text-zinc-400 font-mono">
                {stats.riskDistribution.scamPercentage}%
              </span>
            )}
          </div>
          <div className="mt-3 text-[11px] text-zinc-400 font-light border-t border-white/5 pt-2">
            Confirmed scam threats
          </div>
        </div>

        {/* SUSPICIOUS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/70 backdrop-blur-xl ring-1 ring-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs uppercase tracking-wider mb-2">
            <span>SUSPICIOUS</span>
            <AlertTriangle className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-200">
              {stats.suspiciousDetected}
            </span>
            {hasScans && (
              <span className="text-xs text-zinc-400 font-mono">
                {stats.riskDistribution.suspiciousPercentage}%
              </span>
            )}
          </div>
          <div className="mt-3 text-[11px] text-zinc-400 font-light border-t border-white/5 pt-2">
            Elevated risk targets
          </div>
        </div>

        {/* SAFE */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/70 backdrop-blur-xl ring-1 ring-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs uppercase tracking-wider mb-2">
            <span>SAFE</span>
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-300">
              {stats.safeDetected}
            </span>
            {hasScans && (
              <span className="text-xs text-zinc-400 font-mono">
                {stats.riskDistribution.safePercentage}%
              </span>
            )}
          </div>
          <div className="mt-3 text-[11px] text-zinc-400 font-light border-t border-white/5 pt-2">
            Legitimate verifiable targets
          </div>
        </div>

        {/* AVERAGE RISK SCORE (Smaller / 5th card) */}
        <div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl bg-zinc-950/70 backdrop-blur-xl ring-1 ring-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs uppercase tracking-wider mb-2">
            <span>AVERAGE RISK</span>
            <BarChart3 className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-white font-mono">
              {stats.averageRiskScore}
            </span>
            <span className="text-xs text-zinc-500 font-mono">/ 100</span>
          </div>
          <div className="mt-3 text-[11px] text-zinc-400 font-light border-t border-white/5 pt-2">
            Weighted composite risk
          </div>
        </div>
      </div>

      {/* MID-LEVEL ANALYTICS: Threat Signals + Risk Distribution & Scan Types */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Section 4: MOST DETECTED THREAT SIGNALS (2 cols on desktop) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-zinc-950/60 backdrop-blur-xl ring-1 ring-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                  MOST DETECTED THREAT SIGNALS
                </h3>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                {stats.threatSignals.length} unique signals
              </span>
            </div>

            {stats.threatSignals.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs font-light tracking-wide">
                No threat signals detected yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {stats.threatSignals.slice(0, 6).map((signal) => (
                  <div key={signal.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-200 font-medium tracking-wide">
                        {signal.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 font-mono text-[11px]">
                          {signal.count} {signal.count === 1 ? 'incident' : 'incidents'}
                        </span>
                        <span className="text-zinc-500 text-[10px] font-mono w-9 text-right">
                          {signal.percentage}%
                        </span>
                      </div>
                    </div>
                    {/* Horizontal Visual Bar */}
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden ring-1 ring-white/10">
                      <div
                        className="h-full bg-white/70 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(6, signal.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Aggregated across all verified scan records</span>
            <span>Real-time SOC telemetry</span>
          </div>
        </div>

        {/* Section 5 & 6: RISK DISTRIBUTION & SCAN TYPE BREAKDOWN (1 col on desktop) */}
        <div className="flex flex-col gap-5">
          {/* Section 5: RISK DISTRIBUTION */}
          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950/60 backdrop-blur-xl ring-1 ring-white/10 flex flex-col justify-between">
            <div className="pb-3 border-b border-white/5 mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                RISK DISTRIBUTION
              </h3>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Classification</span>
            </div>

            {hasScans ? (
              <div className="flex flex-col gap-3">
                {/* Visual stacked distribution bar */}
                <div className="w-full h-3 rounded-full bg-white/5 flex overflow-hidden ring-1 ring-white/10">
                  {stats.riskDistribution.scam > 0 && (
                    <div
                      title={`Scam: ${stats.riskDistribution.scam}`}
                      className="h-full bg-white transition-all duration-300"
                      style={{ width: `${stats.riskDistribution.scamPercentage}%` }}
                    />
                  )}
                  {stats.riskDistribution.suspicious > 0 && (
                    <div
                      title={`Suspicious: ${stats.riskDistribution.suspicious}`}
                      className="h-full bg-zinc-400 transition-all duration-300"
                      style={{ width: `${stats.riskDistribution.suspiciousPercentage}%` }}
                    />
                  )}
                  {stats.riskDistribution.safe > 0 && (
                    <div
                      title={`Safe: ${stats.riskDistribution.safe}`}
                      className="h-full bg-zinc-600 transition-all duration-300"
                      style={{ width: `${stats.riskDistribution.safePercentage}%` }}
                    />
                  )}
                </div>

                {/* Legend & counts */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white inline-block" />
                      Scam
                    </span>
                    <span className="text-xs font-medium text-white font-mono mt-0.5">
                      {stats.riskDistribution.scam} ({stats.riskDistribution.scamPercentage}%)
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-zinc-400 inline-block" />
                      Suspicious
                    </span>
                    <span className="text-xs font-medium text-zinc-300 font-mono mt-0.5">
                      {stats.riskDistribution.suspicious} ({stats.riskDistribution.suspiciousPercentage}%)
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-zinc-600 inline-block" />
                      Safe
                    </span>
                    <span className="text-xs font-medium text-zinc-400 font-mono mt-0.5">
                      {stats.riskDistribution.safe} ({stats.riskDistribution.safePercentage}%)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-zinc-500 text-xs font-light">
                No classification distribution yet.
              </div>
            )}
          </div>

          {/* Section 6: SCAN TYPE BREAKDOWN */}
          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950/60 backdrop-blur-xl ring-1 ring-white/10 flex flex-col justify-between">
            <div className="pb-3 border-b border-white/5 mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                SCAN TYPE BREAKDOWN
              </h3>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Modality</span>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] ring-1 ring-white/5">
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <Globe className="w-3.5 h-3.5 text-zinc-400" />
                  <span>WEBSITE URL</span>
                </div>
                <span className="text-xs font-mono font-medium text-white">
                  {stats.scanTypeBreakdown.url}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] ring-1 ring-white/5">
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>EMAIL / MESSAGE</span>
                </div>
                <span className="text-xs font-mono font-medium text-white">
                  {stats.scanTypeBreakdown.message}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] ring-1 ring-white/5">
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                  <span>SCREENSHOT</span>
                </div>
                <span className="text-xs font-mono font-medium text-white">
                  {stats.scanTypeBreakdown.screenshot}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: RECENT ANALYSIS LIST / TABLE */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950/60 backdrop-blur-xl ring-1 ring-white/10 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5 mb-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              RECENT ANALYSIS
            </h3>
            <p className="text-[11px] text-zinc-500 font-light mt-0.5">
              Live inspection stream of the last scans evaluated by ScamLens AI.
            </p>
          </div>

          {hasScans && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <span>View full scan history ({records.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentRecords.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-xs text-zinc-300 font-medium uppercase tracking-wider">
              No recent scans recorded
            </p>
            <p className="text-xs text-zinc-500 font-light max-w-sm mt-1 mb-4">
              Your threat intelligence history will automatically populate here after your first analysis.
            </p>
            <button
              type="button"
              onClick={onOpenScanner}
              className="px-4 py-2 rounded-xl glass-button text-xs font-medium uppercase tracking-wider text-zinc-100 hover:text-white cursor-pointer"
            >
              Scan Your First Target
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-zinc-500 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2 font-medium">Classification</th>
                  <th className="pb-3 px-3 font-medium">Target Summary</th>
                  <th className="pb-3 px-3 font-medium">Scan Type</th>
                  <th className="pb-3 px-3 font-medium">Risk Score</th>
                  <th className="pb-3 px-3 font-medium">Confidence</th>
                  <th className="pb-3 px-3 font-medium">Timestamp</th>
                  <th className="pb-3 pr-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-3.5 pl-2 whitespace-nowrap">
                      {getClassificationBadge(record.classification)}
                    </td>
                    <td className="py-3.5 px-3 max-w-[240px] truncate font-medium text-zinc-200">
                      {record.targetSummary}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap text-zinc-400">
                      <span className="inline-flex items-center gap-1.5">
                        {getScanTypeIcon(record.scanType)}
                        <span>{getScanTypeLabel(record.scanType)}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-zinc-300">
                      <span className="font-semibold text-white">{record.riskScore}</span>
                      <span className="text-zinc-500 text-[10px]"> / 100</span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-zinc-400">
                      {record.confidence}%
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap text-zinc-400 text-[11px]">
                      {record.formattedDate}
                    </td>
                    <td className="py-3.5 pr-2 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => onViewReport(record.result)}
                        className="px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/15 text-zinc-200 hover:text-white transition-all text-[11px] font-medium tracking-wider uppercase ring-1 ring-white/10 hover:ring-white/25 cursor-pointer"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
