import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/crud-page";

export const Route = createFileRoute("/_authenticated/manager/blocks")({
  head: () => ({ meta: [{ title: "Blocks — LodgeMaster" }, { name: "description", content: "Manage blocks." }] }),
  component: () => (
    <CrudPage title="Blocks" table="blocks"
      fields={[{ key: "name", label: "Name" }, { key: "description", label: "Description" }]}
      columns={[{ key: "name", label: "Name" }, { key: "description", label: "Description" }]}
    />
  ),
});
