# SafeFirst Trade Agent

Track A submission for the Binance Agent OS Mini Hackathon.

A safety-first trading agent workflow:
research one token → propose a $5–$10 order → execute only after the user types `CONFIRM`.

Live demo: https://safefirstagent.lovable.app/

## Why this exists
Agent OS is powerful, but a trading agent should not be allowed to act on vague commands like “buy now” or “just do it”.
SafeFirst treats confirmation, position size, and account isolation as hard rules, not chat tone.

## What it does
- Analyzes one token at a time
- Proposes a micro-size trade on the Agent OS sub-account only
- Blocks any order until the user types exactly `CONFIRM`
- Refuses phrases like `buy now`, `just do it`, `yolo it`
- Stops on `403 Request blocked` and does not retry
- Never touches the main account

## Demo flow
1. Open the Agent Console
2. Use: `Analyze BNB and prepare a $5 market buy`
3. Review the trade card
4. Type `CONFIRM` to simulate a fill  
   or enable the 403 toggle to see the stop path
5. Check remaining sub-account balance and “Main account untouched”

## Safety rules
- Main account is locked
- Max trade size is $10
- One token / one proposal at a time
- Confirmation card is mandatory
- Blocked means stop, never duplicate

## What this is / is not
This is a working workflow prototype designed for Binance Agent OS.
The public demo uses simulated market and order responses so judges can test the full pipeline without live keys.
It is not financial advice and not a live exchange connection.

## Built with
- Lovable
- React frontend
- Local mock state for balances, orders, and venue responses

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
