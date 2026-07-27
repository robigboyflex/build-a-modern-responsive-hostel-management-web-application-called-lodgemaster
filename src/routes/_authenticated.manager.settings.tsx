import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/manager/settings")({
  head: () => ({ meta: [{ title: "Settings — LodgeMaster" }, { name: "description", content: "Manager settings." }] }),
  component: () => (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card className="border-border/60"><CardHeader><CardTitle>Hostel Settings</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">Configuration options coming soon. Use the sidebar to manage rooms, blocks, floors, and applications.</p></CardContent>
      </Card>
    </div>
  ),
});
