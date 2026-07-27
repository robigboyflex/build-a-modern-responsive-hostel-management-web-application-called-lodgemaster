import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/crud-page";

export const Route = createFileRoute("/_authenticated/manager/room-types")({
  head: () => ({ meta: [{ title: "Room Types — LodgeMaster" }, { name: "description", content: "Manage room types." }] }),
  component: () => (
    <CrudPage
      title="Room Types" table="room_types"
      fields={[
        { key: "name", label: "Name" },
        { key: "capacity", label: "Capacity", type: "number" },
        { key: "fee", label: "Fee", type: "number" },
        { key: "description", label: "Description" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "capacity", label: "Capacity" },
        { key: "fee", label: "Fee", render: (r) => `GHS ${Number(r.fee).toFixed(2)}` },
      ]}
    />
  ),
});
