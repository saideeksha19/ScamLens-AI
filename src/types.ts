/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AnalysisCategory = 'url' | 'email' | 'screenshot';

export interface AnalysisOption {
  id: AnalysisCategory;
  label: string;
  iconName: string;
  description: string;
  placeholder: string;
}

export interface SecurityIndicator {
  label: string;
  value: string;
  level: 'critical' | 'suspicious' | 'safe';
}

export type ScamClassification = 'SAFE' | 'SUSPICIOUS' | 'SCAM';
export type IndicatorSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ScamIndicator {
  name: string;
  severity: IndicatorSeverity;
  evidence: string;
  explanation: string;
}

export interface VisualFinding {
  category: string;
  description: string;
}

export interface UrlIntelligence {
  hostname: string;
  protocol: string;
  finalUrl: string;
  redirectCount: number;
  statusCode?: number;
  pageTitle?: string;
  signals: string[];
}

export interface ScamAnalysisResult {
  classification: ScamClassification;
  riskScore: number;
  confidence: number;
  summary: string;
  indicators: ScamIndicator[];
  recommendation: string;
  submittedText?: string;
  extractedText?: string;
  visualAnalysis?: VisualFinding[];
  imageUrl?: string;
  imageMeta?: {
    filename: string;
    fileSize: string;
    mimeType: string;
  };
  urlIntelligence?: UrlIntelligence;
  analyzedAt?: string;
}

export type ScanType = 'url' | 'message' | 'screenshot';

export interface ScanHistoryRecord {
  id: string;
  timestamp: number;
  formattedDate: string;
  scanType: ScanType;
  targetSummary: string;
  classification: ScamClassification;
  riskScore: number;
  confidence: number;
  indicators: string[];
  summary: string;
  recommendation: string;
  filename?: string;
  domain?: string;
  protocol?: string;
  messagePreview?: string;
  result: ScamAnalysisResult;
}

export interface ThreatSignalStat {
  name: string;
  count: number;
  percentage: number;
}

export interface ThreatStats {
  totalScans: number;
  scamsDetected: number;
  suspiciousDetected: number;
  safeDetected: number;
  averageRiskScore: number;
  threatSignals: ThreatSignalStat[];
  scanTypeBreakdown: {
    url: number;
    message: number;
    screenshot: number;
  };
  riskDistribution: {
    safe: number;
    suspicious: number;
    scam: number;
    safePercentage: number;
    suspiciousPercentage: number;
    scamPercentage: number;
  };
}
