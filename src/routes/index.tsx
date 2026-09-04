import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lock, ShieldCheck, Wallet, Ban } from "lucide-react";
import { TrackBadge } from "@/components/SiteChrome";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SafeFirst Trade Agent — Research. Confirm. Then trade." },
      {
        name: "description",
        content:
          "A safety-first AI trading agent for Binance Agent OS: researches one token, proposes a $5–$10 trade, and never executes without an explicit CONFIRM.",
      },
      { property: "og:title", content: "SafeFirst Trade Agent" },
      {
        property: "og:description",
        content: "Research. Confirm. Then trade. Built on Binance Agent OS.",
      },
    ],
  }),
  component: Home,
});

const STATS = [
  { icon: Wallet, label: "Sub-account balance", value: "10.00 USDT" },
  { icon: ShieldCheck, label: "Max trade size", value: "$10.00" },
  { icon: Lock, label: "Main account", value: "Locked" },
  { icon: Ban, label: "Orders without CONFIRM", value: "0" },
];

function Home() {
  return (
    <div>
      <section className="hero-surface relative overflow-hidden">
        <div className="grid-backdrop pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:py-28">
          <TrackBadge className="sm:hidden" />
          <h1 className="mt-6 text-4xl leading-[1.05] font-bold sm:text-6xl">
            SafeFirst <span className="text-primary">Trade Agent</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Research. Confirm. Then trade. Built on Binance Agent OS.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/console">
                Start demo <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/workflow">View workflow</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link to="/safety">Safety rules</Link>
            </Button>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="glow-card rounded-xl p-4 text-left">
                <s.icon className="size-4 text-primary" />
                <p className="text-ticker mt-3 text-sm font-semibold">{s.value}</p>
                <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              t: "One token, one probe",
              d: "The agent scopes itself to a single asset and a single micro-size idea. No basket, no scaling in, no surprises.",
            },
            {
              t: "The CONFIRM gate",
              d: 'Nothing leaves the console until you type the exact word CONFIRM. "Just do it" gets a polite refusal.',
            },
            {
              t: "Blocked means stop",
              d: "If the venue answers 403, the agent halts and reports. It will not retry and cannot duplicate a fill.",
            },
          ].map((c) => (
            <div key={c.t} className="glow-card rounded-2xl p-6">
              <h2 className="text-base font-semibold">{c.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
