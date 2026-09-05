# SafeFirst Trade Agent

Build a polished web app called "SafeFirst Trade Agent" for the Binance Agent OS Mini Hackathon (Track A).

Goal:
A safety-first AI trading agent interface that helps users research one token, propose a tiny trade ($5–$10), and NEVER execute without explicit confirmation. The agent only operates in a ring-fenced Agent OS sub-account, never the main account.

Visual style:
- Dark fintech UI
- Binance-inspired colors: black background, yellow (#F0B90B) accents, white text
- Clean, modern, premium, mobile-responsive
- Soft glowing cards, clear status badges, no clutter

Pages:
1. Home
   - Hero: “SafeFirst Trade Agent”
   - Subtitle: “Research. Confirm. Then trade. Built on Binance Agent OS.”
   - CTA buttons: Start Demo, View Workflow, Safety Rules
2. Agent Console
   - Chat-style interface with the agent
   - Right sidebar showing:
     - Sub-account balance (mock: 10.00 USDT)
     - Selected token
     - Trade status: Idle / Analyzing / Waiting for confirmation / Executed / Blocked
     - Max trade size: $10
     - Main account: Locked
3. Workflow
   - Stepper: Analyze → Propose → Confirm → Execute → Report
4. Safety
   - List hard rules
5. Demo Recap / Submission
   - Short summary for hackathon judges
   - Buttons: Watch Demo, Copy Prompt, GitHub

Core workflow in Agent Console:
When the user types a prompt like “Analyze BNB and prepare a $5 buy”, the agent should respond in stages:

Stage 1 — Analyze
- Show token, mock price, 24h change, simple bias, key risk
- Example: BNB, $600, +0.8%, short-term cautious bullish

Stage 2 — Propose
- Show a trade card:
  - Pair: BNB/USDT
  - Side: BUY
  - Type: MARKET
  - Size: $5
  - Estimated qty
  - Reason
  - Risk
  - Stop condition
- Big warning: “No order will be sent until you type CONFIRM”

Stage 3 — Wait
- Agent must refuse to execute if user says “buy now”, “just do it”, or anything except exactly CONFIRM
- If user says CONFIRM, go to execute
- If user says CANCEL, stop

Stage 4 — Execute
- Simulate a successful fill
- Then also include a fallback state: “403 Request blocked (CloudFront)”
- Add a toggle in settings: Demo Success / Demo 403 Error
- If 403, agent must STOP and not retry blindly

Stage 5 — Report
- Show fill or error
- Remaining mock balance
- Next watch level
- “Main account untouched”

Hard rules to encode:
- Never trade the main account
- Never place an order without CONFIRM
- Max size $10
- Only one token at a time
- If API/order is blocked, do not duplicate orders
- Always show confirmation card before execution

Pre-filled demo prompts on the console:
- Analyze BNB and prepare a $5 market buy
- Check my Agent OS balance only. Do not place any order
- If the previous order was blocked with 403, do not retry. Report status only

Include a mock data layer, no real exchange keys.
Use local state only.
Add a beautiful empty state, loading state, confirmation modal, success modal, and error modal.

Add a top badge: “Hackathon Track A — Built for Binance Agent OS”
Footer text: “This is a demo workflow. Not financial advice.”

Make it look submission-ready, not like a generic chatbot.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://safefirstagent.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9275cd68-38a4-4b56-b8ed-c4bcb51cc587).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
