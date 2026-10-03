import Link from "next/link";
import { publicNavigationItems } from "./public-navigation";

export function MobileNavigation() {
  return (
    <details className="group relative lg:hidden">
      <summary className="flex h-10 cursor-pointer list-none items-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 text-sm font-medium text-[var(--color-text)] marker:hidden">
        Menu
      </summary>
      <div className="absolute right-0 top-12 z-20 grid w-64 gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-2 shadow-[var(--shadow-md)]">
        {publicNavigationItems.map((item) => (
          <Link
            className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
        <div className="my-1 border-t border-[var(--color-border)]" />
        <Link
          className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
          href="/login"
        >
          Login
        </Link>
        <Link
          className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-strong)]"
          href="/register"
        >
          Register
        </Link>
      </div>
    </details>
  );
}
