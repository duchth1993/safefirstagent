import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Ban,
  Bot,
  CheckCircle2,
  Lock,
  Send,
  Settings2,
  ShieldAlert,
  Sparkle,
  Wallet,
} from "lucide-react";
import {
  DEMO_PROMPTS,
  MAX_TRADE_USD,
  START_BALANCE,
  STATUS_LABEL,
  buildProposal,
  fmtUsd,
  isCancel,
  isCoercion,
  isConfirm,
  mockOrderId,
  parseIntent,
  type TokenInfo,
  type TradeProposal,
  type TradeStatus,
} from "@/lib/agent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/console")({
  head: () => ({
    meta: [
      { title: "Agent Console — SafeFirst Trade Agent" },
      {
        name: "description",
        content:
          "Chat with the SafeFirst agent: analyze one token, review the trade card, and release the order only with an exact CONFIRM.",
      },
      { property: "og:title", content: "Agent Console — SafeFirst Trade Agent" },
      {
        property: "og:description",
        content: "Analyze, propose, confirm, execute — inside a ring-fenced Agent OS sub-account.",
      },
    ],
  }),
  component: ConsolePage,
});

type Msg = {
  id: string;
  role: "user" | "agent";
  tone?: "default" | "refusal" | "success" | "error";
  text: string;
  analysis?: TokenInfo;
  proposal?: TradeProposal;
};

let seq = 0;
const nextId = () => `m${++seq}`;

function ConsolePage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<TradeStatus>("idle");
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [proposal, setProposal] = useState<TradeProposal | null>(null);
  const [balance, setBalance] = useState(START_BALANCE);
  const [thinking, setThinking] = useState(false);
  const [demoError, setDemoError] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [resultModal, setResultModal] = useState<null | { ok: boolean; body: string }>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const push = (m: Omit<Msg, "id">) => setMessages((prev) => [...prev, { ...m, id: nextId() }]);

  const think = (ms: number) =>
    new Promise<void>((resolve) => {
      setThinking(true);
      setTimeout(() => {
        setThinking(false);
        resolve();
      }, ms);
    });

  async function execute() {
    if (!proposal) return;
    setConfirmOpen(false);
    setConfirmText("");
    await think(900);

    if (demoError) {
      setStatus("blocked");
      push({
        role: "agent",
        tone: "error",
        text:
          "403 Request blocked (CloudFront).\n\nThe order was rejected at the edge before reaching the venue. Fill state is unknown, so I am stopping here and will not retry — a blind retry is how duplicate orders happen.\n\n" +
          `Sub-account balance: ${fmtUsd(balance)} (unchanged) · Main account: untouched.\n` +
          "Next action is yours: re-issue a fresh proposal only after you confirm no fill landed.",
      });
      setResultModal({
        ok: false,
        body: "403 Request blocked (CloudFront). The agent halted and will not retry. No balance change, main account untouched.",
      });
      return;
    }

    const newBalance = Math.max(0, balance - proposal.sizeUsd);
    setBalance(newBalance);
    setStatus("executed");
    push({
      role: "agent",
      tone: "success",
      text:
        `Filled. Order ${mockOrderId()} — ${proposal.side} ${proposal.qty.toFixed(5)} ${proposal.pair.split("/")[0]} @ ${fmtUsd(proposal.price)} (${fmtUsd(proposal.sizeUsd)} market).\n\n` +
        `Remaining sub-account balance: ${fmtUsd(newBalance)} USDT\n` +
        `Next watch level: ${fmtUsd(token?.watchLevel ?? proposal.price)}\n` +
        `Stop condition still applies: ${proposal.stopCondition}\n\n` +
        "Main account untouched.",
    });
    setResultModal({
      ok: true,
      body: `${proposal.side} ${fmtUsd(proposal.sizeUsd)} of ${proposal.pair} filled in the Agent OS sub-account. Balance now ${fmtUsd(newBalance)} USDT. Main account untouched.`,
    });
  }

  async function handleSend(raw: string) {
    const text = raw.trim();
    if (!text || thinking) return;
    push({ role: "user", text });
    setInput("");

    if (status === "awaiting_confirmation" && proposal) {
      if (isConfirm(text)) return execute();
      if (isCancel(text)) {
        setStatus("idle");
        setProposal(null);
        await think(500);
        push({
          role: "agent",
          text: "Cancelled. No order was sent, nothing was reserved, and the sub-account balance is unchanged. Ready for a new token whenever you are.",
        });
        return;
      }
      await think(650);
      push({
        role: "agent",
        tone: "refusal",
        text: isCoercion(text)
          ? `I can't act on “${text}”. The only string that releases this order is CONFIRM, typed exactly. That gate exists so an ambiguous phrase can never move real balance. Type CONFIRM to proceed or CANCEL to drop the idea.`
          : "I'm holding at the confirmation gate. Type CONFIRM to send the proposed order, or CANCEL to discard it. I won't interpret anything else as approval.",
      });
      return;
    }

    const intent = parseIntent(text);

    if (intent.kind === "balance") {
      await think(600);
      push({
        role: "agent",
        text:
          `Agent OS sub-account: ${fmtUsd(balance)} USDT · Max per trade: ${fmtUsd(MAX_TRADE_USD)}\n` +
          "Main account: locked — the agent holds no key for it.\n\nRead-only request, so no order was prepared or placed.",
      });
      return;
    }

    if (intent.kind === "status_only") {
      await think(600);
      push({
        role: "agent",
        tone: "refusal",
        text:
          `Status only, as instructed. Last known state: ${STATUS_LABEL[status]}.\n\n` +
          "A 403 block leaves the fill state unknown, so retrying could duplicate an order. I will not re-send. " +
          `Sub-account balance: ${fmtUsd(balance)} USDT · Main account: untouched.`,
      });
      return;
    }

    if (intent.kind === "unknown" || !intent.token) {
      await think(550);
      push({
        role: "agent",
        text: "I work on one token at a time and I need to know which one. Try “Analyze BNB and prepare a $5 market buy” — BNB, BTC, ETH and SOL are wired into the mock data layer.",
      });
      return;
    }

    // Stage 1 — Analyze
    setStatus("analyzing");
    setToken(intent.token);
    await think(1000);
    push({
      role: "agent",
      analysis: intent.token,
      text: `Analysis complete for ${intent.token.symbol}. One token, read-only, nothing sent.`,
    });

    // Stage 2 — Propose
    const size = intent.sizeUsd ?? 5;
    const p = buildProposal(intent.token, Math.min(size, balance || size), intent.side);
    await think(900);
    if (intent.oversized) {
      push({
        role: "agent",
        tone: "refusal",
        text: `You asked for ${fmtUsd(intent.requestedSize ?? 0)}. The hard ceiling is ${fmtUsd(MAX_TRADE_USD)} per trade, so I clamped the proposal down to ${fmtUsd(p.sizeUsd)} rather than declining outright.`,
      });
    }
    setProposal(p);
    setStatus("awaiting_confirmation");
    push({
      role: "agent",
      proposal: p,
      text: "Proposal ready. No order will be sent until you type CONFIRM.",
    });
  }

  const reset = () => {
    setMessages([]);
    setStatus("idle");
    setToken(null);
    setProposal(null);
    setBalance(START_BALANCE);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Chat column */}
        <div className="glow-card flex h-[72vh] min-h-[520px] flex-col overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-md bg-primary/15 text-primary">
                <Bot className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">SafeFirst Agent</p>
                <p className="text-[11px] text-muted-foreground">
                  Agent OS sub-account · mock data
                </p>
              </div>
            </div>
            <StatusBadge status={status} />
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
            {messages.length === 0 && !thinking ? (
              <EmptyState onPick={handleSend} />
            ) : (
              messages.map((m) => <Bubble key={m.id} msg={m} />)
            )}
            {thinking && <Thinking />}
          </div>

          <div className="border-t border-border/70 p-3">
            {status === "awaiting_confirmation" && (
              <div className="mb-2.5 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
                <ShieldAlert className="size-3.5 shrink-0" />
                Confirmation gate open — type CONFIRM to send, CANCEL to discard.
              </div>
            )}
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Analyze BNB and prepare a $5 market buy"
                className="text-ticker h-11 text-sm"
                aria-label="Message the agent"
              />
              <Button type="submit" size="lg" disabled={thinking || !input.trim()}>
                <Send className="size-4" />
                <span className="sr-only sm:not-sr-only">Send</span>
              </Button>
            </form>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {DEMO_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSend(p)}
                  disabled={thinking}
                  className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-left text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="glow-card glow-accent rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="size-4 text-primary" />
              <span className="text-[11px] tracking-wider uppercase">Sub-account balance</span>
            </div>
            <p className="text-ticker mt-2 text-3xl font-semibold">{balance.toFixed(2)}</p>
            <p className="text-[11px] text-muted-foreground">USDT · Agent OS ring-fence</p>
          </div>

          <div className="glow-card space-y-3 rounded-2xl p-4 text-sm">
            <Row label="Selected token" value={token ? token.symbol : "—"} />
            <Row label="Trade status" value={STATUS_LABEL[status]} accent />
            <Row label="Max trade size" value={fmtUsd(MAX_TRADE_USD)} />
            <Row label="Main account" value="Locked" danger icon={<Lock className="size-3" />} />
          </div>

          <div className="glow-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Settings2 className="size-4 text-primary" />
              <span className="text-[11px] tracking-wider uppercase">Settings</span>
            </div>
            <label className="mt-3 flex items-center justify-between gap-3">
              <span className="text-sm">
                {demoError ? "Demo 403 Error" : "Demo Success"}
                <span className="block text-[11px] text-muted-foreground">
                  Simulated venue response on execute
                </span>
              </span>
              <Switch checked={demoError} onCheckedChange={setDemoError} />
            </label>
            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={reset}>
              Reset session
            </Button>
          </div>
        </aside>
      </div>

      {/* Confirmation modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm this order</DialogTitle>
            <DialogDescription>
              Type CONFIRM exactly to release the order into the Agent OS sub-account. Nothing has
              been sent yet.
            </DialogDescription>
          </DialogHeader>
          {proposal && (
            <div className="text-ticker space-y-1.5 rounded-xl border border-border bg-background/60 p-3 text-xs">
              <p>
                {proposal.side} · {proposal.pair} · {proposal.type}
              </p>
              <p>
                {fmtUsd(proposal.sizeUsd)} ≈ {proposal.qty.toFixed(5)}{" "}
                {proposal.pair.split("/")[0]} @ {fmtUsd(proposal.price)}
              </p>
            </div>
          )}
          <Input
            autoFocus
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="CONFIRM"
            className="text-ticker"
            aria-label="Type CONFIRM"
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setConfirmOpen(false);
                setConfirmText("");
              }}
            >
              Keep waiting
            </Button>
            <Button
              disabled={!isConfirm(confirmText)}
              onClick={() => {
                push({ role: "user", text: "CONFIRM" });
                execute();
              }}
            >
              Send order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result modal */}
      <Dialog open={!!resultModal} onOpenChange={(o) => !o && setResultModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {resultModal?.ok ? (
                <CheckCircle2 className="size-5 text-success" />
              ) : (
                <Ban className="size-5 text-destructive" />
              )}
              {resultModal?.ok ? "Order filled" : "Execution blocked"}
            </DialogTitle>
            <DialogDescription>{resultModal?.body}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setResultModal(null)}>Back to console</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating open-confirm affordance */}
      {status === "awaiting_confirmation" && !confirmOpen && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
          <Button className="pointer-events-auto" onClick={() => setConfirmOpen(true)}>
            <ShieldAlert className="size-4" />
            Open confirmation card
          </Button>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  danger,
  icon,
}: {
  label: string;
  value: string;
  accent?: boolean;
  danger?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-2.5 last:border-0 last:pb-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`text-ticker flex items-center gap-1.5 text-xs ${
          danger ? "text-destructive" : accent ? "text-primary" : "text-foreground"
        }`}
      >
        {icon}
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: TradeStatus }) {
  const map: Record<TradeStatus, string> = {
    idle: "border-border bg-secondary text-muted-foreground",
    analyzing: "border-info/40 bg-info/10 text-info",
    awaiting_confirmation: "border-primary/40 bg-primary/10 text-primary",
    executed: "border-success/40 bg-success/10 text-success",
    blocked: "border-destructive/40 bg-destructive/10 text-destructive",
  };
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap ${map[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function EmptyState({ onPick }: { onPick: (p: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <span className="glow-accent grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Sparkle className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold">One token. One tiny trade. Zero surprises.</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Ask for research and the agent will analyze, then propose a $5–$10 order. It stops dead
        until you type CONFIRM.
      </p>
      <div className="mt-6 grid w-full max-w-sm gap-2">
        {DEMO_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPick(p)}
            className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {p}
            <ArrowUpRight className="size-3.5 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Thinking() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
        <Bot className="size-3.5" />
      </span>
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce rounded-full bg-primary"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </span>
      Working through the safety checks…
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="text-ticker max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">
          {msg.text}
        </p>
      </div>
    );
  }

  const toneClass =
    msg.tone === "refusal"
      ? "text-destructive"
      : msg.tone === "success"
        ? "text-success"
        : msg.tone === "error"
          ? "text-destructive"
          : "text-foreground";

  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
        <Bot className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1 space-y-3">
        {msg.analysis && <AnalysisCard token={msg.analysis} />}
        {msg.proposal && <ProposalCard p={msg.proposal} />}
        <p className={`text-sm leading-relaxed whitespace-pre-line ${toneClass}`}>{msg.text}</p>
      </div>
    </div>
  );
}

function AnalysisCard({ token }: { token: TokenInfo }) {
  const up = token.change24h >= 0;
  return (
    <div className="glow-card rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {token.symbol}
          <span className="ml-2 text-xs font-normal text-muted-foreground">{token.name}</span>
        </p>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] tracking-wider text-muted-foreground uppercase">
          Stage 1 · Analyze
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="text-ticker text-2xl font-semibold">{fmtUsd(token.price)}</span>
        <span className={`text-ticker text-sm ${up ? "text-success" : "text-destructive"}`}>
          {up ? "+" : ""}
          {token.change24h}%
        </span>
      </div>
      <dl className="mt-3 space-y-1.5 text-xs">
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-muted-foreground">Bias</dt>
          <dd>{token.bias}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-muted-foreground">Key risk</dt>
          <dd className="text-muted-foreground">{token.risk}</dd>
        </div>
      </dl>
    </div>
  );
}

function ProposalCard({ p }: { p: TradeProposal }) {
  const base = p.pair.split("/")[0];
  return (
    <div className="glow-card glow-accent overflow-hidden rounded-xl">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-2.5">
        <p className="text-sm font-semibold">Proposed trade</p>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] tracking-wider text-primary uppercase">
          Stage 2 · Propose
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 px-4 py-3 text-xs sm:grid-cols-3">
        <Field k="Pair" v={p.pair} />
        <Field k="Side" v={p.side} accent />
        <Field k="Type" v={p.type} />
        <Field k="Size" v={fmtUsd(p.sizeUsd)} />
        <Field k="Est. qty" v={`${p.qty.toFixed(5)} ${base}`} />
        <Field k="Ref price" v={fmtUsd(p.price)} />
      </div>
      <dl className="space-y-2 px-4 pb-3 text-xs">
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-muted-foreground">Reason</dt>
          <dd>{p.reason}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-muted-foreground">Risk</dt>
          <dd className="text-muted-foreground">{p.risk}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-muted-foreground">Stop</dt>
          <dd className="text-muted-foreground">{p.stopCondition}</dd>
        </div>
      </dl>
      <p className="flex items-center gap-2 border-t border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary">
        <AlertTriangle className="size-4 shrink-0" />
        No order will be sent until you type CONFIRM
      </p>
    </div>
  );
}

function Field({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[10px] tracking-wider text-muted-foreground uppercase">{k}</p>
      <p className={`text-ticker mt-0.5 ${accent ? "text-primary" : ""}`}>{v}</p>
    </div>
  );
}
