import { Badge } from "./ui";

const tone = { ACTIVE: "green", ON_LEAVE: "amber", TERMINATED: "red" } as const;

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={(tone as any)[status] ?? "slate"}>{status.replace("_", " ")}</Badge>;
}
