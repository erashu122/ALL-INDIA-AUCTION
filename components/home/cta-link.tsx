import Link from "next/link";
import { cn } from "@/lib/utils";

type CtaLinkVariant = "primary" | "secondary" | "outline" | "light";

type CtaLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: CtaLinkVariant;
  className?: string;
};

const variants: Record<CtaLinkVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-strong)]",
  secondary:
    "bg-[var(--color-secondary)] text-white hover:bg-[#1c2c46]",
  outline:
    "border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]",
  light:
    "bg-white text-[var(--color-secondary)] hover:bg-[var(--color-surface-muted)]",
};

export function CtaLink({
  href,
  children,
  variant = "primary",
  className,
}: CtaLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] px-5 text-base font-medium transition-colors",
        variants[variant],
        className,
      )}
      href={href}
    >
      {children}
    </Link>
  );
}
