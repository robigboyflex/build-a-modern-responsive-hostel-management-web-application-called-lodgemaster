import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Building2,
  UserPlus,
  DoorOpen,
  Receipt,
  BedDouble,
  ClipboardCheck,
  CheckCircle2,
  ArrowRight,
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
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-elegant">
              <Building2 className="h-5 w-5" />
            </div>
            LodgeMaster
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#how" className="hover:text-foreground transition">How it works</a>
            <a href="#contact" className="hover:text-foreground transition">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost" size="sm">Login</Button></Link>
            <Link to="/auth" search={{ mode: "register" as const }}><Button size="sm">Get started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/10),transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Trusted by universities & NSS personnel
          </div>
          <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight text-foreground">
            Find and Book Your <span className="text-primary">Hostel Room</span> Easily
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Book your hostel room, upload payment proof and complete your accommodation registration online.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/auth" search={{ mode: "register" as const }}>
              <Button size="lg" className="rounded-xl shadow-elegant">
                Book a Room <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="rounded-xl">Login</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold">Everything you need in one place</h2>
          <p className="mt-3 text-muted-foreground">Built for students, NSS personnel and hostel managers.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elegant transition-all hover:-translate-y-1">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-primary-soft/40 border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
            <p className="mt-3 text-muted-foreground">Six simple steps from account to keys.</p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s} className="flex items-start gap-4 rounded-2xl bg-card border border-border p-5 shadow-card">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground font-semibold">
                  {i + 1}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Step {i + 1}</div>
                  <div className="font-semibold mt-0.5">{s}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 text-3xl md:text-4xl font-bold">Ready to secure your accommodation?</h2>
        <p className="mt-3 text-muted-foreground">Create your account today and start your booking journey.</p>
        <Link to="/auth" search={{ mode: "register" as const }} className="inline-block mt-8">
          <Button size="lg" className="rounded-xl shadow-elegant">Create free account</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
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
