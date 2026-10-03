import { Card, Container, Section } from "@/components/ui";
import { CtaLink } from "./cta-link";

const roleEntries = [
  {
    role: "Client",
    title: "Run an Auction",
    description:
      "Create and manage your buying or selling auction with guided steps and administrative control.",
    cta: "Create an Auction",
    href: "/client/auctions/create",
  },
  {
    role: "Vendor",
    title: "Find & Bid",
    description:
      "Discover relevant opportunities, review complete auction details and participate securely.",
    cta: "Explore Auctions",
    href: "/auctions",
  },
] as const;

export function RoleEntrySection() {
  return (
    <Section className="bg-white">
      <Container>
        <div className="grid gap-5 md:grid-cols-2">
          {roleEntries.map((entry) => (
            <Card key={entry.role}>
              <p className="text-sm font-semibold uppercase text-[var(--color-primary)]">
                {entry.role}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--color-text)]">
                {entry.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                {entry.description}
              </p>
              <CtaLink className="mt-6 h-10 text-sm" href={entry.href}>
                {entry.cta}
              </CtaLink>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
