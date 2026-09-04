import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, FileText, ShieldQuestion, Zap, ClipboardCheck } from "lucide-react";
import { TrackBadge } from "@/components/SiteChrome";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/workflow")({
  head: () => ({
    meta: [
      { title: "Agent Workflow — SafeFirst Trade Agent" },
      {
        name: "description",
        content:
          "The five-stage SafeFirst pipeline: Analyze, Propose, Confirm, Execute, Report — with a hard stop before any order is sent.",
      },
      { property: "og:title", content: "Agent Workflow — SafeFirst Trade Agent" },
      {
        property: "og:description",
        content: "Analyze, Propose, Confirm, Execute, Report — a safety-first trading pipeline.",
      },
    ],
  }),
  component: WorkflowPage,
});

const STEPS = [
  {
    icon: Search,
    name: "Analyze",
    tag: "read-only",
    body: "The agent pulls one token's mock market snapshot: price, 24h change, a plain-language bias and the single biggest risk. Nothing is written, nothing is ordered.",
    detail: "BNB · $600.00 · +0.8% · short-term cautious bullish",
  },
  {
    icon: FileText,
    name: "Propose",
    tag: "structured card",
    body: "A full trade card is rendered — pair, side, type, USD size, estimated quantity, reason, risk and stop condition. Size is clamped to the $10 ceiling before it is ever shown.",
    detail: "BNB/USDT · BUY · MARKET · $5.00 · ≈ 0.00833 BNB",
  },
  {
    icon: ShieldQuestion,
    name: "Confirm",
    tag: "hard gate",
    body: 'The pipeline halts. Only the exact string "CONFIRM" releases the order. "buy now", "just do it" and every other nudge is refused and logged.',
    detail: 'Accepted: CONFIRM · CANCEL — everything else is a refusal',
  },
  {
    icon: Zap,
    name: "Execute",
    tag: "sub-account only",
    body: "The order is simulated against the ring-fenced Agent OS sub-account. If the venue returns 403 Request blocked (CloudFront), the agent stops cold instead of retrying.",
    detail: "Fill simulated · or 403 blocked → halt, never duplicate",
  },
  {
    icon: ClipboardCheck,
    name: "Report",
    tag: "always",
    body: "Fill or failure, remaining sub-account balance, the next level to watch, and an explicit confirmation that the main account was never touched.",
    detail: "Balance $5.00 · watch $612 · main account untouched",
  },
];

function WorkflowPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <TrackBadge className="sm:hidden" />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">The five-stage pipeline</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Every request travels the same path. The agent cannot skip a stage, and stage three is a
        hard stop rather than a suggestion.
      </p>

      <ol className="mt-10 space-y-4">
        {STEPS.map((step, i) => (
          <li key={step.name} className="relative pl-10 sm:pl-14">
            <span className="absolute top-6 left-[15px] hidden h-[calc(100%+1rem)] w-px bg-border last:hidden sm:block" />
            <span className="absolute top-5 left-0 grid size-8 place-items-center rounded-full border border-primary/40 bg-primary/10 text-xs font-semibold text-primary">
              {i + 1}
            </span>
            <div className="glow-card rounded-2xl p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <step.icon className="size-5 text-primary" />
                <h2 className="text-lg font-semibold">{step.name}</h2>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] tracking-wide text-muted-foreground uppercase">
                  {step.tag}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              <p className="text-ticker mt-3 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs text-foreground/80">
                {step.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link to="/console">Run it in the console</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/safety">Read the hard rules</Link>
        </Button>
      </div>
    </div>
  );
}
