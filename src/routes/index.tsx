import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AUTH_DISABLED } from "@/lib/auth-flags";
import {
  Building2,
  UserPlus,
  DoorOpen,
  Receipt,
  BedDouble,
  ClipboardCheck,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LodgeMaster — Find and Book Your Hostel Room Easily" },
      { name: "description", content: "Book your hostel room, upload payment proof and complete your accommodation registration online." },
      { property: "og:title", content: "LodgeMaster — Find and Book Your Hostel Room Easily" },
      { property: "og:description", content: "Book your hostel room, upload payment proof and complete your accommodation registration online." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: UserPlus, title: "Easy Registration", desc: "Sign up in minutes and start your accommodation journey." },
  { icon: DoorOpen, title: "Room Booking", desc: "Browse room types, blocks and floors in a guided flow." },
  { icon: Receipt, title: "Upload Payment Receipt", desc: "Submit proof of payment directly from your dashboard." },
  { icon: BedDouble, title: "Choose Your Room", desc: "Pick your exact room from real-time availability." },
  { icon: ClipboardCheck, title: "Registration Tracking", desc: "Follow every step until final approval." },
];

const steps = [
  "Create Account",
  "Choose Room Type",
  "Make Payment",
  "Upload Receipt",
  "Choose Room",
  "Manager Approval",
];

function Landing() {
  const primaryCta = AUTH_DISABLED
    ? { to: "/book" as const, search: undefined }
    : { to: "/auth" as const, search: { mode: "register" as const } };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
          <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-700 tracking-tight">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-navy text-navy-foreground">
              <Building2 className="h-4.5 w-4.5" />
            </div>
            LodgeMaster
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">Features</a>
            <a href="#how" className="transition hover:text-foreground">How it works</a>
            <a href="#contact" className="transition hover:text-foreground">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost" size="sm">Login</Button></Link>
            <Link {...(primaryCta as any)}>
              <Button size="sm" className="rounded-full px-4">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — bento */}
      <section className="mx-auto max-w-7xl px-5 pt-8 pb-6 md:pt-12">
        <div className="grid gap-4 lg:grid-cols-12 lg:grid-rows-2">
          {/* Headline tile */}
          <div className="bento-tile lg:col-span-7 lg:row-span-2 bg-navy text-navy-foreground p-8 md:p-12 flex flex-col justify-between">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/35 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-amber/25 blur-3xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-navy-foreground/20 bg-navy-foreground/10 px-3 py-1 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                Trusted by universities &amp; NSS personnel
              </span>
              <h1 className="mt-7 font-display text-4xl leading-[1.02] font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                Find and Book Your{" "}
                <span className="text-amber">Hostel Room</span> Easily
              </h1>
              <p className="mt-5 max-w-xl text-base text-navy-foreground/75 md:text-lg">
                Book your hostel room, upload payment proof and complete your accommodation registration online.
              </p>
            </div>
            <div className="relative mt-10 flex flex-wrap gap-3">
              <Link {...(primaryCta as any)}>
                <Button size="lg" className="rounded-full bg-amber text-amber-foreground hover:bg-amber/90">
                  Book a Room <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-navy-foreground/30 bg-transparent text-navy-foreground hover:bg-navy-foreground/10 hover:text-navy-foreground"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>

          {/* Image tile */}
          <div className="bento-tile lg:col-span-5 min-h-[220px]">
            <img
              src={heroBg}
              alt="Modern student hostel building on campus"
              width={1920}
              height={1088}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
            <div className="absolute bottom-5 left-5 text-navy-foreground">
              <div className="font-display text-sm font-semibold">Real-time availability</div>
              <div className="text-xs text-navy-foreground/70">Rooms, blocks and floors, live</div>
            </div>
          </div>

          {/* Stats tiles */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5">
            <StatTile value="6 steps" label="From account to keys" tone="sand" />
            <StatTile value="10 MB" label="Per document upload" tone="card" />
          </div>
        </div>
      </section>

      {/* Features — bento */}
      <section id="features" className="mx-auto max-w-7xl px-5 py-16 md:py-20">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-xl font-display text-3xl font-bold md:text-4xl">Everything you need in one place</h2>
          <p className="text-muted-foreground">Built for students, NSS personnel and hostel managers.</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-6">
          {features.map((f, i) => (
            <article
              key={f.title}
              className={`bento-tile p-6 md:p-7 ${i === 0 ? "md:col-span-3 bg-sand" : i === 1 ? "md:col-span-3" : "md:col-span-2"}`}
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-border bg-sand/60">
        <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="font-display text-3xl font-bold md:text-4xl">How it works</h2>
            <p className="text-muted-foreground">Six simple steps from account to keys.</p>
          </div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s} className="bento-tile flex items-center gap-4 p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy font-display text-sm font-bold text-navy-foreground">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Step {i + 1}</div>
                  <div className="mt-0.5 font-display font-semibold">{s}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:py-20">
        <div className="bento-tile bg-navy p-9 text-navy-foreground md:p-14">
          <div className="pointer-events-none absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-amber/20 blur-3xl" />
          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">Ready to secure your accommodation?</h2>
              <p className="mt-3 text-navy-foreground/75">Start your booking journey in a few clicks.</p>
            </div>
            <Link {...(primaryCta as any)}>
              <Button size="lg" className="rounded-full bg-amber text-amber-foreground hover:bg-amber/90">
                Start booking <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-9 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-navy text-navy-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            © {new Date().getFullYear()} LodgeMaster
          </div>
          <div className="flex items-center gap-6">
            <a href="mailto:support@lodgemaster.app" className="hover:text-foreground">Contact</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatTile({ value, label, tone }: { value: string; label: string; tone: "sand" | "card" }) {
  return (
    <div className={`bento-tile p-6 ${tone === "sand" ? "bg-sand" : ""}`}>
      <div className="font-display text-3xl font-bold tracking-tight">{value}</div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
