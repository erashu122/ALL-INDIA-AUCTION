import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "danger";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]",
  primary: "bg-[#dff5f2] text-[var(--color-primary-strong)]",
  success: "bg-[#dcfae6] text-[var(--color-success)]",
  warning: "bg-[#fff1d6] text-[var(--color-warning)]",
  danger: "bg-[#fee4e2] text-[var(--color-danger)]",
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function StatusBadge(props: BadgeProps) {
  return <Badge {...props} />;
}
