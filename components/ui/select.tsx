import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)] disabled:cursor-not-allowed disabled:bg-[var(--color-surface-muted)] disabled:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
