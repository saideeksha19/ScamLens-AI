# 🔍 ScamLens AI

### AI-Powered Scam Detection & Investigation Platform

**ScamLens AI** is an intelligent platform that analyzes suspicious messages and online content to identify potential scams, uncover the warning signs behind them, and explain the possible threat in a way that users can understand.

> **Don't just know that it's a scam. Understand why.**

---

## 🚨 The Problem

Online scams are becoming increasingly sophisticated.

Scammers use psychological manipulation, urgency, impersonation, fake offers, suspicious links, and convincing messages to trick users.

Most existing detection tools simply provide a result such as:

```text
❌ Scam
```

But users need more than a label.

They need to know:

* What makes the content suspicious?
* Which warning signs were detected?
* What is the scammer trying to achieve?
* How serious is the threat?
* What should the user do next?

**ScamLens AI transforms scam detection into an explainable investigation.**

---

## 💡 What ScamLens AI Does

A user can submit suspicious content and let ScamLens analyze it.

```text
                    USER INPUT
                        │
                        ▼
                ┌───────────────┐
                │  AI ANALYSIS  │
                └───────┬───────┘
                        │
             ┌──────────┼──────────┐
             ▼          ▼          ▼
          Language    Intent     Suspicious
          Analysis   Analysis      Signals
             │          │          │
             └──────────┼──────────┘
                        ▼
                 THREAT ASSESSMENT
                        │
             ┌──────────┼──────────┐
             ▼          ▼          ▼
        Risk Score    Evidence    Advice
             │          │          │
             └──────────┼──────────┘
                        ▼
                INVESTIGATION REPORT
```

---

# ✨ Key Features

## 🔎 AI Scam Analysis

Analyze suspicious content using Google's Gemini AI.

The system looks for patterns associated with common scam and social-engineering techniques.

---

## 🚩 Risk Signal Detection

ScamLens can identify suspicious indicators such as:

* Urgency and pressure
* Fear-based language
* Impersonation
* Suspicious requests
* Financial manipulation
* Credential requests
* Fake offers
* Social-engineering patterns
* Suspicious links or domains

---

## 📊 Threat Score

The analysis produces an easy-to-understand risk assessment.

Example:

```text
╔════════════════════════════╗
║       THREAT SCORE         ║
║                            ║
║          94 / 100          ║
║                            ║
║        🔴 HIGH RISK        ║
╚════════════════════════════╝
```

The score is accompanied by an explanation of the detected warning signs.

---

## 🧠 Explainable AI

Instead of returning only a classification, ScamLens explains **why** the content may be dangerous.

Example:

> 🚨 **Urgency Manipulation**

> The message creates time pressure by claiming that the user's account will be blocked immediately.

This allows users to learn how scams work rather than blindly trusting an AI prediction.

---

## 🕸️ Attack Path

ScamLens can represent the potential progression of a scam:

```text
Suspicious Message
        │
        ▼
Create Urgency
        │
        ▼
User Clicks Link
        │
        ▼
Fake Website
        │
        ▼
Credential Request
        │
        ▼
Potential Account Compromise
```

The goal is to help users understand the **potential intent behind the attack**.

---

## 🛡️ Safety Recommendations

After analyzing suspicious content, ScamLens provides practical next steps.

Examples:

* Do not click suspicious links
* Do not share passwords or OTPs
* Verify the sender independently
* Contact the organization through an official channel
* Avoid making payments based solely on the message
* Report suspicious content when appropriate

---

# 🎯 Example

### Suspicious Message

```text
URGENT!

Your account will be suspended today.

Verify your account immediately using the link below.
```

### ScamLens Analysis

```text
THREAT LEVEL
━━━━━━━━━━━━━━━━━━
HIGH RISK

Detected Signals

🚩 Urgency
🚩 Fear / pressure
🚩 Account impersonation
🚩 Verification request
🚩 Potential credential harvesting
```

### AI Explanation

The message attempts to create urgency and fear so that the recipient acts before independently verifying the request.

### Recommended Action

Do not use the provided link. Verify the account through the organization's official website or trusted communication channel.

---

# 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### AI

* Google Gemini API
* Generative AI
* Natural-language reasoning

### Development

* Node.js
* npm
* Git / GitHub

---

# 📂 Project Structure

```text
ScamLens-AI/
│
├── components/
├── services/
├── public/
├── src/
│
├── .env.local
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

> The exact structure may vary depending on the current implementation.

---

# 🚀 Run Locally

## Prerequisites

* Node.js
* npm
* Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/saideeksha19/ScamLens-AI.git

cd ScamLens-AI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Gemini API

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
```

**Never commit your API key to GitHub.**

### 4. Start the development server

```bash
npm run dev
```

Open the local URL shown in your terminal.

---

# 🔐 Environment Variables

Create `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key
```

For security, `.env.local` should be included in `.gitignore`.

Example:

```gitignore
.env.local
.env
node_modules/
dist/
```

---

# 🧪 How to Use

1. Open ScamLens AI.
2. Paste a suspicious message or piece of content.
3. Start the investigation.
4. Allow the AI to analyze the content.
5. Review the threat score.
6. Examine the detected warning signs.
7. Read the AI-generated explanation.
8. Follow the recommended safety actions.

---

# 🎯 Hackathon

ScamLens AI is being developed for the **AI Builders Hackathon 2026**.

### Hackathon Focus

The project demonstrates how AI can move beyond simple classification and provide:

* Real-world problem solving
* Explainable AI
* AI-powered investigation
* Human-centered design
* Practical safety recommendations

---

# 🗺️ Future Roadmap

### Phase 1 — Core Intelligence

* [x] AI-powered content analysis
* [x] Threat assessment
* [x] Explainable results
* [ ] Improved risk scoring

### Phase 2 — Advanced Detection

* [ ] URL intelligence
* [ ] Domain analysis
* [ ] Scam pattern database
* [ ] Similarity detection
* [ ] Multi-language scam detection

### Phase 3 — Proactive Protection

* [ ] Browser extension
* [ ] Real-time webpage analysis
* [ ] Email integration
* [ ] Mobile experience
* [ ] Community threat intelligence

---

# ⚠️ Disclaimer

ScamLens AI is an experimental AI-powered security-awareness project.

AI-generated results may be incorrect and should not be treated as definitive proof that content is malicious or safe.

Never enter passwords, OTPs, API keys, banking credentials, or other sensitive information into the application for analysis.

When in doubt, independently verify communications through official channels.

---

# 👩‍💻 Author

### Sai Deeksha D

Artificial Intelligence & Machine Learning Engineering

**GitHub:** [@saideeksha19](https://github.com/saideeksha19)

---

## 🌐 Vision

> **Scammers are getting smarter. Users should too.**

ScamLens AI aims to make sophisticated scam analysis understandable to everyone by turning an opaque **"Scam / Not Scam"** prediction into an explainable investigation.

**Detect → Explain → Understand → Protect**
