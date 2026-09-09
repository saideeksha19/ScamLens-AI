import { useState, useRef, useEffect, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Globe, 
  Mail, 
  Image as ImageIcon, 
  Shield, 
  UploadCloud, 
  CheckCircle2, 
  Sparkles,
  Loader2,
  AlertCircle,
  Trash2,
  RefreshCw,
  FileImage,
  ArrowRight
} from 'lucide-react';
import type { AnalysisCategory, ScamAnalysisResult } from '../types';
import { ScanResultView } from './ScanResultView';
import { saveScanRecord } from '../services/scanHistoryService';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: AnalysisCategory | null;
  viewResult?: ScamAnalysisResult | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function createSampleScreenshot(
  title: string,
  lines: string[],
  bgType: 'urgent' | 'safe' | 'bank'
): File {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new File(['test'], 'sample.png', { type: 'image/png' });
  }

  // Draw background
  if (bgType === 'urgent') {
    ctx.fillStyle = '#140c0c';
    ctx.fillRect(0, 0, 640, 420);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, 640, 10);
  } else if (bgType === 'bank') {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 640, 420);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(0, 0, 640, 10);
  } else {
    ctx.fillStyle = '#101412';
    ctx.fillRect(0, 0, 640, 420);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(0, 0, 640, 10);
  }

  // Simulated notification/message card
  ctx.fillStyle = '#1f1f23';
  ctx.beginPath();
  ctx.roundRect(24, 30, 592, 330, 14);
  ctx.fill();

  // Title and text
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = bgType === 'urgent' ? '#f87171' : bgType === 'bank' ? '#60a5fa' : '#34d399';
  ctx.fillText(title, 48, 75);

  ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#e4e4e7';

  let y = 120;
  for (const line of lines) {
    ctx.fillText(line, 48, y);
    y += 32;
  }

  // Footer status bar
  ctx.font = '11px monospace';
  ctx.fillStyle = '#71717a';
  ctx.fillText('Digital Message Capture • Secure Device Capture', 48, 335);

  const dataUrl = canvas.toDataURL('image/png');
  const arr = dataUrl.split(',');
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  const sampleFilename =
    bgType === 'urgent'
      ? 'urgent-account-suspension.png'
      : bgType === 'bank'
      ? 'fake-bank-login.png'
      : 'routine-chat-meeting.png';

  return new File([u8arr], sampleFilename, { type: 'image/png' });
}

export function ScanModal({ isOpen, onClose, initialCategory = 'url', viewResult = null }: ScanModalProps) {
  const [activeTab, setActiveTab] = useState<AnalysisCategory>(initialCategory || 'url');
  const [urlInput, setUrlInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Analysis state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing with ScamLens AI...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ScamAnalysisResult | null>(viewResult || null);

  // Sync viewResult when opened in report viewing mode
  useEffect(() => {
    if (viewResult && isOpen) {
      setAnalysisResult(viewResult);
    }
  }, [viewResult, isOpen]);

  // Sync initial category when modal opens
  useEffect(() => {
    if (initialCategory) {
      setActiveTab(initialCategory);
    }
  }, [initialCategory, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isLoading]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (filePreviewUrl && filePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  // Reset internal state when modal closes
  const handleModalClose = () => {
    if (isLoading) return;
    onClose();
    setTimeout(() => {
      setAnalysisResult(null);
      setErrorMessage(null);
    }, 300);
  };

  const processSelectedFile = (file: File) => {
    setErrorMessage(null);

    // Validate mime type and extension
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isAllowedExt = ['png', 'jpg', 'jpeg', 'webp'].includes(ext || '');

    if (!allowedMimeTypes.includes(file.type.toLowerCase()) && !isAllowedExt) {
      setErrorMessage('Unsupported file format. Please upload a PNG, JPG, JPEG, or WEBP image.');
      return;
    }

    // Validate size (max 10 MB = 10 * 1024 * 1024 bytes)
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(`File is too large (${sizeInMB} MB). Maximum allowed size is 10 MB.`);
      return;
    }

    if (filePreviewUrl && filePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(filePreviewUrl);
    }

    const preview = URL.createObjectURL(file);
    setSelectedFile(file);
    setFilePreviewUrl(preview);
  };

  const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    if (filePreviewUrl && filePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit handler for live website URL threat inspection
  const handleAnalyzeUrl = async () => {
    setErrorMessage(null);

    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMessage('Enter a complete website URL beginning with http:// or https://.');
      return;
    }

    // Require explicit http:// or https:// protocol (reject bare strings like 'not-a-url', 'hello', 'bank-login', 'example')
    if (!/^https?:\/\//i.test(trimmed)) {
      setErrorMessage('Enter a complete website URL beginning with http:// or https://.');
      return;
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        setErrorMessage('Enter a complete website URL beginning with http:// or https://.');
        return;
      }
      const host = parsed.hostname.toLowerCase();
      if (!host) {
        setErrorMessage('Enter a complete website URL beginning with http:// or https://.');
        return;
      }
      // If domain name (not IP or localhost/internal which will trigger SSRF on backend), check for valid public TLD
      const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.includes(':');
      if (!isIp && host !== 'localhost' && !host.endsWith('.local') && !host.endsWith('.internal')) {
        const labels = host.split('.');
        if (labels.length < 2 || !/^([a-z]{2,63}|xn--[a-z0-9-]{2,59})$/i.test(labels[labels.length - 1])) {
          setErrorMessage('Enter a complete website URL beginning with http:// or https://.');
          return;
        }
      }
    } catch {
      setErrorMessage('Enter a complete website URL beginning with http:// or https://.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Validating destination...');

    const stage1 = setTimeout(() => setLoadingMessage('Inspecting URL structure...'), 450);
    const stage2 = setTimeout(() => setLoadingMessage('Checking safe HTTP metadata...'), 1100);
    const stage3 = setTimeout(() => setLoadingMessage('Evaluating threat signals...'), 1800);
    const stage4 = setTimeout(() => setLoadingMessage('Generating AI assessment...'), 2600);

    try {
      const response = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete URL inspection.');
      }

      setAnalysisResult(data);

      // Persist real scan result to history
      try {
        let domainStr = data.urlIntelligence?.hostname || '';
        let protocolStr = data.urlIntelligence?.protocol || '';
        try {
          const parsed = new URL(trimmed);
          if (!domainStr) domainStr = parsed.hostname;
          if (!protocolStr) protocolStr = parsed.protocol;
        } catch {
          // ignore
        }
        saveScanRecord({
          scanType: 'url',
          targetSummary: domainStr || trimmed,
          result: data,
          domain: domainStr || trimmed,
          protocol: protocolStr,
        });
      } catch (saveErr) {
        console.error('Failed to save URL scan to history:', saveErr);
      }
    } catch (err: unknown) {
      console.error('URL analysis error:', err);
      const msg = err instanceof Error ? err.message : 'Network error. Please check your connection and try again.';
      setErrorMessage(msg);
    } finally {
      clearTimeout(stage1);
      clearTimeout(stage2);
      clearTimeout(stage3);
      clearTimeout(stage4);
      setIsLoading(false);
    }
  };

  // Submit handler for live scam detection
  const handleAnalyzeMessage = async () => {
    setErrorMessage(null);

    if (!messageInput.trim()) {
      setErrorMessage('Please enter or paste an email, SMS, or message to analyze.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Evaluating urgency hooks, credential queries, threats, and deception indicators...');

    try {
      const response = await fetch('/api/analyze-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageInput.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete threat analysis. Please try again.');
      }

      setAnalysisResult(data);

      // Persist real scan result to history
      try {
        const rawText = messageInput.trim();
        const snippet = rawText.length > 55 ? `${rawText.slice(0, 52)}...` : rawText;
        saveScanRecord({
          scanType: 'message',
          targetSummary: snippet,
          result: data,
          messagePreview: rawText.slice(0, 200),
        });
      } catch (saveErr) {
        console.error('Failed to save message scan to history:', saveErr);
      }
    } catch (err: unknown) {
      console.error('Scan error:', err);
      const msg = err instanceof Error ? err.message : 'Network error. Please check your connection and try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit handler for live screenshot vision analysis
  const handleAnalyzeScreenshot = async () => {
    setErrorMessage(null);

    if (!selectedFile) {
      setErrorMessage('Please select or upload a screenshot to analyze.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Performing OCR, brand verification, and visual phishing analysis...');

    try {
      // Read file as Base64 data URL
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read image file data.'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read image file.'));
        reader.readAsDataURL(selectedFile);
      });

      const dataUrl = await base64Promise;

      const response = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: dataUrl,
          mimeType: selectedFile.type || 'image/png',
          filename: selectedFile.name,
          fileSize: formatFileSize(selectedFile.size),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete screenshot analysis. Please try again.');
      }

      // Attach client-side preview URL for immediate review in results
      const resultWithPreview: ScamAnalysisResult = {
        ...data,
        imageUrl: dataUrl,
      };

      setAnalysisResult(resultWithPreview);

      // Persist real scan result to history
      try {
        saveScanRecord({
          scanType: 'screenshot',
          targetSummary: selectedFile.name || 'Screenshot',
          result: resultWithPreview,
          filename: selectedFile.name,
        });
      } catch (saveErr) {
        console.error('Failed to save screenshot scan to history:', saveErr);
      }
    } catch (err: unknown) {
      console.error('Screenshot analysis error:', err);
      const msg = err instanceof Error ? err.message : 'Network error. Please check your connection and try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick preset test samples
  const loadPreset = (text: string) => {
    setMessageInput(text);
    setErrorMessage(null);
  };

  const loadSampleScreenshot = (type: 'urgent' | 'safe' | 'bank') => {
    if (type === 'urgent') {
      const file = createSampleScreenshot(
        'URGENT: Account Suspension Alert',
        [
          'Your account will be suspended within 24 hours.',
          'Verify your identity immediately.',
          'Enter your password, username and OTP code below to unlock.'
        ],
        'urgent'
      );
      processSelectedFile(file);
    } else if (type === 'bank') {
      const file = createSampleScreenshot(
        'SecureBank Online Verification',
        [
          'Suspicious transaction detected on your debit card.',
          'Click to cancel the transfer immediately.',
          'Confirm card number, CVV, and 6-digit OTP code.'
        ],
        'bank'
      );
      processSelectedFile(file);
    } else {
      const file = createSampleScreenshot(
        'Direct Message • WhatsApp Chat',
        [
          'Hey Alex, are we still meeting at 5 PM today for coffee?',
          'Let me know when you arrive so I can save a table.',
          'See you soon!'
        ],
        'safe'
      );
      processSelectedFile(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="scan-modal-overlay" 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl"
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Full-viewport Backdrop dismiss */}
          <div 
            className="fixed inset-0" 
            onClick={handleModalClose} 
            aria-hidden="true" 
          />

          {/* Modal Card - Viewport-centered floating liquid glass */}
          <motion.div
            id="scan-modal-dialog"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ type: 'spring', duration: 0.32, bounce: 0 }}
            className="relative z-10 liquid-glass-modal flex flex-col w-[min(720px,calc(100vw-24px))] sm:w-[min(720px,calc(100vw-32px))] max-h-[calc(100svh-24px)] sm:max-h-[calc(100svh-48px)] overflow-hidden"
          >
            {/* SCANNER HEADER */}
            <div className="flex items-center justify-between px-4 py-3.5 sm:px-7 sm:py-5 border-b border-white/[0.07] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.06] ring-1 ring-white/12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)] flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-zinc-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-semibold tracking-wider text-white uppercase font-sans">
                      {analysisResult ? 'Threat Assessment Report' : 'Target Scanner'}
                    </h3>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-normal">
                    {analysisResult 
                      ? 'AI-verified scam risk and indicator breakdown' 
                      : 'AI-powered threat inspection'}
                  </p>
                </div>
              </div>

              <button
                id="close-scan-modal-button"
                type="button"
                onClick={handleModalClose}
                disabled={isLoading}
                aria-label="Close scanner"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.12] text-zinc-400 hover:text-white transition-all cursor-pointer ring-1 ring-white/10 disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MODAL BODY */}
            {analysisResult ? (
              <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-7 sm:py-6">
                <ScanResultView 
                  result={analysisResult} 
                  onReset={() => {
                    setAnalysisResult(null);
                    setErrorMessage(null);
                  }}
                  onClose={handleModalClose}
                />
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-3.5 sm:px-7 sm:py-5 space-y-3.5">
                  {/* MODE SELECTOR */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/[0.025] ring-1 ring-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => { setActiveTab('url'); setErrorMessage(null); }}
                      className={`flex items-center justify-center gap-2 py-2 px-2 sm:px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                        activeTab === 'url'
                          ? 'bg-white/[0.14] text-white shadow-md ring-1 ring-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22)]'
                          : 'bg-white/[0.035] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Website URL</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setActiveTab('email'); setErrorMessage(null); }}
                      className={`flex items-center justify-center gap-2 py-2 px-2 sm:px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                        activeTab === 'email'
                          ? 'bg-white/[0.14] text-white shadow-md ring-1 ring-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22)]'
                          : 'bg-white/[0.035] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Email / Message</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setActiveTab('screenshot'); setErrorMessage(null); }}
                      className={`flex items-center justify-center gap-2 py-2 px-2 sm:px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                        activeTab === 'screenshot'
                          ? 'bg-white/[0.14] text-white shadow-md ring-1 ring-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22)]'
                          : 'bg-white/[0.035] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Screenshot</span>
                    </button>
                  </div>

                  {/* ERROR STATE: Compact Security Alert */}
                  {errorMessage && (
                    <div className="p-2.5 px-3 rounded-xl bg-red-500/[0.08] backdrop-blur-md ring-1 ring-red-500/25 flex items-start gap-2.5 text-red-200">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono uppercase tracking-wider font-semibold text-red-400">
                          {errorMessage.includes('restricted') || errorMessage.includes('private') ? 'TARGET RESTRICTED' : 'VALIDATION ALERT'}
                        </div>
                        <p className="text-xs text-red-200/90 leading-relaxed mt-0.5 font-sans">
                          {errorMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* INPUT AREA: TAB SPECIFIC */}
                  {activeTab === 'url' && (
                    <div className="space-y-3">
                      {/* URL Destination Input */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label 
                            htmlFor="url-scan-input" 
                            className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-zinc-300"
                          >
                            WEBSITE DESTINATION
                          </label>
                          <span className="text-[10px] font-mono text-zinc-500">
                            HTTP / HTTPS
                          </span>
                        </div>

                        <div className="relative flex items-center rounded-xl bg-black/40 ring-1 ring-white/12 focus-within:ring-white/30 focus-within:bg-black/60 transition-all">
                          <div className="pl-3.5 pr-2.5 flex items-center pointer-events-none text-zinc-400">
                            <Globe className="w-4 h-4 text-zinc-400" />
                          </div>
                          <input
                            id="url-scan-input"
                            type="url"
                            placeholder="https://example.com"
                            aria-label="Enter website link or domain to scan"
                            value={urlInput}
                            onChange={(e) => {
                              setUrlInput(e.target.value);
                              if (errorMessage) setErrorMessage(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !isLoading && urlInput.trim()) {
                                e.preventDefault();
                                handleAnalyzeUrl();
                              }
                            }}
                            disabled={isLoading}
                            className="w-full py-2.5 pr-4 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none font-mono disabled:opacity-60"
                          />
                        </div>
                      </div>

                      {/* QUICK TEST SAMPLES */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                          Quick Test Samples:
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => { setUrlInput('https://example.com'); setErrorMessage(null); }}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] ring-1 ring-white/10 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer font-mono flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                            <span>Safe Domain</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setUrlInput('https://secure-bank-login.example.com/account/verify'); setErrorMessage(null); }}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] ring-1 ring-white/10 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer font-mono flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                            <span>Suspicious Pattern</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setUrlInput('http://update-security-alert.top/signin'); setErrorMessage(null); }}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] ring-1 ring-white/10 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer font-mono flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400/80" />
                            <span>Risky TLD</span>
                          </button>
                        </div>
                      </div>

                      {/* INTELLIGENCE PANEL */}
                      <div className="p-3 rounded-xl bg-white/[0.025] ring-1 ring-white/[0.08] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10.5px] font-mono uppercase tracking-wider font-semibold text-zinc-300">
                            AUTOMATED MULTI-SIGNAL INSPECTION
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            PRE-ANALYSIS
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                          Checks protocol encryption, subdomain depth, keyword manipulation, redirect chains and safe metadata before Gemini threat reasoning.
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] ring-1 ring-white/8 text-[10px] font-mono text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/90" />
                            <span>URL STRUCTURE</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] ring-1 ring-white/8 text-[10px] font-mono text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/90" />
                            <span>NETWORK SAFETY</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] ring-1 ring-white/8 text-[10px] font-mono text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400/90" />
                            <span>AI REASONING</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'email' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label 
                            htmlFor="message-scan-input" 
                            className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-zinc-300"
                          >
                            MESSAGE CONTENT
                          </label>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {messageInput.length} chars
                          </span>
                        </div>

                        <textarea
                          id="message-scan-input"
                          rows={3}
                          placeholder="Paste suspicious email headers, SMS, WhatsApp alert, or message text here..."
                          aria-label="Paste email headers, message body, SMS, or suspicious text"
                          value={messageInput}
                          onChange={(e) => {
                            setMessageInput(e.target.value);
                            if (errorMessage) setErrorMessage(null);
                          }}
                          disabled={isLoading}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 ring-1 ring-white/12 focus:ring-white/30 focus:bg-black/60 text-sm text-white placeholder:text-zinc-600 focus:outline-none resize-none font-sans leading-relaxed disabled:opacity-60 transition-all"
                        />
                      </div>

                      {/* QUICK TEST SAMPLES */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                          Quick Test Samples:
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => loadPreset('Hey, are we still meeting at 5 PM today for coffee? Let me know!')}
                            disabled={isLoading}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] ring-1 ring-white/10 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer font-mono flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                            <span>Meeting Invite (Safe)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => loadPreset('URGENT! Your bank account will be permanently blocked within 24 hours. Click the link immediately and enter your username, password and OTP.')}
                            disabled={isLoading}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] ring-1 ring-white/10 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer font-mono flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                            <span>Bank Block Phishing</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => loadPreset('Congratulations! You have been selected for a work-from-home job paying $4,500/week. Pay $99 registration fee immediately to confirm your position.')}
                            disabled={isLoading}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] ring-1 ring-white/10 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer font-mono flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400/80" />
                            <span>Work-From-Home Scam</span>
                          </button>
                        </div>
                      </div>

                      {/* INTELLIGENCE PANEL */}
                      <div className="p-3 rounded-xl bg-white/[0.025] ring-1 ring-white/[0.08] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10.5px] font-mono uppercase tracking-wider font-semibold text-zinc-300">
                            AUTOMATED MULTI-SIGNAL INSPECTION
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            LINGUISTIC REASONING
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                          Evaluates urgency hooks, credential requests, threats, financial fraud patterns, and sender deception indicators before AI analysis.
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] ring-1 ring-white/8 text-[10px] font-mono text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/90" />
                            <span>LINGUISTIC HOOKS</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] ring-1 ring-white/8 text-[10px] font-mono text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/90" />
                            <span>URGENCY SIGNATURES</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] ring-1 ring-white/8 text-[10px] font-mono text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400/90" />
                            <span>AI REASONING</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'screenshot' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-zinc-300">
                            SCREENSHOT CAPTURE
                          </label>
                          <span className="text-[10px] font-mono text-zinc-500">
                            PNG, JPG, WEBP • Max 10MB
                          </span>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              processSelectedFile(e.target.files[0]);
                            }
                          }}
                        />

                        {/* Selected Image Preview or Dropzone */}
                        {selectedFile && filePreviewUrl ? (
                          <div className="p-3 rounded-xl bg-black/40 ring-1 ring-white/12 space-y-2.5">
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <FileImage className="w-4 h-4 text-zinc-400 shrink-0" />
                                <div className="truncate">
                                  <p className="text-xs font-medium text-white truncate">
                                    {selectedFile.name}
                                  </p>
                                  <p className="text-[10px] text-zinc-500 font-mono">
                                    {formatFileSize(selectedFile.size)} • {selectedFile.type || 'image'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  disabled={isLoading}
                                  className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
                                >
                                  <RefreshCw className="w-3 h-3 text-zinc-400" />
                                  <span>Replace</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleRemoveFile}
                                  disabled={isLoading}
                                  className="p-1 rounded-lg bg-white/[0.06] hover:bg-red-500/20 text-zinc-400 hover:text-red-300 transition-colors cursor-pointer disabled:opacity-40"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="relative rounded-lg overflow-hidden bg-black/60 ring-1 ring-white/10 max-h-36 flex items-center justify-center p-1.5">
                              <img
                                src={filePreviewUrl}
                                alt="Screenshot Preview"
                                className="max-h-32 max-w-full rounded object-contain"
                              />
                            </div>
                          </div>
                        ) : (
                          <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleFileDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border border-dashed rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                              isDragging 
                                ? 'border-white/50 bg-white/[0.08]' 
                                : 'border-white/15 hover:border-white/30 bg-black/30'
                            }`}
                          >
                            <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center ring-1 ring-white/10">
                              <UploadCloud className="w-4 h-4 text-zinc-300" />
                            </div>
                            <span className="text-xs text-zinc-200 font-medium text-center">
                              Click to browse or drop screenshot here
                            </span>
                            <span className="text-[10.5px] text-zinc-500">
                              Supports PNG, JPG, JPEG, WEBP (up to 10 MB)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* QUICK TEST SAMPLES */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                          Quick Test Samples:
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => loadSampleScreenshot('urgent')}
                            disabled={isLoading}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] ring-1 ring-white/10 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer font-mono flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400/80" />
                            <span>Urgent Suspension</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => loadSampleScreenshot('bank')}
                            disabled={isLoading}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] ring-1 ring-white/10 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer font-mono flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                            <span>Fake Bank Alert</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => loadSampleScreenshot('safe')}
                            disabled={isLoading}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] ring-1 ring-white/10 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer font-mono flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                            <span>Routine Chat</span>
                          </button>
                        </div>
                      </div>

                      {/* INTELLIGENCE PANEL */}
                      <div className="p-3 rounded-xl bg-white/[0.025] ring-1 ring-white/[0.08] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10.5px] font-mono uppercase tracking-wider font-semibold text-zinc-300">
                            AUTOMATED MULTI-SIGNAL INSPECTION
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            VISION ANALYSIS
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                          Inspects visual hierarchy, brand impersonation, spoofed interfaces, OCR text extractions, and credential traps.
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] ring-1 ring-white/8 text-[10px] font-mono text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/90" />
                            <span>VISUAL SPOOFING</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] ring-1 ring-white/8 text-[10px] font-mono text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/90" />
                            <span>OCR EXTRACTION</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] ring-1 ring-white/8 text-[10px] font-mono text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400/90" />
                            <span>AI VISION</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LOADING STATE INDICATOR */}
                  {isLoading && (
                    <div className="p-3 rounded-xl bg-white/[0.04] ring-1 ring-white/15 flex items-center gap-3 animate-pulse">
                      <Loader2 className="w-4 h-4 text-white animate-spin shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                          {activeTab === 'url'
                            ? 'INSPECTING URL'
                            : activeTab === 'screenshot'
                            ? 'ANALYZING SCREENSHOT'
                            : 'ANALYZING MESSAGE'}
                        </div>
                        <div className="text-xs font-medium text-white truncate mt-0.5 font-sans">
                          {loadingMessage}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* FOOTER / CTA */}
                <div className="px-4 py-3.5 sm:px-7 sm:py-4 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2.5 self-start sm:self-center">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono tracking-wider uppercase font-semibold text-zinc-300">
                        AI THREAT INTELLIGENCE
                      </span>
                      <span className="text-[9px] font-mono tracking-wider uppercase text-zinc-500">
                        REAL-TIME INSPECTION
                      </span>
                    </div>
                  </div>

                  {activeTab === 'url' && (
                    <button
                      id="analyze-url-button"
                      type="button"
                      onClick={handleAnalyzeUrl}
                      disabled={isLoading || !urlInput.trim()}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/[0.12] hover:bg-white/[0.18] active:scale-[0.98] hover:scale-[1.02] ring-1 ring-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] text-xs font-mono tracking-wider uppercase font-semibold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-300" />
                          <span>Inspecting URL...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                          <span>Analyze Website</span>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-300" />
                        </>
                      )}
                    </button>
                  )}

                  {activeTab === 'email' && (
                    <button
                      id="analyze-email-button"
                      type="button"
                      onClick={handleAnalyzeMessage}
                      disabled={isLoading || !messageInput.trim()}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/[0.12] hover:bg-white/[0.18] active:scale-[0.98] hover:scale-[1.02] ring-1 ring-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] text-xs font-mono tracking-wider uppercase font-semibold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-300" />
                          <span>Analyzing Message...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                          <span>Analyze Message</span>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-300" />
                        </>
                      )}
                    </button>
                  )}

                  {activeTab === 'screenshot' && (
                    <button
                      id="analyze-screenshot-button"
                      type="button"
                      onClick={handleAnalyzeScreenshot}
                      disabled={isLoading || !selectedFile}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/[0.12] hover:bg-white/[0.18] active:scale-[0.98] hover:scale-[1.02] ring-1 ring-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] text-xs font-mono tracking-wider uppercase font-semibold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-300" />
                          <span>Analyzing Screenshot...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                          <span>Analyze Screenshot</span>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-300" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

