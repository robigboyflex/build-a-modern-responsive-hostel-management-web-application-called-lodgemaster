import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrentBooking, deadlineFromNow } from "@/lib/hooks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, Wallet } from "lucide-react";
import { DeadlineCountdown } from "@/components/deadline-countdown";

export const Route = createFileRoute("/_authenticated/payment")({
  head: () => ({ meta: [{ title: "Payment — LodgeMaster" }, { name: "description", content: "Complete your accommodation payment." }] }),
  component: Payment,
});

function Payment() {
  const { booking, loading, reload } = useCurrentBooking();
  const nav = useNavigate();

  if (loading) return <div className="p-8">Loading...</div>;
  if (!booking) return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">No active booking. Start one to see payment details.</p>
      <Link to="/book"><Button>Book now</Button></Link>
    </div>
  );

  const expired = booking.status === "expired";

  const markPaid = async () => {
    const { error } = await supabase.from("bookings").update({
      status: "pending_documents",
      documents_deadline: deadlineFromNow(),
    }).eq("id", booking.id);
    if (error) return toast.error(error.message);
    toast.success("Marked as paid. Please upload your documents.");
    await reload();
    nav({ to: "/documents" });
  };

  const ref = `LM-${booking.id.slice(0, 8).toUpperCase()}`;
  const deadlineDisplay = booking.payment_deadline
    ? new Date(booking.payment_deadline).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "—";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Hostel Payment</h1>
        <p className="text-muted-foreground mt-1">Send payment then confirm below.</p>
      </div>

      <DeadlineCountdown deadline={booking.payment_deadline} label="Payment deadline" />

      <Card className="border-border/60">
        <CardHeader><CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5 text-primary"/>Payment details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Row label="Account Name" value="LodgeMaster Hostels Ltd" />
          <Row label="Bank" value="GCB Bank" />
          <Row label="Account Number" value="1234-5678-9012" />
          <Row label="Mobile Money Number" value="+233 20 000 0000" />
          <Row label="Reference Number" value={ref} />
          <Row label="Amount to Pay" value={`GHS ${Number(booking.fee ?? 0).toFixed(2)}`} />
          <Row label="Payment Deadline" value={deadlineDisplay} />
        </CardContent>
      </Card>

      <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-warning-foreground shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-warning-foreground">Important notice</div>
          <p className="text-sm text-warning-foreground/90">Complete payment before the deadline or your booking will expire.</p>
        </div>
      </div>

      {expired ? (
        <Link to="/book"><Button size="lg">Start a new booking</Button></Link>
      ) : (
        <Button size="lg" onClick={markPaid}>I Have Made Payment</Button>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border-b border-border pb-2 last:border-0 gap-4"><span className="text-muted-foreground">{label}</span><span className="font-medium text-right">{value}</span></div>;
}
