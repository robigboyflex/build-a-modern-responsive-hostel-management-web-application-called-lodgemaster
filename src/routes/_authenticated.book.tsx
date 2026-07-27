import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Building2, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/book")({
  head: () => ({ meta: [{ title: "Book Accommodation — LodgeMaster" }, { name: "description", content: "Book your hostel accommodation." }] }),
  component: Book,
});

function Book() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [rt, setRt] = useState<any | null>(null);
  const [bl, setBl] = useState<any | null>(null);
  const [fl, setFl] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { supabase.from("room_types").select("*").order("capacity").then(({ data }) => setRoomTypes(data ?? [])); }, []);

  useEffect(() => {
    if (!rt) return;
    // Blocks that have available rooms of this type
    supabase.from("rooms").select("block_id, blocks(id,name)").eq("room_type_id", rt.id).eq("status", "available").then(({ data }) => {
      const map = new Map<string, any>();
      (data ?? []).forEach((r: any) => { if (r.blocks) map.set(r.blocks.id, r.blocks); });
      setBlocks(Array.from(map.values()));
    });
  }, [rt]);

  useEffect(() => {
    if (!bl || !rt) return;
    supabase.from("rooms").select("floor_id, floors(id,name,level)").eq("room_type_id", rt.id).eq("block_id", bl.id).eq("status", "available").then(({ data }) => {
      const map = new Map<string, any>();
      (data ?? []).forEach((r: any) => { if (r.floors) map.set(r.floors.id, r.floors); });
      setFloors(Array.from(map.values()).sort((a, b) => a.level - b.level));
    });
  }, [bl, rt]);

  const submit = async () => {
    if (!rt || !bl || !fl) return;
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setBusy(false); return; }
    const { deadlineFromNow } = await import("@/lib/hooks");
    const { data, error } = await supabase.from("bookings").insert({
      user_id: u.user.id, room_type_id: rt.id, block_id: bl.id, floor_id: fl.id,
      fee: rt.fee, status: "pending_payment",
      payment_deadline: deadlineFromNow(),
    }).select().single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Booking saved. Complete your payment next.");
    nav({ to: "/payment" });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Book Accommodation</h1>
        <p className="text-muted-foreground mt-1">Follow the steps to reserve your hostel.</p>
      </div>

      <StepIndicator step={step} />

      {step === 1 && (
        <Card className="border-border/60"><CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary"/>LodgeMaster Hostel</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">A modern residence with secure access, dedicated study spaces, high-speed Wi-Fi, laundry, and 24/7 support.</p>
            <Button onClick={() => setStep(2)}>Continue</Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Section title="Choose Room Type" onBack={() => setStep(1)}>
          <div className="grid gap-3 sm:grid-cols-2">
            {roomTypes.length === 0 && <Empty>No room types available yet.</Empty>}
            {roomTypes.map((r) => (
              <SelectCard key={r.id} selected={rt?.id === r.id} onClick={() => { setRt(r); setBl(null); setFl(null); setStep(3); }}
                title={r.name} sub={`Capacity: ${r.capacity} · Fee: GHS ${Number(r.fee).toFixed(2)}`} />
            ))}
          </div>
        </Section>
      )}

      {step === 3 && (
        <Section title="Choose Block" onBack={() => setStep(2)}>
          <div className="grid gap-3 sm:grid-cols-3">
            {blocks.length === 0 && <Empty>No blocks with availability for this room type.</Empty>}
            {blocks.map((b) => (
              <SelectCard key={b.id} selected={bl?.id === b.id} onClick={() => { setBl(b); setFl(null); setStep(4); }} title={b.name} sub="Block" />
            ))}
          </div>
        </Section>
      )}

      {step === 4 && (
        <Section title="Choose Floor" onBack={() => setStep(3)}>
          <div className="grid gap-3 sm:grid-cols-3">
            {floors.length === 0 && <Empty>No available floors.</Empty>}
            {floors.map((f) => (
              <SelectCard key={f.id} selected={fl?.id === f.id} onClick={() => { setFl(f); setStep(5); }} title={f.name} sub="Floor" />
            ))}
          </div>
        </Section>
      )}

      {step === 5 && rt && bl && fl && (
        <Card className="border-border/60">
          <CardHeader><CardTitle>Accommodation Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label="Hostel" value="LodgeMaster Hostel" />
            <Row label="Room Type" value={rt.name} />
            <Row label="Block" value={bl.name} />
            <Row label="Floor" value={fl.name} />
            <Row label="Accommodation Fee" value={`GHS ${Number(rt.fee).toFixed(2)}`} />
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(4)}>Back</Button>
              <Button onClick={submit} disabled={busy}>{busy ? "Saving..." : "Proceed"}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  const labels = ["Hostel", "Room Type", "Block", "Floor", "Summary"];
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {labels.map((l, i) => (
        <div key={l} className="flex items-center gap-2">
          <div className={`h-8 w-8 grid place-items-center rounded-full text-xs font-semibold ${step > i + 1 ? "bg-success text-success-foreground" : step === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {step > i + 1 ? <Check className="h-4 w-4"/> : i + 1}
          </div>
          <span className={`text-sm ${step === i + 1 ? "font-medium" : "text-muted-foreground"} hidden sm:inline`}>{l}</span>
          {i < labels.length - 1 && <div className="w-6 h-px bg-border" />}
        </div>
      ))}
    </div>
  );
}

function Section({ title, children, onBack }: { title: string; children: React.ReactNode; onBack?: () => void }) {
  return (
    <Card className="border-border/60">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {onBack && <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function SelectCard({ selected, onClick, title, sub }: { selected: boolean; onClick: () => void; title: string; sub: string }) {
  return (
    <button onClick={onClick} className={`text-left rounded-xl border p-4 transition hover:border-primary hover:shadow-elegant ${selected ? "border-primary bg-primary-soft" : "border-border"}`}>
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-muted-foreground mt-1">{sub}</div>
    </button>
  );
}

function Empty({ children }: { children: React.ReactNode }) { return <p className="text-sm text-muted-foreground">{children}</p>; }
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border-b border-border pb-2 last:border-0"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}
