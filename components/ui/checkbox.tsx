import { cn } from "@/lib/utils";

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      className={cn(
        "h-4 w-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] accent-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      type="checkbox"
      {...props}
    />
  );
}
