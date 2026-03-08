📌 Problem Statement
ESG (Environmental, Social, and Governance) reporting is becoming mandatory globally, including for companies listed on Bursa Malaysia. However, most SMEs and even large corporations struggle with:
Data Fragmentation: ESG data is buried in disparate spreadsheets and PDFs.
Regulatory Complexity: Keeping up with evolving standards (Bursa ESG Guide v3.0, IFRS S1/S2) is a manual nightmare.
Actionable Insights: Raw data doesn't provide a roadmap for improvement.

💡 The Solution: ESGenie
ESGenie is an autonomous AI agent that acts as a virtual ESG Intelligence Officer. Unlike traditional calculators, ESGenie uses a Reasoning-Action (ReAct) framework to autonomously navigate company data, map it against regulatory standards, and provide a strategic roadmap for sustainability.

🚀 Key Features
Autonomous Agentic Workflow: Uses a "Plan-Act-Reflect" cycle to ensure high-accuracy ESG analysis.
Bursa Malaysia Alignment: Specifically tuned to map disclosures against the Bursa Malaysia ESG Reporting Guide.
Carbon Intelligence: Automated Scope 1, 2, and 3 emission calculations based on user-provided activity data.
ESG Scoring & Benchmarking: Real-time scoring based on environmental impact, social metrics, and governance transparency.
Executive PDF Reports: One-click generation of professional ESG Intelligence reports ready for stakeholders.

🧠 The "Secret Sauce": Agentic Reasoning
ESGenie doesn't just "process" text. It thinks through the ESG journey:
Plan: The agent breaks down the user's request into specific ESG domains (e.g., "Analyze Energy Usage," "Check Board Diversity").
Act: It queries the Gemini model to map raw data to specific regulatory indicators.
Reflect: It reviews its own output for consistency and compliance gaps before presenting the final score.

🛠 Tech Stack
Core AI: Google Gemini 1.5 Pro (via @google/genai)
Frontend: React 18 + TypeScript + Tailwind CSS
Animations: Framer Motion (for the "Agent Thinking" experience)
Icons: Lucide React
Charts: Recharts / D3.js



<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/522d7cc4-c4a6-49a0-adcc-01e4960e93f1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
