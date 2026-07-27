import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentBooking, statusLabel } from "@/lib/hooks";

export const Route = createFileRoute("/_authenticated/registration")({
  head: () => ({ meta: [{ title: "My Registration — LodgeMaster" }, { name: "description", content: "Track your accommodation registration." }] }),
  component: Reg,
});

function Reg() {
  const { booking, loading } = useCurrentBooking();
  if (loading) return <p>Loading...</p>;
  if (!booking) return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">No booking yet.</p>
      <Link to="/book"><Button>Start booking</Button></Link>
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">My Registration</h1>
        <p className="text-muted-foreground mt-1">Your accommodation details.</p>
      </div>
      <Card className="border-border/60">
        <CardHeader className="flex-row justify-between items-center">
          <CardTitle>Application</CardTitle>
          <Badge>{statusLabel(booking.status)}</Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          <Row label="Room Type" value={booking.room_types?.name ?? "—"}/>
          <Row label="Block" value={booking.blocks?.name ?? "—"}/>
          <Row label="Floor" value={booking.floors?.name ?? "—"}/>
          <Row label="Room" value={booking.rooms?.room_number ?? "—"}/>
          <Row label="Fee" value={`GHS ${Number(booking.fee ?? 0).toFixed(2)}`}/>
          {booking.manager_notes && (
            <div className="rounded-lg bg-muted/40 border border-border p-3 text-sm mt-3"><b>Manager note: </b>{booking.manager_notes}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
function Row({ label, value }: any) { return <div className="flex justify-between border-b border-border pb-2 last:border-0"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>; }
