import { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  RotateCcw,
  Sparkles,
  Info,
  FileText,
  HelpCircle,
  Eye,
  ImageIcon,
  ScanText,
  Globe
} from 'lucide-react';
import type { ScamAnalysisResult } from '../types';

interface ScanResultViewProps {
  result: ScamAnalysisResult;
  onReset: () => void;
  onClose: () => void;
}

export function ScanResultView({ result, onReset, onClose }: ScanResultViewProps) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedOCR, setCopiedOCR] = useState(false);

  const handleCopyOriginal = () => {
    if (result.submittedText) {
      navigator.clipboard.writeText(result.submittedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyOCR = () => {
    if (result.extractedText) {
      navigator.clipboard.writeText(result.extractedText);
      setCopiedOCR(true);
      setTimeout(() => setCopiedOCR(false), 2000);
    }
  };

  const isScam = result.classification === 'SCAM';
  const isSuspicious = result.classification === 'SUSPICIOUS';
  const isSafe = result.classification === 'SAFE';
  const isScreenshot = Boolean(result.imageUrl || result.imageMeta);
  const isUrlScan = Boolean(result.urlIntelligence);

  const evidenceLabel = isUrlScan
    ? 'Evidence from URL:'
    : isScreenshot
    ? 'Evidence from screenshot:'
    : 'Evidence from message:';

  // Badge styling matching ScamLens dark monochrome aesthetic
  const getClassificationBadge = () => {
    if (isScam) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 text-red-300 ring-1 ring-red-500/30 text-xs sm:text-sm font-semibold tracking-wider uppercase">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          SCAM
        </span>
      );
    }
    if (isSuspicious) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30 text-xs sm:text-sm font-semibold tracking-wider uppercase">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          SUSPICIOUS
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 text-xs sm:text-sm font-semibold tracking-wider uppercase">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        SAFE
      </span>
    );
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-red-500/20 text-red-300 ring-1 ring-red-500/30">
            HIGH SEVERITY
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30">
            MEDIUM SEVERITY
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-zinc-800 text-zinc-300 ring-1 ring-white/10">
            LOW SEVERITY
          </span>
        );
    }
  };

  return (
    <div id="scan-result-container" className="space-y-5 animate-in fade-in duration-300">
      {/* THREAT ASSESSMENT Header Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 ring-1 ring-white/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/10">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              THREAT ASSESSMENT
            </div>
            <div className="mt-1 flex items-center gap-3">
              {getClassificationBadge()}
              <span className="text-xs text-zinc-400">
                {isScam && 'High probability of malicious intent or financial fraud'}
                {isSuspicious && 'Contains questionable elements or artificial pressure'}
                {isSafe && 'No standard scam patterns or extortion indicators detected'}
              </span>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-4 sm:border-l sm:border-white/10 sm:pl-4 shrink-0">
            <div>
              <div className="text-[9.5px] uppercase tracking-wider text-zinc-500 font-medium">
                Risk Score
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-baseline gap-1">
                <span>{result.riskScore}</span>
                <span className="text-xs font-normal text-zinc-500">/ 100</span>
              </div>
            </div>
            <div>
              <div className="text-[9.5px] uppercase tracking-wider text-zinc-500 font-medium">
                Confidence
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-baseline gap-1">
                <span>{result.confidence}</span>
                <span className="text-xs font-normal text-zinc-500">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk progress bar */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>SAFE (0)</span>
            <span>SUSPICIOUS (50)</span>
            <span>SCAM (100)</span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-800/90 ring-1 ring-white/10 overflow-hidden relative">
            <div 
              className={`h-full transition-all duration-700 ease-out rounded-full ${
                result.riskScore >= 70 
                  ? 'bg-red-500' 
                  : result.riskScore >= 35 
                    ? 'bg-amber-400' 
                    : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.max(4, Math.min(100, result.riskScore))}%` }}
            />
          </div>
        </div>
      </div>

      {/* WHY WE FLAGGED THIS (Detected Indicators) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-zinc-400" />
            <span>Why We Flagged This</span>
          </h4>
          <span className="text-[11px] text-zinc-400 font-mono">
            {result.indicators.length} {result.indicators.length === 1 ? 'Indicator' : 'Indicators'} Detected
          </span>
        </div>

        {result.indicators.length > 0 ? (
          <div className="space-y-2.5">
            {result.indicators.map((indicator, idx) => (
              <div 
                key={idx}
                className="p-3 sm:p-3.5 rounded-xl bg-zinc-900/70 ring-1 ring-white/10 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-zinc-200">
                    {indicator.name}
                  </span>
                  {getSeverityBadge(indicator.severity)}
                </div>

                {/* Evidence Quote */}
                {indicator.evidence && (
                  <div className="p-2 rounded-lg bg-black/40 ring-1 ring-white/5">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-0.5 font-mono">
                      {evidenceLabel}
                    </span>
                    <p className="text-xs text-zinc-300 font-mono italic leading-relaxed">
                      &ldquo;{indicator.evidence}&rdquo;
                    </p>
                  </div>
                )}

                {/* Explanation */}
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  <span className="text-zinc-300 font-medium">Why it matters: </span>
                  {indicator.explanation}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-zinc-900/60 ring-1 ring-white/10 text-center">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-1.5 opacity-80" />
            <p className="text-xs text-zinc-300 font-medium">
              No scam indicators or manipulative patterns found.
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              The submitted content does not exhibit common phishing, extortion, or credential theft vectors.
            </p>
          </div>
        )}
      </div>

      {/* AI SUMMARY */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          <span>AI Summary</span>
        </h4>
        <div className="p-3.5 rounded-xl bg-zinc-900/70 ring-1 ring-white/10">
          <p className="text-xs sm:text-[13px] text-zinc-300 font-light leading-relaxed">
            {result.summary}
          </p>
        </div>
      </div>

      {/* URL INTELLIGENCE (Compact Section) */}
      {result.urlIntelligence && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <span>URL Intelligence</span>
          </h4>
          <div className="p-3.5 rounded-xl bg-zinc-900/80 ring-1 ring-white/10 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">Domain</span>
                <span className="text-zinc-200 font-medium truncate block font-mono text-xs" title={result.urlIntelligence.hostname}>
                  {result.urlIntelligence.hostname}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">Protocol</span>
                <span className="text-zinc-200 font-medium block font-mono text-xs">
                  {result.urlIntelligence.protocol.toUpperCase()}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">Redirects</span>
                <span className="text-zinc-200 font-medium block font-mono text-xs">
                  {result.urlIntelligence.redirectCount}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">Final Destination</span>
                <span className="text-zinc-200 font-medium truncate block font-mono text-xs" title={result.urlIntelligence.finalUrl}>
                  {result.urlIntelligence.finalUrl ? (() => {
                    try {
                      return new URL(result.urlIntelligence.finalUrl).hostname;
                    } catch {
                      return result.urlIntelligence.hostname;
                    }
                  })() : result.urlIntelligence.hostname}
                </span>
              </div>
            </div>

            {/* Detected Signals */}
            {result.urlIntelligence.signals && result.urlIntelligence.signals.length > 0 && (
              <div className="pt-2.5 border-t border-white/10">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1.5 font-mono">
                  Detected Signals
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.urlIntelligence.signals.map((sig, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 ring-1 ring-white/10 font-mono"
                    >
                      {sig}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISUAL ANALYSIS (Screenshot Specific Findings) */}
      {result.visualAnalysis && result.visualAnalysis.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-zinc-400" />
            <span>Visual Analysis</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.visualAnalysis.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-zinc-900/80 ring-1 ring-white/10 flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                  <span className="text-[11px] font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-light leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WHAT YOU SHOULD DO */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
          <span>What You Should Do</span>
        </h4>
        <div className="p-3.5 rounded-xl bg-zinc-900/70 ring-1 ring-white/10 border-l-2 border-white/40">
          <p className="text-xs sm:text-[13px] text-zinc-200 leading-relaxed font-medium">
            {result.recommendation}
          </p>
        </div>
      </div>

      {/* VIEW ANALYZED SCREENSHOT Collapsible */}
      {result.imageUrl && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowImagePreview(!showImagePreview)}
            className="w-full py-2.5 px-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-900/90 ring-1 ring-white/10 flex items-center justify-between text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span>VIEW ANALYZED SCREENSHOT</span>
            </span>
            <span className="flex items-center gap-2">
              {result.imageMeta && (
                <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                  {result.imageMeta.filename} ({result.imageMeta.fileSize})
                </span>
              )}
              {showImagePreview ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </span>
          </button>

          {showImagePreview && (
            <div className="mt-2 p-3 rounded-xl bg-black/70 ring-1 ring-white/10 flex flex-col items-center justify-center">
              <img
                src={result.imageUrl}
                alt="Analyzed Screenshot"
                className="max-h-72 max-w-full rounded-lg object-contain border border-white/10 shadow-lg"
              />
              {result.imageMeta && (
                <div className="mt-2 text-[10px] text-zinc-400 font-mono">
                  {result.imageMeta.filename} • {result.imageMeta.fileSize} • {result.imageMeta.mimeType}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW EXTRACTED OCR TEXT Collapsible */}
      {result.extractedText && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowExtractedText(!showExtractedText)}
            className="w-full py-2.5 px-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-900/90 ring-1 ring-white/10 flex items-center justify-between text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ScanText className="w-3.5 h-3.5 text-zinc-400" />
              <span>VIEW EXTRACTED OCR TEXT</span>
            </span>
            {showExtractedText ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {showExtractedText && (
            <div className="mt-2 p-3.5 rounded-xl bg-black/70 ring-1 ring-white/10 relative">
              <button
                type="button"
                onClick={handleCopyOCR}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                title="Copy extracted OCR text"
              >
                {copiedOCR ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-zinc-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <pre className="text-[11px] text-zinc-300 font-mono whitespace-pre-wrap break-words leading-relaxed max-h-48 overflow-y-auto pr-8">
                {result.extractedText}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* VIEW ORIGINAL MESSAGE Collapsible */}
      {result.submittedText && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowOriginal(!showOriginal)}
            className="w-full py-2.5 px-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-900/90 ring-1 ring-white/10 flex items-center justify-between text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>VIEW ORIGINAL MESSAGE</span>
            </span>
            {showOriginal ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {showOriginal && (
            <div className="mt-2 p-3.5 rounded-xl bg-black/70 ring-1 ring-white/10 relative">
              <button
                type="button"
                onClick={handleCopyOriginal}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                title="Copy original text"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-zinc-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <pre className="text-[11px] text-zinc-300 font-mono whitespace-pre-wrap break-words leading-relaxed max-h-48 overflow-y-auto pr-8">
                {result.submittedText}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Footer Actions */}
      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 ring-1 ring-white/20 text-xs font-medium text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-zinc-300" />
          <span>
            {result.urlIntelligence
              ? 'Scan Another URL'
              : isScreenshot
              ? 'Scan Another Screenshot'
              : 'Scan Another Message'}
          </span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto px-5 py-2 rounded-full bg-transparent hover:bg-white/5 ring-1 ring-white/10 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}
