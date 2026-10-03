import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  className?: string;
};

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-white p-8 text-center",
        className,
      )}
    >
      <h3 className="text-base font-semibold text-[var(--color-text)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">{description}</p>
    </div>
  );
}
