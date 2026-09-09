import express from "express";
import path from "path";
import dns from "node:dns";
import net from "node:net";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "25mb" }));

// Lazy GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ScamLens AI Backend",
    timestamp: new Date().toISOString(),
  });
});

// Scam Analysis Schema for Gemini
const scamAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    classification: {
      type: Type.STRING,
      description: "Must be exactly SAFE, SUSPICIOUS, or SCAM",
    },
    riskScore: {
      type: Type.INTEGER,
      description: "An integer between 0 and 100 indicating the scam risk likelihood",
    },
    confidence: {
      type: Type.INTEGER,
      description: "An integer between 0 and 100 indicating model confidence in this assessment",
    },
    summary: {
      type: Type.STRING,
      description: "A concise 1-3 sentence summary explaining the key findings and threat level",
    },
    indicators: {
      type: Type.ARRAY,
      description: "List of detected scam indicators. Empty array if the text is SAFE.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "Short name of the indicator (e.g., Urgency, Credential Theft, Fake Job Offer, OTP Request, Threat / Coercion)",
          },
          severity: {
            type: Type.STRING,
            description: "Severity of this indicator: LOW, MEDIUM, or HIGH",
          },
          evidence: {
            type: Type.STRING,
            description: "Direct verbatim quote or specific excerpt from the submitted message that proves this indicator. Never fabricate or invent evidence.",
          },
          explanation: {
            type: Type.STRING,
            description: "Clear explanation of why this specific evidence poses a security risk to the recipient",
          },
        },
        required: ["name", "severity", "evidence", "explanation"],
      },
    },
    recommendation: {
      type: Type.STRING,
      description: "Clear, actionable advice telling the user exactly what to do next to protect themselves",
    },
  },
  required: [
    "classification",
    "riskScore",
    "confidence",
    "summary",
    "indicators",
    "recommendation",
  ],
};

// Screenshot Scam Analysis Schema for Multimodal Gemini
const screenshotAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    classification: {
      type: Type.STRING,
      description: "Must be exactly SAFE, SUSPICIOUS, or SCAM",
    },
    riskScore: {
      type: Type.INTEGER,
      description: "An integer between 0 and 100 indicating the scam risk likelihood",
    },
    confidence: {
      type: Type.INTEGER,
      description: "An integer between 0 and 100 indicating model confidence in this assessment",
    },
    summary: {
      type: Type.STRING,
      description: "A concise 1-3 sentence summary explaining the visual and textual findings",
    },
    extractedText: {
      type: Type.STRING,
      description: "Key text extracted via OCR from the screenshot. If no text or unreadable, state clearly.",
    },
    visualAnalysis: {
      type: Type.ARRAY,
      description: "Specific visual and structural findings that actually apply to this screenshot (e.g. Text Detected, Suspicious URL, Brand Impersonation, Fake Login Form, Payment Request, Urgency Language)",
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: "Category name (e.g., 'Text Detected', 'Suspicious URL', 'Brand Impersonation', 'Fake Login Form', 'Payment Request', 'Urgency Language', 'Credential Request', 'Visual Phishing')",
          },
          description: {
            type: Type.STRING,
            description: "Specific visual evidence and finding observed in the screenshot",
          },
        },
        required: ["category", "description"],
      },
    },
    indicators: {
      type: Type.ARRAY,
      description: "List of detected scam indicators. Empty array if the image is SAFE.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "Short name of the indicator (e.g., Credential Theft, Artificial Urgency, Brand Impersonation, Advance Fee Demand, Threat / Coercion)",
          },
          severity: {
            type: Type.STRING,
            description: "Severity of this indicator: LOW, MEDIUM, or HIGH",
          },
          evidence: {
            type: Type.STRING,
            description: "Direct verbatim quote or specific visual element observed directly in the screenshot. Never invent evidence.",
          },
          explanation: {
            type: Type.STRING,
            description: "Clear explanation of why this poses a security or fraud risk",
          },
        },
        required: ["name", "severity", "evidence", "explanation"],
      },
    },
    recommendation: {
      type: Type.STRING,
      description: "Clear, actionable advice telling the user exactly what to do next to protect themselves",
    },
  },
  required: [
    "classification",
    "riskScore",
    "confidence",
    "summary",
    "extractedText",
    "visualAnalysis",
    "indicators",
    "recommendation",
  ],
};

const SCREENSHOT_SYSTEM_INSTRUCTION = `You are ScamLens AI, a specialized multimodal threat intelligence engine.
Your task is to analyze user-uploaded screenshots of suspected scams, phishing emails, SMS texts, fake login portals, social media messages, payment demands, or deceptive interfaces.

Thoroughly evaluate:
1. Visible message content and typography (OCR text)
2. URLs and domain names (look for typosquatting, suspicious TLDs, misleading subdomains)
3. Brand impersonation (unauthorized logos or styling mimicking banks, PayPal, Google, Microsoft, Apple, courier delivery, government or tax authorities)
4. Urgency (countdown timers, "account will be terminated within 24h", "immediate action required")
5. Threats and intimidation (account suspension, legal action, arrest, financial penalties)
6. Credential harvesting (fields asking for passwords, usernames, PINs, OTPs, verification codes)
7. OTP / 2FA verification code requests
8. Payment requests, fake invoices, wire transfer/crypto demands
9. Advance-fee requests (e.g. paying registration fees to secure high-paying jobs)
10. Fake offers (lottery/prize winnings, unrealistic work-from-home salaries, crypto giveaways)
11. Suspicious buttons and deceptive CTA links
12. Suspicious login forms or spoofed authentication dialogs
13. Social engineering and emotional manipulation
14. Visual phishing indicators (misaligned logos, low-resolution icons, fake security badges)

CRITICAL GROUNDING RULES:
1. Read visible text carefully. If text is clearly readable, extract relevant text into extractedText and quote exact phrases in the evidence field.
2. If important text is blurry, occluded, or unreadable, do NOT guess or fabricate it. State that the text could not be reliably read.
3. If the screenshot is a routine, benign conversation (e.g., normal chat between friends, family, or colleagues), receipts, or standard non-fraudulent app view, classify as "SAFE" with riskScore between 0 and 15, empty indicators array, and visualAnalysis describing the benign nature. Do NOT invent scams where none exist.
4. Screenshots demanding passwords, OTPs, or threatening immediate account suspension/blocking MUST be classified as "SCAM" with high riskScore (80-100) and HIGH severity indicators.
5. Every indicator and visual analysis finding must be supported strictly by what is actually visible in the image. Never invent URLs, brands, or text that cannot be seen.
6. Return ONLY valid JSON adhering strictly to the defined schema.`;

const SYSTEM_INSTRUCTION = `You are ScamLens AI, a specialized threat intelligence and scam detection engine.
Your task is to analyze user-submitted emails, SMS text messages, WhatsApp/chat messages, or suspicious correspondence.

Evaluate the message rigorously for:
- Urgency and artificial time pressure (e.g. "within 24 hours", "act immediately", "urgent action required")
- Threats and coercion (e.g. account suspension, arrest, law enforcement, permanent ban)
- Credential harvesting (e.g. requests for passwords, usernames, login credentials, PINs)
- One-Time Password (OTP) or 2FA verification code requests
- Financial demands and upfront registration fees (e.g. advance-fee job scams, fake training fees)
- Fake refunds, lottery/prize claims, unexpected inheritance or crypto winnings
- Job scams (work-from-home offers with unrealistic high pay like ₹80,000/month requiring upfront fees)
- Investment / crypto schemes with guaranteed high returns
- Brand impersonation (mimicking banks, delivery services, government agencies, tech companies)
- Deceptive links or URLs with typosquatting / shortened domains
- Social engineering, requests for secrecy ("do not tell anyone"), and unusual instructions
- Emotional manipulation or guilt-tripping

CRITICAL RULES:
1. Normal, benign communications (e.g. "Hey, are we still meeting at 5 PM today?") MUST be classified as "SAFE", with riskScore between 0 and 15, and an empty or minimal indicators list. Do NOT invent scams where none exist.
2. Messages requesting credentials, OTPs, or threatening account blocks are critical threats and MUST be classified as "SCAM" with high riskScore (75 to 100) and HIGH severity indicators.
3. Advance-fee scams (e.g. job offers requiring registration payments) MUST be classified as "SCAM" with high riskScore and relevant indicators (e.g. "Advance Fee Demand", "Unrealistic Job Offer").
4. Every detected indicator MUST cite direct evidence quoted from the actual submitted text. Never extrapolate or invent quotes.
5. Return ONLY valid JSON adhering strictly to the defined schema.`;

// POST /api/analyze-message
app.post("/api/analyze-message", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please provide an email or message text to analyze.",
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 25000) {
      return res.status(400).json({
        error: "Submitted text is too long. Please limit to 25,000 characters.",
      });
    }

    let ai: GoogleGenAI;
    try {
      ai = getGenAI();
    } catch {
      return res.status(500).json({
        error: "ScamLens AI engine is not configured with an API key. Please check your system settings.",
      });
    }

    // Attempt generation with automatic retries and model fallbacks for high availability
    const candidateModels = ["gemini-flash-lite-latest", "gemini-3-flash-preview", "gemini-3.8-flash"];
    let responseText: string | null = null;
    let lastError: unknown = null;

    for (const modelName of candidateModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `Analyze this submitted message for potential scams, phishing, or threats:\n\n"""\n${trimmedMessage}\n"""`,
                  },
                ],
              },
            ],
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: "application/json",
              responseSchema: scamAnalysisSchema,
            },
          });

          if (response.text) {
            responseText = response.text;
            break;
          }
        } catch (err: unknown) {
          lastError = err;
          const errStr = String(err);
          const isTransient = errStr.includes("503") || errStr.includes("UNAVAILABLE") || errStr.includes("high demand");
          if (isTransient && attempt === 1) {
            // Wait 600ms before second attempt
            await new Promise((resolve) => setTimeout(resolve, 600));
            continue;
          }
          // If not transient or second attempt failed, break to next model candidate
          break;
        }
      }

      if (responseText) {
        break;
      }
    }

    if (!responseText) {
      throw lastError || new Error("No response generated from AI engine.");
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText.trim());
    } catch {
      throw new Error("Failed to parse threat assessment from AI engine.");
    }

    // Sanitize and normalize fields
    const validClassifications = ["SAFE", "SUSPICIOUS", "SCAM"];
    let classification = String(parsedResult.classification || "").toUpperCase();
    if (!validClassifications.includes(classification)) {
      classification = "SUSPICIOUS";
    }

    const riskScore = Math.max(0, Math.min(100, Math.round(Number(parsedResult.riskScore) || 0)));
    const confidence = Math.max(0, Math.min(100, Math.round(Number(parsedResult.confidence) || 85)));

    const sanitizedIndicators = Array.isArray(parsedResult.indicators)
      ? parsedResult.indicators.map((ind: Record<string, unknown>) => ({
          name: String(ind.name || "Suspicious Indicator").trim(),
          severity: ["LOW", "MEDIUM", "HIGH"].includes(String(ind.severity).toUpperCase())
            ? String(ind.severity).toUpperCase()
            : "MEDIUM",
          evidence: String(ind.evidence || "").trim(),
          explanation: String(ind.explanation || "").trim(),
        }))
      : [];

    const finalResult = {
      classification,
      riskScore,
      confidence,
      summary: String(parsedResult.summary || "Analysis completed successfully."),
      indicators: sanitizedIndicators,
      recommendation: String(parsedResult.recommendation || "Verify through official channels before proceeding."),
      submittedText: trimmedMessage,
      analyzedAt: new Date().toISOString(),
    };

    return res.json(finalResult);
  } catch (err: unknown) {
    console.error("Scam analysis error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown analysis failure";

    // Handle rate limit or quota errors gracefully
    if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("quota")) {
      return res.status(429).json({
        error: "AI analysis rate limit reached. Please wait a moment and try again.",
      });
    }

    return res.status(500).json({
      error: "An error occurred while analyzing the message. Please try again.",
    });
  }
});

// POST /api/analyze-screenshot
app.post("/api/analyze-screenshot", async (req, res) => {
  try {
    const { imageBase64, mimeType, filename, fileSize } = req.body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({
        error: "No screenshot data provided. Please upload an image.",
      });
    }

    // Supported MIME types: PNG, JPG, JPEG, WEBP
    const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const rawMime = (mimeType || "").toLowerCase().trim();
    if (!rawMime || !allowedMimeTypes.includes(rawMime)) {
      return res.status(400).json({
        error: "Unsupported file format. Please upload a PNG, JPG, JPEG, or WEBP image.",
      });
    }

    const normalizedMimeType = rawMime === "image/jpg" ? "image/jpeg" : rawMime;

    // Strip Data URL scheme if passed by FileReader
    const base64Data = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "").trim();

    if (!base64Data) {
      return res.status(400).json({
        error: "Corrupted image payload. Please re-select the screenshot.",
      });
    }

    // Validate size (max 10 MB = 10 * 1024 * 1024 bytes)
    const byteLength = Buffer.byteLength(base64Data, "base64");
    if (byteLength > 10 * 1024 * 1024) {
      return res.status(400).json({
        error: "The uploaded file exceeds the 10 MB size limit. Please upload a smaller image.",
      });
    }

    let ai: GoogleGenAI;
    try {
      ai = getGenAI();
    } catch {
      return res.status(500).json({
        error: "ScamLens AI engine is not configured with an API key. Please check your system settings.",
      });
    }

    // Multi-model fallbacks for high availability
    const candidateModels = ["gemini-flash-lite-latest", "gemini-3-flash-preview", "gemini-3.8-flash"];
    let responseText: string | null = null;
    let lastError: unknown = null;

    for (const modelName of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType: normalizedMimeType,
                      data: base64Data,
                    },
                  },
                  {
                    text: "Analyze this uploaded screenshot carefully for potential scams, phishing, brand spoofing, fake login portals, or credential theft. Follow your system instructions strictly.",
                  },
                ],
              },
            ],
            config: {
              systemInstruction: SCREENSHOT_SYSTEM_INSTRUCTION,
              responseMimeType: "application/json",
              responseSchema: screenshotAnalysisSchema,
              temperature: 0.1,
            },
          });

          if (response.text && response.text.trim()) {
            responseText = response.text;
            break;
          }
        } catch (callError: unknown) {
          lastError = callError;
          const status = (callError as { status?: number })?.status;
          if (status === 503 || status === 429) {
            await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
            continue;
          }
          break;
        }
      }

      if (responseText) {
        break;
      }
    }

    if (!responseText) {
      throw lastError || new Error("No response generated from AI vision engine.");
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText.trim());
    } catch {
      throw new Error("Failed to parse visual threat assessment from AI engine.");
    }

    // Sanitize and normalize fields
    const validClassifications = ["SAFE", "SUSPICIOUS", "SCAM"];
    let classification = String(parsedResult.classification || "").toUpperCase();
    if (!validClassifications.includes(classification)) {
      classification = "SUSPICIOUS";
    }

    const riskScore = Math.max(0, Math.min(100, Math.round(Number(parsedResult.riskScore) || 0)));
    const confidence = Math.max(0, Math.min(100, Math.round(Number(parsedResult.confidence) || 85)));

    const sanitizedIndicators = Array.isArray(parsedResult.indicators)
      ? parsedResult.indicators.map((ind: Record<string, unknown>) => ({
          name: String(ind.name || "Suspicious Indicator").trim(),
          severity: ["LOW", "MEDIUM", "HIGH"].includes(String(ind.severity).toUpperCase())
            ? String(ind.severity).toUpperCase()
            : "MEDIUM",
          evidence: String(ind.evidence || "").trim(),
          explanation: String(ind.explanation || "").trim(),
        }))
      : [];

    const sanitizedVisualAnalysis = Array.isArray(parsedResult.visualAnalysis)
      ? parsedResult.visualAnalysis.map((item: Record<string, unknown>) => ({
          category: String(item.category || "Visual Observation").trim(),
          description: String(item.description || "").trim(),
        })).filter((item: { category: string; description: string }) => item.description.length > 0)
      : [];

    const formattedFileSize = typeof fileSize === "string" && fileSize.trim()
      ? fileSize.trim()
      : `${(byteLength / (1024 * 1024)).toFixed(2)} MB`;

    const finalResult = {
      classification,
      riskScore,
      confidence,
      summary: String(parsedResult.summary || "Visual analysis completed successfully."),
      extractedText: String(parsedResult.extractedText || "").trim(),
      visualAnalysis: sanitizedVisualAnalysis,
      indicators: sanitizedIndicators,
      recommendation: String(parsedResult.recommendation || "Verify through official channels before proceeding."),
      imageMeta: {
        filename: typeof filename === "string" && filename.trim() ? filename.trim().slice(0, 100) : "screenshot.png",
        fileSize: formattedFileSize,
        mimeType: normalizedMimeType,
      },
      analyzedAt: new Date().toISOString(),
    };

    return res.json(finalResult);
  } catch (err: unknown) {
    console.error("Screenshot analysis error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown analysis failure";

    if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("quota")) {
      return res.status(429).json({
        error: "AI analysis rate limit reached. Please wait a moment and try again.",
      });
    }

    if (errorMessage.includes("503") || errorMessage.toLowerCase().includes("high demand")) {
      return res.status(503).json({
        error: "AI vision service is currently experiencing high demand. Please try again in a few seconds.",
      });
    }

    return res.status(500).json({
      error: "An error occurred while analyzing the screenshot. Please try again.",
    });
  }
});

// Custom SSRF Error for identifying forbidden destinations
class SSRFError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SSRFError";
  }
}

// IP Filtering: Blocks private, loopback, link-local, carrier-grade NAT, multicast, reserved ranges
function isPrivateOrLocalIp(ip: string): boolean {
  if (!ip) return true;

  if (ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }

  // IPv4 validation
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map((x) => parseInt(x, 10));
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return true;
    }
    const [a, b, c] = parts;
    // 0.0.0.0/8 - Current network
    if (a === 0) return true;
    // 10.0.0.0/8 - Private
    if (a === 10) return true;
    // 100.64.0.0/10 - Carrier-grade NAT
    if (a === 100 && b >= 64 && b <= 127) return true;
    // 127.0.0.0/8 - Loopback
    if (a === 127) return true;
    // 169.254.0.0/16 - Link-local / Cloud Metadata (169.254.169.254)
    if (a === 169 && b === 254) return true;
    // 172.16.0.0/12 - Private (172.16.0.0 - 172.31.255.255)
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.0.0.0/24 - IETF Protocol
    if (a === 192 && b === 0 && c === 0) return true;
    // 192.0.2.0/24 - TEST-NET-1
    if (a === 192 && b === 0 && c === 2) return true;
    // 192.168.0.0/16 - Private
    if (a === 192 && b === 168) return true;
    // 198.18.0.0/15 - Benchmarking
    if (a === 198 && (b === 18 || b === 19)) return true;
    // 198.51.100.0/24 - TEST-NET-2
    if (a === 198 && b === 51 && c === 100) return true;
    // 203.0.113.0/24 - TEST-NET-3
    if (a === 203 && b === 0 && c === 113) return true;
    // 224.0.0.0/4 - Multicast
    if (a >= 224 && a <= 239) return true;
    // 240.0.0.0/4 - Reserved
    if (a >= 240) return true;
    // 255.255.255.255 - Broadcast
    if (ip === "255.255.255.255") return true;

    return false;
  }

  // IPv6 validation
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    // Loopback ::1
    if (lower === "::1" || lower === "0:0:0:0:0:0:0:1") return true;
    // Unspecified ::
    if (lower === "::" || lower === "0:0:0:0:0:0:0:0") return true;
    // Unique Local fc00::/7
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    // Link-local fe80::/10
    if (/^fe[89ab]/.test(lower)) return true;
    // IPv4-mapped IPv6
    if (lower.startsWith("::ffff:")) {
      return isPrivateOrLocalIp(lower.substring(7));
    }
    return false;
  }

  return true;
}

// Hostname-level SSRF defense
function validateHostnameSecurity(hostname: string): void {
  const lower = hostname.toLowerCase().trim();
  const normalized = lower.endsWith(".") ? lower.slice(0, -1) : lower;

  if (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized === "local" ||
    normalized.endsWith(".local") ||
    normalized === "internal" ||
    normalized.endsWith(".internal") ||
    normalized === "metadata.google.internal" ||
    normalized === "metadata" ||
    normalized === "instance-data" ||
    normalized.endsWith(".onion")
  ) {
    throw new SSRFError("Target destination is restricted. Scanning private, internal, or loopback network addresses is prohibited.");
  }

  if (net.isIP(normalized)) {
    if (isPrivateOrLocalIp(normalized)) {
      throw new SSRFError("Target destination is restricted. Scanning private, internal, or loopback network addresses is prohibited.");
    }
  }
}

// Check for syntactically valid public registrable hostname
function isValidPublicHostname(hostname: string): boolean {
  if (!hostname || hostname.length < 3 || hostname.length > 253) {
    return false;
  }

  // If it's an IP address, let SSRF check handle it (already passed validateHostnameSecurity)
  if (net.isIP(hostname)) {
    return true;
  }

  const labels = hostname.split(".");
  // Must have at least two labels: registrable domain and valid public TLD (e.g. example.com)
  if (labels.length < 2) {
    return false;
  }

  const labelRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
  for (const label of labels) {
    if (!label || label.length > 63 || !labelRegex.test(label)) {
      return false;
    }
  }

  // Top level domain must be alphabetical or punycode, >= 2 characters
  const tld = labels[labels.length - 1];
  const tldRegex = /^([a-zA-Z]{2,63}|xn--[a-zA-Z0-9-]{2,59})$/;
  if (!tldRegex.test(tld)) {
    return false;
  }

  return true;
}

// Validate and normalize user URL
function validateAndNormalizeUrl(rawInput: string): URL {
  if (!rawInput || typeof rawInput !== "string" || !rawInput.trim()) {
    throw new Error("Enter a complete website URL beginning with http:// or https://.");
  }

  const cleaned = rawInput.trim();

  // 1. Require explicit http:// or https:// protocol (reject bare strings like 'not-a-url', 'hello', 'bank-login', 'example')
  if (!/^https?:\/\//i.test(cleaned)) {
    throw new Error("Enter a complete website URL beginning with http:// or https://.");
  }

  // 2. Parse using standard URL parser
  let parsed: URL;
  try {
    parsed = new URL(cleaned);
  } catch {
    throw new Error("Enter a complete website URL beginning with http:// or https://.");
  }

  // 3. Reject unsupported protocols (javascript:, data:, file:, ftp:, etc.)
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Enter a complete website URL beginning with http:// or https://.");
  }

  // 4. Require syntactically valid hostname
  const hostname = parsed.hostname.toLowerCase();
  if (!hostname) {
    throw new Error("Enter a complete website URL beginning with http:// or https://.");
  }

  // 5. Hostname-level SSRF defense (checks localhost, loopback, private ranges, metadata, .internal)
  validateHostnameSecurity(hostname);

  // 6. Require valid registrable/public hostname for the public scanner
  if (!isValidPublicHostname(hostname)) {
    throw new Error("Enter a complete website URL beginning with http:// or https://.");
  }

  return parsed;
}

// DNS lookup with SSRF check on resolved IPs
async function verifyDnsAndResolve(hostname: string): Promise<dns.LookupAddress[]> {
  validateHostnameSecurity(hostname);

  if (net.isIP(hostname)) {
    if (isPrivateOrLocalIp(hostname)) {
      throw new SSRFError("Target destination is restricted. Scanning private or local IP addresses is prohibited.");
    }
    return [{ address: hostname, family: net.isIPv4(hostname) ? 4 : 6 }];
  }

  const addresses = await dns.promises.lookup(hostname, { all: true });
  if (!addresses || addresses.length === 0) {
    throw new Error(`Domain '${hostname}' could not be resolved (DNS lookup returned no addresses).`);
  }

  for (const addr of addresses) {
    if (isPrivateOrLocalIp(addr.address)) {
      throw new SSRFError("Target destination resolves to a private, internal, or loopback network address.");
    }
  }

  return addresses;
}

// Deterministic URL Signal Extraction
interface ExtractedUrlSignals {
  hostname: string;
  protocol: string;
  port: string;
  path: string;
  query: string;
  hostnameLength: number;
  subdomainCount: number;
  labels: string[];
  signals: string[];
}

function extractUrlSignals(url: URL): ExtractedUrlSignals {
  const signals: string[] = [];
  const hostname = url.hostname.toLowerCase();
  const protocol = url.protocol.replace(":", "");
  const port = url.port || (protocol === "https" ? "443" : "80");
  const path = url.pathname;
  const query = url.search;

  // Protocol check
  if (protocol === "http") {
    signals.push("Unencrypted HTTP protocol (data sent in cleartext without SSL/TLS encryption)");
  } else {
    signals.push("Encrypted HTTPS protocol");
  }

  // Non-standard port check
  if (url.port && url.port !== "80" && url.port !== "443") {
    signals.push(`Unusual non-standard web port detected (:${url.port})`);
  }

  // Raw IP hostname check
  if (net.isIP(hostname)) {
    signals.push("Hostname uses a raw IP address instead of a registered domain name (common in evasion/phishing)");
  }

  // Punycode / IDN check
  if (hostname.includes("xn--")) {
    signals.push("Internationalized Domain Name / Punycode detected ('xn--' prefix: possible homograph character spoofing)");
  }

  // Hostname length
  if (hostname.length > 35) {
    signals.push(`Abnormally long domain name length (${hostname.length} characters)`);
  }

  // Subdomain analysis
  const labels = hostname.split(".");
  const subdomainCount = Math.max(0, labels.length - 2);
  if (subdomainCount >= 2) {
    signals.push(`Multiple subdomain layers (${subdomainCount} subdomains: '${labels.slice(0, -2).join(".")}')`);
  }

  // Excessive hyphens
  const hyphenCount = (hostname.match(/-/g) || []).length;
  if (hyphenCount >= 2) {
    signals.push(`Multiple hyphens in domain name (${hyphenCount} hyphens: often used in domain typosquatting)`);
  }

  // Suspicious encoding or credentials
  if (url.username || url.password) {
    signals.push("Embedded username/password in URL structure (classic trick to disguise malicious destination)");
  }
  if (url.href.includes("@")) {
    signals.push("URL contains '@' character which can mask the true host in certain clients");
  }
  if (/%[0-9a-fA-F]{2}/.test(url.href)) {
    signals.push("Hexadecimal URL encoding (%XX) present in the address");
  }

  // High-risk phishing keywords in hostname or path
  const suspiciousKeywords = [
    "login", "signin", "sign-in", "log-in", "verify", "verification",
    "secure", "security", "update", "banking", "bank", "account",
    "billing", "support", "confirm", "confirmation", "authenticate",
    "auth", "password", "credential", "wallet", "recover", "recovery",
    "appleid", "paypal", "microsoft", "office365", "netflix", "chase",
    "wellsfargo", "suspension", "suspended", "unauthorized", "urgent",
    "alert", "resolve", "passcode", "otp", "token"
  ];

  const fullUrlLower = url.href.toLowerCase();
  const matchedKeywords: string[] = [];
  for (const kw of suspiciousKeywords) {
    const regex = new RegExp(`(^|[-._/?=&])${kw}([-._/?=&]|$)`, "i");
    if (regex.test(fullUrlLower) || hostname.includes(kw) || path.includes(kw)) {
      if (!matchedKeywords.includes(kw)) {
        matchedKeywords.push(kw);
      }
    }
  }

  if (matchedKeywords.length > 0) {
    signals.push(`Security/banking/credential keywords in URL: [${matchedKeywords.slice(0, 6).join(", ")}]`);
  }

  // Suspicious / high-abuse TLDs
  const suspiciousTlds = [
    "top", "xyz", "tk", "ml", "ga", "cf", "gq", "buzz", "work", "click",
    "monster", "fit", "surf", "live", "cam", "country", "stream", "icu",
    "rest", "bar", "lat", "men", "bid", "racing", "review", "loan"
  ];
  const tld = labels[labels.length - 1];
  if (suspiciousTlds.includes(tld)) {
    signals.push(`Domain uses high-abuse / low-reputation top-level domain (.${tld})`);
  }

  return {
    hostname,
    protocol,
    port,
    path,
    query,
    hostnameLength: hostname.length,
    subdomainCount,
    labels,
    signals,
  };
}

// Safe HTTP Inspection
interface HttpInspectionResult {
  statusCode: number | null;
  finalUrl: string;
  redirectCount: number;
  redirectChain: string[];
  contentType?: string;
  pageTitle?: string;
  serverHeader?: string;
  hasHsts: boolean;
  reachabilityError?: string;
}

async function inspectHttpMetadata(initialUrl: URL): Promise<HttpInspectionResult> {
  let currentUrl = initialUrl;
  let redirectCount = 0;
  const redirectChain: string[] = [initialUrl.href];
  const maxRedirects = 3;

  while (redirectCount <= maxRedirects) {
    try {
      await verifyDnsAndResolve(currentUrl.hostname);
    } catch (err: unknown) {
      if (err instanceof SSRFError) {
        throw err;
      }
      return {
        statusCode: null,
        finalUrl: currentUrl.href,
        redirectCount,
        redirectChain,
        hasHsts: false,
        reachabilityError: err instanceof Error ? err.message : "Host DNS lookup failed",
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(currentUrl.href, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ScamLens/1.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        redirect: "manual",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle redirects (301, 302, 303, 307, 308)
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location || redirectCount >= maxRedirects) {
          return {
            statusCode: response.status,
            finalUrl: currentUrl.href,
            redirectCount,
            redirectChain,
            hasHsts: !!response.headers.get("strict-transport-security"),
          };
        }

        let nextUrl: URL;
        try {
          nextUrl = new URL(location, currentUrl);
        } catch {
          return {
            statusCode: response.status,
            finalUrl: currentUrl.href,
            redirectCount,
            redirectChain,
            hasHsts: false,
            reachabilityError: "Invalid redirect Location header received",
          };
        }

        if (nextUrl.protocol !== "http:" && nextUrl.protocol !== "https:") {
          throw new SSRFError(`Redirected to unsupported protocol: ${nextUrl.protocol}`);
        }

        validateHostnameSecurity(nextUrl.hostname);

        currentUrl = nextUrl;
        redirectCount++;
        redirectChain.push(currentUrl.href);
        continue;
      }

      // Reached final page
      const contentType = response.headers.get("content-type") || undefined;
      const serverHeader = response.headers.get("server") || undefined;
      const hasHsts = !!response.headers.get("strict-transport-security");
      let pageTitle: string | undefined = undefined;

      if (contentType && (contentType.includes("text/html") || contentType.includes("application/xhtml+xml"))) {
        try {
          const reader = response.body?.getReader();
          if (reader) {
            let receivedBytes = 0;
            const chunks: Uint8Array[] = [];
            const maxBytes = 65536; // 64KB limit

            while (receivedBytes < maxBytes) {
              const { done, value } = await reader.read();
              if (done || !value) break;
              chunks.push(value);
              receivedBytes += value.length;
            }
            reader.cancel().catch(() => {});

            const decoder = new TextDecoder("utf-8", { fatal: false, ignoreBOM: true });
            let combined = "";
            for (const chunk of chunks) {
              combined += decoder.decode(chunk, { stream: true });
            }
            combined += decoder.decode();

            const titleMatch = combined.match(/<title[^>]*>([^<]{1,200})<\/title>/i);
            if (titleMatch && titleMatch[1]) {
              pageTitle = titleMatch[1].replace(/\s+/g, " ").trim();
            }
          }
        } catch {
          // Ignore stream cancel error
        }
      }

      return {
        statusCode: response.status,
        finalUrl: currentUrl.href,
        redirectCount,
        redirectChain,
        contentType,
        pageTitle,
        serverHeader,
        hasHsts,
      };
    } catch (err: unknown) {
      if (err instanceof SSRFError) {
        throw err;
      }
      return {
        statusCode: null,
        finalUrl: currentUrl.href,
        redirectCount,
        redirectChain,
        hasHsts: false,
        reachabilityError: err instanceof Error ? err.message : "Connection failed or timed out",
      };
    }
  }

  return {
    statusCode: null,
    finalUrl: currentUrl.href,
    redirectCount,
    redirectChain,
    hasHsts: false,
    reachabilityError: "Exceeded maximum redirect limit (3 redirects)",
  };
}

// URL Scam Analysis Schema for Gemini
const urlAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    classification: {
      type: Type.STRING,
      description: "Must be exactly SAFE, SUSPICIOUS, or SCAM",
    },
    riskScore: {
      type: Type.INTEGER,
      description: "An integer between 0 and 100 indicating the scam risk likelihood",
    },
    confidence: {
      type: Type.INTEGER,
      description: "An integer between 0 and 100 indicating model confidence in this assessment",
    },
    summary: {
      type: Type.STRING,
      description: "A concise 1-3 sentence summary explaining the URL risk assessment and findings",
    },
    indicators: {
      type: Type.ARRAY,
      description: "List of detected scam/phishing indicators from URL structure or metadata. Empty array if completely SAFE.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "Short name of indicator (e.g., Suspicious Subdomain Structure, Brand Spoofing Keywords, Unencrypted Cleartext Protocol, High-Abuse TLD)",
          },
          severity: {
            type: Type.STRING,
            description: "Must be LOW, MEDIUM, or HIGH",
          },
          evidence: {
            type: Type.STRING,
            description: "Direct evidence observed in the URL or HTTP metadata",
          },
          explanation: {
            type: Type.STRING,
            description: "Clear explanation of why this poses a security risk or why attackers use it",
          },
        },
        required: ["name", "severity", "evidence", "explanation"],
      },
    },
    recommendation: {
      type: Type.STRING,
      description: "Clear, practical next steps for the user reflecting the analysis (e.g. 'Do not enter credentials until you independently verify the domain', or 'No strong scam indicators were detected from the available URL signals, but this does not guarantee that the website is safe.')",
    },
    urlIntelligence: {
      type: Type.OBJECT,
      properties: {
        hostname: {
          type: Type.STRING,
          description: "Apex or registered domain/hostname",
        },
        protocol: {
          type: Type.STRING,
          description: "HTTP or HTTPS",
        },
        finalUrl: {
          type: Type.STRING,
          description: "Final destination URL after redirects",
        },
        redirectCount: {
          type: Type.INTEGER,
          description: "Number of observed HTTP redirects",
        },
        signals: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of deterministic and observable signals synthesized from the inspection",
        },
      },
      required: ["hostname", "protocol", "finalUrl", "redirectCount", "signals"],
    },
  },
  required: [
    "classification",
    "riskScore",
    "confidence",
    "summary",
    "indicators",
    "recommendation",
    "urlIntelligence",
  ],
};

const URL_SYSTEM_INSTRUCTION = `You are ScamLens AI, a specialized threat intelligence engine evaluating website URLs for phishing, spoofing, fraud, and cyber security risks.

Your task is to analyze the extracted URL intelligence, deterministic signals, and safe HTTP inspection metadata to evaluate whether the target link is SAFE, SUSPICIOUS, or SCAM.

IMPORTANT AI BEHAVIOR & GUIDELINES:
1. Reason carefully over the provided signals rather than blindly classifying.
2. Calibrated Language:
   - Do NOT say "This website is definitely malicious" unless there is overwhelmingly conclusive proof.
   - Use nuanced, professional risk language such as: "Low risk", "Suspicious", "High risk", "Strong phishing indicators detected", or "No strong scam indicators detected from the available URL signals".
   - A URL scanner provides a risk assessment, not absolute proof.
3. Benign & Trusted Domains:
   - Well-known legitimate domains (e.g., example.com, google.com, wikipedia.org, github.com, microsoft.com, apple.com) must be classified as "SAFE", with riskScore between 0 and 10, confidence 90-99, and empty indicators array.
   - Standard personal, corporate, or open source websites with clean domains should be classified as "SAFE" or "SUSPICIOUS" only if actual anomalies exist.
4. Deceptive / Phishing Patterns:
   - Brand impersonation in subdomains (e.g. secure-bank-login.example.com, chase-online-verify.xyz): Attackers frequently place trusted brand names in subdomains or hyphens to deceive victims about the true apex domain. Classify as "SUSPICIOUS" or "SCAM" with elevated riskScore (65-95).
   - High-risk credential harvesting keywords (e.g. login, verify, account, wallet) coupled with unencrypted HTTP or suspicious TLDs: High risk.
   - Punycode / Homograph domain tricks (xn--): High risk.
   - Raw IP addresses used for authentication pages: Elevated risk.
5. Missing DNS or Offline Domains:
   - If a test domain cannot be resolved via public DNS (such as secure-bank-login.example.com), analyze its URL structure and keyword patterns. Explain that while the host is currently unreachable, the URL naming structure exhibits classic phishing/typosquatting characteristics.
6. Evidence & Explanations:
   - Every indicator must specify concrete evidence observed from the URL or HTTP metadata (e.g. the specific subdomain, keyword, protocol, or port).
   - Provide an explanation of why that signal is a risk factor.
7. Return strictly valid JSON matching the schema.`;

// Website URL Scam Analysis API Endpoint
app.post("/api/analyze-url", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({
        error: "Please provide a valid website URL to scan.",
      });
    }

    // Step 1: Validate & normalize URL with initial SSRF check
    let parsedUrl: URL;
    try {
      parsedUrl = validateAndNormalizeUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid website URL.";
      return res.status(400).json({ error: msg });
    }

    // Step 2: Extract deterministic URL signals
    const urlSignals = extractUrlSignals(parsedUrl);

    // Step 3: Safe HTTP inspection with SSRF defense
    let httpResult: HttpInspectionResult;
    try {
      httpResult = await inspectHttpMetadata(parsedUrl);
    } catch (err: unknown) {
      if (err instanceof SSRFError) {
        return res.status(400).json({ error: err.message });
      }
      httpResult = {
        statusCode: null,
        finalUrl: parsedUrl.href,
        redirectCount: 0,
        redirectChain: [parsedUrl.href],
        hasHsts: false,
        reachabilityError: err instanceof Error ? err.message : "HTTP inspection failed",
      };
    }

    // Enrich signals with HTTP metadata
    const allSignals = [...urlSignals.signals];
    if (httpResult.statusCode !== null) {
      allSignals.push(`HTTP response status: ${httpResult.statusCode}`);
      if (httpResult.pageTitle) {
        allSignals.push(`Page title: "${httpResult.pageTitle}"`);
      }
      if (httpResult.hasHsts) {
        allSignals.push("Strict-Transport-Security (HSTS) header active");
      }
    } else if (httpResult.reachabilityError) {
      allSignals.push(`HTTP inspection note: ${httpResult.reachabilityError}`);
    }

    if (httpResult.redirectCount > 0) {
      allSignals.push(`Observed ${httpResult.redirectCount} redirect(s) leading to: ${httpResult.finalUrl}`);
    }

    // Step 4: Gemini Analysis
    let ai: GoogleGenAI;
    try {
      ai = getGenAI();
    } catch {
      return res.status(500).json({
        error: "ScamLens AI engine is not configured with an API key. Please check your system settings.",
      });
    }

    const inspectionSummary = {
      submittedUrl: url,
      normalizedUrl: parsedUrl.href,
      hostname: parsedUrl.hostname,
      protocol: parsedUrl.protocol.replace(":", ""),
      port: parsedUrl.port || (parsedUrl.protocol === "https:" ? "443" : "80"),
      path: parsedUrl.pathname,
      query: parsedUrl.search,
      subdomainCount: urlSignals.subdomainCount,
      hostnameLength: urlSignals.hostnameLength,
      observedSignals: allSignals,
      httpStatus: httpResult.statusCode,
      pageTitle: httpResult.pageTitle || null,
      redirectCount: httpResult.redirectCount,
      finalDestinationUrl: httpResult.finalUrl,
      hstsEnabled: httpResult.hasHsts,
      reachability: httpResult.reachabilityError ? "Unreachable / DNS resolution issue" : "Reachable",
    };

    const promptText = `Perform a rigorous scam, phishing, and threat assessment on the following website URL and its collected technical signals:

URL INSPECTION DATA:
${JSON.stringify(inspectionSummary, null, 2)}

Evaluate the URL structure, domain reputation, and signals to determine whether this destination is SAFE, SUSPICIOUS, or SCAM. Reason carefully over the evidence.`;

    const candidateModels = ["gemini-flash-lite-latest", "gemini-3-flash-preview", "gemini-3.8-flash"];
    let responseText: string | null = null;
    let lastError: unknown = null;

    for (const modelName of candidateModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: "user",
                parts: [{ text: promptText }],
              },
            ],
            config: {
              systemInstruction: URL_SYSTEM_INSTRUCTION,
              responseMimeType: "application/json",
              responseSchema: urlAnalysisSchema,
            },
          });

          if (response.text) {
            responseText = response.text;
            break;
          }
        } catch (err: unknown) {
          lastError = err;
          const errStr = String(err);
          const isTransient = errStr.includes("503") || errStr.includes("UNAVAILABLE") || errStr.includes("high demand");
          if (isTransient && attempt === 1) {
            await new Promise((resolve) => setTimeout(resolve, 600));
            continue;
          }
          break;
        }
      }
      if (responseText) break;
    }

    if (!responseText) {
      throw lastError || new Error("No response generated from AI engine.");
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText.trim());
    } catch {
      throw new Error("Failed to parse threat assessment from AI engine.");
    }

    const validClassifications = ["SAFE", "SUSPICIOUS", "SCAM"];
    let classification = String(parsedResult.classification || "").toUpperCase();
    if (!validClassifications.includes(classification)) {
      classification = "SUSPICIOUS";
    }

    const riskScore = Math.max(0, Math.min(100, Math.round(Number(parsedResult.riskScore) || 0)));
    const confidence = Math.max(0, Math.min(100, Math.round(Number(parsedResult.confidence) || 85)));

    const sanitizedIndicators = Array.isArray(parsedResult.indicators)
      ? parsedResult.indicators.map((ind: Record<string, unknown>) => ({
          name: String(ind.name || "Suspicious URL Indicator").trim(),
          severity: ["LOW", "MEDIUM", "HIGH"].includes(String(ind.severity).toUpperCase())
            ? String(ind.severity).toUpperCase()
            : "MEDIUM",
          evidence: String(ind.evidence || "").trim(),
          explanation: String(ind.explanation || "").trim(),
        }))
      : [];

    // Resolve protocol from actual inspected destination or normalized URL
    let resolvedProtocol = parsedUrl.protocol.replace(":", "").toLowerCase();
    if (httpResult.finalUrl) {
      try {
        const finalUrlObj = new URL(httpResult.finalUrl);
        if (finalUrlObj.protocol === "https:" || finalUrlObj.protocol === "http:") {
          resolvedProtocol = finalUrlObj.protocol.replace(":", "").toLowerCase();
        }
      } catch {
        // Fallback to normalized entered protocol
      }
    }

    const finalResult = {
      classification,
      riskScore,
      confidence,
      summary: String(parsedResult.summary || "URL analysis completed successfully."),
      indicators: sanitizedIndicators,
      recommendation: String(parsedResult.recommendation || "Verify destination directly before providing sensitive details."),
      urlIntelligence: {
        hostname: parsedUrl.hostname,
        protocol: resolvedProtocol,
        finalUrl: httpResult.finalUrl,
        redirectCount: httpResult.redirectCount,
        statusCode: httpResult.statusCode || undefined,
        pageTitle: httpResult.pageTitle,
        signals: allSignals,
      },
      analyzedAt: new Date().toISOString(),
    };

    return res.json(finalResult);
  } catch (err: unknown) {
    console.error("URL analysis error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown analysis failure";

    if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("quota")) {
      return res.status(429).json({
        error: "AI analysis rate limit reached. Please wait a moment and try again.",
      });
    }

    if (errorMessage.includes("503") || errorMessage.toLowerCase().includes("high demand")) {
      return res.status(503).json({
        error: "AI service is currently experiencing high demand. Please try again in a few seconds.",
      });
    }

    return res.status(500).json({
      error: "An error occurred while analyzing the website URL. Please try again.",
    });
  }
});

// Vite Middleware & SPA Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ScamLens AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
