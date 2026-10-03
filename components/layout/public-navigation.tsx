import Link from "next/link";

export const publicNavigationItems = [
  { label: "Auctions", href: "/auctions" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export function PublicNavigation() {
  return (
    <nav aria-label="Primary navigation" className="hidden items-center gap-6 lg:flex">
      {publicNavigationItems.map((item) => (
        <Link
          className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
          href={item.href}
          key={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
