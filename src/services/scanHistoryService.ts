/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ScanHistoryRecord, ThreatStats, ThreatSignalStat, ScamAnalysisResult, ScanType } from '../types';

const STORAGE_KEY = 'scamlens_scan_history_v1';
export const HISTORY_UPDATED_EVENT = 'scamlens_history_updated';

/**
 * Format timestamp to a clean, human-readable date & time
 */
export function formatScanTimestamp(timestamp: number): string {
  try {
    const d = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return new Date(timestamp).toLocaleDateString();
  }
}

/**
 * Get all stored scan history records
 */
export function getScanHistory(): ScanHistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to retrieve scan history from storage:', err);
    return [];
  }
}

/**
 * Calculate dynamic Threat Intelligence stats based strictly on stored records
 */
export function calculateThreatStats(records: ScanHistoryRecord[]): ThreatStats {
  const totalScans = records.length;

  if (totalScans === 0) {
    return {
      totalScans: 0,
      scamsDetected: 0,
      suspiciousDetected: 0,
      safeDetected: 0,
      averageRiskScore: 0,
      threatSignals: [],
      scanTypeBreakdown: {
        url: 0,
        message: 0,
        screenshot: 0,
      },
      riskDistribution: {
        safe: 0,
        suspicious: 0,
        scam: 0,
        safePercentage: 0,
        suspiciousPercentage: 0,
        scamPercentage: 0,
      },
    };
  }

  let scamsDetected = 0;
  let suspiciousDetected = 0;
  let safeDetected = 0;
  let totalRiskScore = 0;

  const typeCounts = {
    url: 0,
    message: 0,
    screenshot: 0,
  };

  const signalCounts: Record<string, number> = {};

  for (const record of records) {
    totalRiskScore += Number(record.riskScore || 0);

    if (record.classification === 'SCAM') {
      scamsDetected++;
    } else if (record.classification === 'SUSPICIOUS') {
      suspiciousDetected++;
    } else {
      safeDetected++;
    }

    if (record.scanType in typeCounts) {
      typeCounts[record.scanType]++;
    }

    // Tally threat signals/indicators
    if (Array.isArray(record.indicators)) {
      for (const indicator of record.indicators) {
        const trimmed = indicator?.trim();
        if (trimmed) {
          signalCounts[trimmed] = (signalCounts[trimmed] || 0) + 1;
        }
      }
    }
  }

  const averageRiskScore = Math.round(totalRiskScore / totalScans);

  // Convert signal counts to sorted list
  const signalEntries = Object.entries(signalCounts);
  signalEntries.sort((a, b) => b[1] - a[1]);

  const threatSignals: ThreatSignalStat[] = signalEntries.map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / totalScans) * 100),
  }));

  const safePercentage = Math.round((safeDetected / totalScans) * 100);
  const suspiciousPercentage = Math.round((suspiciousDetected / totalScans) * 100);
  const scamPercentage = Math.round((scamsDetected / totalScans) * 100);

  return {
    totalScans,
    scamsDetected,
    suspiciousDetected,
    safeDetected,
    averageRiskScore,
    threatSignals,
    scanTypeBreakdown: typeCounts,
    riskDistribution: {
      safe: safeDetected,
      suspicious: suspiciousDetected,
      scam: scamsDetected,
      safePercentage,
      suspiciousPercentage,
      scamPercentage,
    },
  };
}

/**
 * Save a newly executed real scan result into persistent storage
 */
export function saveScanRecord(params: {
  scanType: ScanType;
  targetSummary: string;
  result: ScamAnalysisResult;
  filename?: string;
  domain?: string;
  protocol?: string;
  messagePreview?: string;
}): ScanHistoryRecord {
  const timestamp = Date.now();
  const id = `scan_${timestamp}_${Math.random().toString(36).substring(2, 9)}`;
  const formattedDate = formatScanTimestamp(timestamp);

  // Extract indicator names
  const indicatorNames = Array.isArray(params.result.indicators)
    ? params.result.indicators.map((ind) => ind.name).filter(Boolean)
    : [];

  const newRecord: ScanHistoryRecord = {
    id,
    timestamp,
    formattedDate,
    scanType: params.scanType,
    targetSummary: params.targetSummary,
    classification: params.result.classification,
    riskScore: params.result.riskScore,
    confidence: params.result.confidence,
    indicators: indicatorNames,
    summary: params.result.summary || '',
    recommendation: params.result.recommendation || '',
    filename: params.filename,
    domain: params.domain,
    protocol: params.protocol,
    messagePreview: params.messagePreview,
    result: {
      ...params.result,
      analyzedAt: params.result.analyzedAt || formattedDate,
    },
  };

  try {
    const existing = getScanHistory();
    // Prepend latest scan so it appears first in history
    const updated = [newRecord, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch global event for instant reactive UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(HISTORY_UPDATED_EVENT, { detail: newRecord }));
    }
  } catch (err) {
    console.error('Failed to persist scan record to storage:', err);
  }

  return newRecord;
}

/**
 * Find a specific scan record by id
 */
export function getScanRecordById(id: string): ScanHistoryRecord | null {
  const list = getScanHistory();
  return list.find((item) => item.id === id) || null;
}

/**
 * Delete a specific record from history
 */
export function deleteScanRecord(id: string): void {
  try {
    const list = getScanHistory();
    const filtered = list.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(HISTORY_UPDATED_EVENT));
    }
  } catch (err) {
    console.error('Failed to delete scan record:', err);
  }
}

/**
 * Clear all scan history
 */
export function clearScanHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(HISTORY_UPDATED_EVENT));
    }
  } catch (err) {
    console.error('Failed to clear scan history:', err);
  }
}
