import { cn } from "@/lib/utils";

type AlertVariant = "info" | "success" | "warning" | "danger";

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
};

const variants: Record<AlertVariant, string> = {
  info: "border-[#bfdbfe] bg-[#eff6ff] text-[#1e3a8a]",
  success: "border-[#abefc6] bg-[#ecfdf3] text-[var(--color-success)]",
  warning: "border-[#fedf89] bg-[#fffbeb] text-[var(--color-warning)]",
  danger: "border-[#fecdca] bg-[#fffbfa] text-[var(--color-danger)]",
};

export function Alert({ className, variant = "info", ...props }: AlertProps) {
  return (
    <div
      className={cn("rounded-[var(--radius-md)] border p-4 text-sm", variants[variant], className)}
      role="status"
      {...props}
    />
  );
}
