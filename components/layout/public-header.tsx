import Link from "next/link";
import { MobileNavigation } from "./mobile-navigation";
import { PublicNavigation } from "./public-navigation";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-6">
        <Link
          aria-label="Go to homepage"
          className="text-base font-semibold tracking-normal text-[var(--color-text)]"
          href="/"
        >
          Procurex Auction
        </Link>
        <PublicNavigation />
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            href="/login"
          >
            Login
          </Link>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-medium text-white hover:bg-[var(--color-primary-strong)]"
            href="/register"
          >
            Register
          </Link>
        </div>
        <MobileNavigation />
      </div>
    </header>
  );
}
