/**
 * Mock data + agent policy layer for SafeFirst Trade Agent.
 * No exchange keys, no network calls. Local state only.
 */

export const MAX_TRADE_USD = 10;
export const START_BALANCE = 10;

export type TradeStatus =
  | "idle"
  | "analyzing"
  | "awaiting_confirmation"
  | "executed"
  | "blocked";

export const STATUS_LABEL: Record<TradeStatus, string> = {
  idle: "Idle",
  analyzing: "Analyzing",
  awaiting_confirmation: "Waiting for confirmation",
  executed: "Executed",
  blocked: "Blocked",
};

export type TokenInfo = {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  bias: string;
  risk: string;
  watchLevel: number;
};

export const TOKENS: Record<string, TokenInfo> = {
  BNB: {
    symbol: "BNB",
    name: "BNB",
    price: 600,
    change24h: 0.8,
    bias: "Short-term cautious bullish",
    risk: "Momentum is thin; a rejection at $612 flips bias to neutral.",
    watchLevel: 612,
  },
  BTC: {
    symbol: "BTC",
    name: "Bitcoin",
    price: 64250,
    change24h: -0.4,
    bias: "Neutral, range-bound",
    risk: "Range lows at $63.1k; breakdown invalidates any long.",
    watchLevel: 65400,
  },
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    price: 3120,
    change24h: 1.6,
    bias: "Mildly bullish continuation",
    risk: "Extended into resistance; chasing here has poor risk/reward.",
    watchLevel: 3210,
  },
  SOL: {
    symbol: "SOL",
    name: "Solana",
    price: 148.2,
    change24h: 2.4,
    bias: "Bullish but volatile",
    risk: "High beta — a market-wide dip hits SOL twice as hard.",
    watchLevel: 155,
  },
};

export type TradeProposal = {
  pair: string;
  side: "BUY" | "SELL";
  type: "MARKET";
  sizeUsd: number;
  price: number;
  qty: number;
  reason: string;
  risk: string;
  stopCondition: string;
};

export type ParsedIntent = {
  kind: "analyze" | "balance" | "status_only" | "unknown";
  token?: TokenInfo;
  sizeUsd?: number;
  oversized?: boolean;
  requestedSize?: number;
  side: "BUY" | "SELL";
};

export function parseIntent(raw: string): ParsedIntent {
  const text = raw.toLowerCase();
  const side: "BUY" | "SELL" = /\bsell\b/.test(text) ? "SELL" : "BUY";

  if (/403|blocked|do not retry|don't retry|report status/.test(text)) {
    return { kind: "status_only", side };
  }
  if (/balance/.test(text) && !/prepare|buy|sell|order/.test(text)) {
    return { kind: "balance", side };
  }

  const token = Object.values(TOKENS).find((t) =>
    new RegExp(`\\b${t.symbol.toLowerCase()}\\b`).test(text),
  );
  if (!token) return { kind: "unknown", side };

  const match = text.match(/\$\s?(\d+(?:\.\d+)?)/);
  const requested = match ? Number(match[1]) : 5;
  return {
    kind: "analyze",
    token,
    requestedSize: requested,
    sizeUsd: Math.min(requested, MAX_TRADE_USD),
    oversized: requested > MAX_TRADE_USD,
    side,
  };
}

export function buildProposal(
  token: TokenInfo,
  sizeUsd: number,
  side: "BUY" | "SELL",
): TradeProposal {
  return {
    pair: `${token.symbol}/USDT`,
    side,
    type: "MARKET",
    sizeUsd,
    price: token.price,
    qty: sizeUsd / token.price,
    reason: `${token.bias.toLowerCase()} with a micro-size probe well inside the $${MAX_TRADE_USD} cap.`,
    risk: token.risk,
    stopCondition: `Abandon the idea if ${token.symbol} closes below $${(token.price * 0.97).toFixed(2)} or if the sub-account balance drops under $${(START_BALANCE / 2).toFixed(2)}.`,
  };
}

/** Exactly "CONFIRM" (case-sensitive-ish: trimmed, upper compare on exact word). */
export function isConfirm(raw: string) {
  return raw.trim() === "CONFIRM";
}

export function isCancel(raw: string) {
  return raw.trim().toUpperCase() === "CANCEL";
}

/** Any nudge to skip confirmation — must be refused. */
export function isCoercion(raw: string) {
  return /\b(buy now|just do it|do it|send it|go ahead|yolo|execute|place the order|now|asap|hurry|skip)\b/i.test(
    raw,
  );
}

export const HARD_RULES = [
  {
    title: "Main account is never touched",
    body: "The agent is ring-fenced to the Agent OS sub-account. It has no route, key, or permission to the main account.",
  },
  {
    title: "No order without an exact CONFIRM",
    body: 'Only the literal string "CONFIRM" releases an order. "buy now", "just do it" and every other phrasing is refused.',
  },
  {
    title: "Hard $10 maximum per trade",
    body: "Any requested size above $10 is clamped down and disclosed to the user before the proposal is shown.",
  },
  {
    title: "One token at a time",
    body: "A new analysis cannot start while a proposal is pending confirmation. Cancel first, then re-scope.",
  },
  {
    title: "Blocked means stop — never duplicate",
    body: "On a 403 / CloudFront block the agent halts, reports the state and refuses to retry, so no order can be doubled.",
  },
  {
    title: "The confirmation card is mandatory",
    body: "Pair, side, type, size, estimated qty, reason, risk and stop condition are always rendered before execution.",
  },
];

export const DEMO_PROMPTS = [
  "Analyze BNB and prepare a $5 market buy",
  "Check my Agent OS balance only. Do not place any order",
  "If the previous order was blocked with 403, do not retry. Report status only",
];

export function fmtUsd(n: number, digits = 2) {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function mockOrderId() {
  return `AOS-${Math.floor(100000 + Math.random() * 899999)}`;
}
