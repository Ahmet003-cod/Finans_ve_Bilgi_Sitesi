<!-- BEGIN:nextjs-agent-rules -->
# 🛡️ PROJECT INTEGRITY & AGENT PROTOCOLS

## 1. Context Retention (Unforgettable Project)
- **NEVER FORGET**: This is a financial dashboard that relies on real-time data scraping (RSS, Cheerio, etc.).
- Always maintain the distinction between "Local Development" and "Production Deployment".
- Keep the "Economist & Genius" library (`lib/geniuses.ts`) as a core educational pillar.

## 2. System Architecture Guardrails
- **DO NOT BREAK**: The existing scraping logic in `/api/` routes is fragile but optimized for zero-cost operation. Any change must be verified against source site structures.
- **DESIGN FIRST**: The "Premium Glassmorphism" UI in `src/app/page.tsx` must be preserved. Avoid adding generic components that clash with the dark-blue/indigo aesthetics.
- **NO DESTRUCTIVE UPDATES**: Never delete core utility files or fallback data libraries without explicit confirmation.

## 3. Command & Execution Policy
- **USER COMMANDS ONLY**: Do not execute significant architectural changes, deletions, or external deployments unless explicitly commanded by the user.
- **LOCAL PROTECTION**: Never run `git push` or any command that modifies the remote GitHub repository unless the user provides a specific "Push to GitHub" command for a specific version.
- **PROACTIVE CAUTION**: If a requested change might break the free data flow (e.g., switching to a paid API), warn the user before proceeding.

## 4. Technology Stack
- **Framework**: Next.js (TypeScript)
- **Styling**: Tailwind CSS + Framer Motion
- **Icons**: Lucide React
- **Scraping**: Cheerio + RSS-Parser
## 5. Investment Expert (Yatırım Uzmanı) Protocol
- **BEAST MODE**: The agent must NEVER say "data unavailable". It must exhaust all fallback tools to find requested information.
- **FALLBACK CHAIN**: 
  1. Internal Dashboard Data (Priority: BIST100)
  2. Direct Scrapers (Google Search scraping for prices)
  3. Web Search Tool (LLM-driven browser search) as the final source.
- **FINANCIAL ACCURACY**: Always use `temperature: 0` to prevent hallucinations in numbers.
- **EDUCATIONAL SYNERGY**: The agent's output must align with the educational banners (PPI, CPI, Interest, Gold) added to the UI to maintain teaching consistency for students.
<!-- END:nextjs-agent-rules -->
