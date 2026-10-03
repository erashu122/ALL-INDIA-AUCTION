import { cn } from "@/lib/utils";

type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({ label = "Loading", className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-4 text-sm text-[var(--color-text-muted)]",
        className,
      )}
      role="status"
    >
      <span className="h-3 w-3 rounded-full bg-[var(--color-primary)]" />
      {label}
    </div>
  );
}
