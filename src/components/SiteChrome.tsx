import { Link } from "@tanstack/react-router";
import { ShieldCheck, Lock } from "lucide-react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/console", label: "Agent Console" },
  { to: "/workflow", label: "Workflow" },
  { to: "/safety", label: "Safety" },
  { to: "/recap", label: "Demo Recap" },
] as const;

export function TrackBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium tracking-wide text-primary uppercase ${className}`}
    >
      <ShieldCheck className="size-3.5" />
      Hackathon Track A — Built for Binance Agent OS
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto hidden max-w-6xl items-center justify-center px-4 pt-2 sm:flex">
        <TrackBadge />
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Lock className="size-4" />
          </span>
          <span className="font-display text-sm font-semibold tracking-tight sm:text-base">
            SafeFirst<span className="text-primary"> Trade Agent</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto text-sm">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-md px-2.5 py-1.5 whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-primary bg-primary/10" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center">
        <p className="text-xs text-muted-foreground">
          This is a demo workflow. Not financial advice.
        </p>
        <p className="text-[11px] text-muted-foreground/70">
          Mock data only — no exchange keys, no live orders, main account locked.
        </p>
      </div>
    </footer>
  );
}
