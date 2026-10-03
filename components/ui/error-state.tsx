import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title: string;
  description: string;
  className?: string;
};

export function ErrorState({ title, description, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[#fecdca] bg-[#fffbfa] p-6",
        className,
      )}
      role="alert"
    >
      <h3 className="text-base font-semibold text-[var(--color-danger)]">{title}</h3>
      <p className="mt-2 text-sm text-[#912018]">{description}</p>
    </div>
  );
}
