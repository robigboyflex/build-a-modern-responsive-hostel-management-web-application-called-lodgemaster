import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function DeadlineCountdown({ deadline, label }: { deadline?: string | null; label: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  if (!deadline) return null;
  const end = new Date(deadline).getTime();
  const ms = end - now;
  const expired = ms <= 0;
  const hoursLeft = ms / 3600_000;
  const critical = hoursLeft <= 24 && !expired;
  const days = Math.floor(hoursLeft / 24);
  const hours = Math.max(0, Math.floor(hoursLeft % 24));
  const text = expired
    ? "Deadline passed"
    : days > 0
      ? `${days}d ${hours}h left`
      : hoursLeft >= 1
        ? `${Math.floor(hoursLeft)}h left`
        : `${Math.max(1, Math.floor(ms / 60_000))}m left`;
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4",
        expired
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : critical
            ? "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100"
            : "border-border bg-muted/40",
      )}
    >
      {expired || critical ? (
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
      ) : (
        <Clock className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
      )}
      <div className="text-sm">
        <div className="font-semibold">{label}</div>
        <div className="opacity-90">
          {text} · due {new Date(deadline).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
        </div>
      </div>
    </div>
  );
}
