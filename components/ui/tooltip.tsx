import { cn } from "@/lib/utils";

type TooltipProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

export function Tooltip({ label, children, className }: TooltipProps) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      {children}
      <span
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-sm)] bg-[var(--color-secondary)] px-2 py-1 text-xs text-white group-hover:block group-focus-within:block"
        role="tooltip"
      >
        {label}
      </span>
    </span>
  );
}
