import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentBooking } from "@/lib/hooks";
import { toast } from "sonner";
import { BedDouble } from "lucide-react";

export const Route = createFileRoute("/_authenticated/select-room")({
  head: () => ({ meta: [{ title: "Select Room — LodgeMaster" }, { name: "description", content: "Pick your specific room." }] }),
  component: SelectRoom,
});

function SelectRoom() {
  const { booking, reload } = useCurrentBooking();
  const nav = useNavigate();
  const [rooms, setRooms] = useState<any[]>([]);
  const [pick, setPick] = useState<string | null>(null);

  useEffect(() => {
    if (!booking?.room_type_id || !booking?.block_id || !booking?.floor_id) return;
    supabase.from("rooms").select("*").eq("room_type_id", booking.room_type_id).eq("block_id", booking.block_id).eq("floor_id", booking.floor_id).then(({ data }) => setRooms(data ?? []));
  }, [booking]);

  const confirm = async () => {
    if (!pick || !booking) return;
    const { error } = await supabase.from("bookings").update({ room_id: pick, status: "pending_verification" }).eq("id", booking.id);
    if (error) return toast.error(error.message);
    toast.success("Room selected. Awaiting manager verification.");
    await reload();
    nav({ to: "/registration" });
  };

  if (!booking) return <p>No booking found. <Link to="/book" className="text-primary underline">Start one</Link>.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Select Your Room</h1>
        <p className="text-muted-foreground mt-1">Only available rooms are shown.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.length === 0 && <p className="text-muted-foreground">No rooms available in this section.</p>}
        {rooms.map((r) => {
          const available = r.capacity - r.occupied;
          const isAvail = r.status === "available" && available > 0;
          return (
            <button key={r.id} disabled={!isAvail} onClick={() => setPick(r.id)}
              className={`text-left rounded-xl border p-5 transition ${pick === r.id ? "border-primary bg-primary-soft shadow-elegant" : "border-border"} ${!isAvail ? "opacity-50 cursor-not-allowed" : "hover:border-primary"}`}>
              <div className="flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary"><BedDouble className="h-5 w-5"/></div>
                <Badge variant={isAvail ? "default" : "secondary"}>{r.status}</Badge>
              </div>
              <div className="mt-4 text-lg font-bold">Room {r.room_number}</div>
              <div className="text-sm text-muted-foreground mt-1">Capacity: {r.capacity} · Occupied: {r.occupied} · Available: {available}</div>
            </button>
          );
        })}
      </div>

      <Button disabled={!pick} onClick={confirm}>Confirm selection</Button>
    </div>
  );
}
