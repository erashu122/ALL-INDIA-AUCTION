import { cn } from "@/lib/utils";
import { Button } from "./button";

type DialogPlaceholderProps = {
  title: string;
  description: string;
  actionLabel?: string;
  className?: string;
};

export function DialogPlaceholder({
  title,
  description,
  actionLabel = "Close",
  className,
}: DialogPlaceholderProps) {
  return (
    <div
      aria-labelledby="dialog-placeholder-title"
      aria-modal="true"
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-md)]",
        className,
      )}
      role="dialog"
    >
      <h2
        className="text-lg font-semibold text-[var(--color-text)]"
        id="dialog-placeholder-title"
      >
        {title}
      </h2>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">{description}</p>
      <div className="mt-6 flex justify-end">
        <Button variant="secondary">{actionLabel}</Button>
      </div>
    </div>
  );
}
