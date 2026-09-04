import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, ShieldCheck, XCircle } from "lucide-react";
import { HARD_RULES } from "@/lib/agent";
import { TrackBadge } from "@/components/SiteChrome";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Safety Rules — SafeFirst Trade Agent" },
      {
        name: "description",
        content:
          "Six hard rules the agent cannot talk its way out of: sub-account only, exact CONFIRM, $10 cap, one token, no retry after a block.",
      },
      { property: "og:title", content: "Safety Rules — SafeFirst Trade Agent" },
      {
        property: "og:description",
        content: "The non-negotiable constraints encoded into the SafeFirst trading agent.",
      },
    ],
  }),
  component: SafetyPage,
});

const REFUSALS = [
  "buy now",
  "just do it",
  "send it",
  "yolo it",
  "skip the confirmation",
  "trade from my main account",
  "make it $50 instead",
  "retry the blocked order",
];

function SafetyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <TrackBadge className="sm:hidden" />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Hard rules</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        These are constraints in the agent's control loop, not tone-of-voice instructions. No
        prompt can unlock them.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {HARD_RULES.map((rule) => (
          <div key={rule.title} className="glow-card rounded-2xl p-5">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="size-4 shrink-0 text-primary" />
              <h2 className="text-sm font-semibold">{rule.title}</h2>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{rule.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="glow-card rounded-2xl p-5">
          <div className="flex items-center gap-2.5">
            <XCircle className="size-4 text-destructive" />
            <h2 className="text-sm font-semibold">Phrases the agent refuses</h2>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {REFUSALS.map((p) => (
              <li
                key={p}
                className="text-ticker rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs text-destructive"
              >
                “{p}”
              </li>
            ))}
          </ul>
        </div>
        <div className="glow-card glow-accent rounded-2xl p-5">
          <div className="flex items-center gap-2.5">
            <Lock className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">Account isolation</h2>
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <dt className="text-muted-foreground">Main account</dt>
              <dd className="text-ticker text-destructive">Locked · no key</dd>
            </div>
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <dt className="text-muted-foreground">Agent OS sub-account</dt>
              <dd className="text-ticker text-success">10.00 USDT</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Max per trade</dt>
              <dd className="text-ticker text-primary">$10.00</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link to="/console">Try to break it</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/recap">Demo recap</Link>
        </Button>
      </div>
    </div>
  );
}
