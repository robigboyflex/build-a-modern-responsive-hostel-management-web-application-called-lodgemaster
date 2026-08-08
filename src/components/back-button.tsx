import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
        else router.navigate({ to: "/" });
      }}
    >
      <ArrowLeft className="h-4 w-4 mr-1" /> Back
    </Button>
  );
}
