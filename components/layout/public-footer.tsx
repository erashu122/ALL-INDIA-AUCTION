import Link from "next/link";
import { Container } from "@/components/ui";

const footerSections = [
  {
    title: "Platform",
    links: [
      { label: "Auctions", href: "/auctions" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Services", href: "/services" },
    ],
  },
  {
    title: "For Clients",
    links: [
      { label: "Client Portal", href: "/client" },
      { label: "Create Auction", href: "/client/auctions/create" },
    ],
  },
  {
    title: "For Vendors",
    links: [
      { label: "Vendor Portal", href: "/vendor" },
      { label: "Available Auctions", href: "/vendor/auctions" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [{ label: "Help Center", href: "/contact" }],
  },
  {
    title: "Legal",
    links: [{ label: "Legal Placeholder", href: "/contact" }],
  },
] as const;

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white">
      <Container className="py-12" size="wide">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {footerSections.map((section) => (
            <nav aria-label={section.title} key={section.title}>
              <h2 className="text-sm font-semibold text-[var(--color-text)]">
                {section.title}
              </h2>
              <ul className="mt-4 grid gap-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-10 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-text-muted)]">
          Procurex Auction. Temporary brand placeholder.
        </div>
      </Container>
    </footer>
  );
}
