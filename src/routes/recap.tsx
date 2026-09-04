import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Github, PlayCircle, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DEMO_PROMPTS } from "@/lib/agent";
import { TrackBadge } from "@/components/SiteChrome";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/recap")({
  head: () => ({
    meta: [
      { title: "Demo Recap — SafeFirst Trade Agent" },
      {
        name: "description",
        content:
          "Judge-ready summary of SafeFirst Trade Agent: what it does, what makes it safe, and the 90-second demo script.",
      },
      { property: "og:title", content: "Demo Recap — SafeFirst Trade Agent" },
      {
        property: "og:description",
        content: "A 90-second walkthrough of a safety-first Binance Agent OS trading agent.",
      },
    ],
  }),
  component: RecapPage,
});

const HIGHLIGHTS = [
  {
    k: "The problem",
    v: "Trading agents are trusted with real balances and fail open — they retry, they over-size, they act on ambiguous language.",
  },
  {
    k: "The approach",
    v: "Fail closed. One token, one micro-size proposal, one literal CONFIRM. Everything else is a refusal with a reason.",
  },
  {
    k: "Blast radius",
    v: "A ring-fenced Agent OS sub-account holding 10 USDT with a $10 per-trade ceiling. The main account has no route in.",
  },
  {
    k: "Failure handling",
    v: "A 403 CloudFront block is a terminal state, not a retry loop — the single most common way demo agents double-fill.",
  },
];

const SCRIPT = [
  'Type “Analyze BNB and prepare a $5 market buy” — watch Analyze then Propose.',
  'Type “just do it” — the agent refuses and stays in Waiting for confirmation.',
  "Type CONFIRM — order fills, balance drops to $5.00, main account untouched.",
  "Flip the settings toggle to Demo 403 Error and repeat — the agent halts and refuses to retry.",
];

function RecapPage() {
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(DEMO_PROMPTS[0] ?? "");
      setCopied(true);
      toast.success("Demo prompt copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Clipboard unavailable — copy it manually");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <TrackBadge className="sm:hidden" />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Submission recap</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        SafeFirst Trade Agent — Binance Agent OS Mini Hackathon, Track A. A trading agent whose
        headline feature is the trade it refuses to make.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {HIGHLIGHTS.map((h) => (
          <div key={h.k} className="glow-card rounded-2xl p-5">
            <p className="text-[11px] tracking-wider text-primary uppercase">{h.k}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{h.v}</p>
          </div>
        ))}
      </div>

      <div className="glow-card glow-accent mt-6 rounded-2xl p-5 sm:p-6">
        <h2 className="text-lg font-semibold">90-second demo script</h2>
        <ol className="mt-4 space-y-3">
          {SCRIPT.map((s, i) => (
            <li key={s} className="flex gap-3 text-sm text-muted-foreground">
              <span className="text-ticker mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-[11px] text-primary">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button size="lg" asChild>
          <Link to="/console">
            <PlayCircle className="size-4" />
            Watch demo
          </Link>
        </Button>
        <Button size="lg" variant="outline" onClick={copyPrompt}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          Copy prompt
        </Button>
        <Button size="lg" variant="ghost" asChild>
          <a href="https://github.com" target="_blank" rel="noreferrer noopener">
            <Github className="size-4" />
            GitHub
          </a>
        </Button>
      </div>
    </div>
  );
}
