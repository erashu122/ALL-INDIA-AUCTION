import { cn } from "@/lib/utils";

type RadioProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

export function Radio({ className, ...props }: RadioProps) {
  return (
    <input
      className={cn(
        "h-4 w-4 border border-[var(--color-border)] accent-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      type="radio"
      {...props}
    />
  );
}
