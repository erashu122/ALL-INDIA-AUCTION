import { Badge, Container, Section } from "@/components/ui";
import { CtaLink } from "./cta-link";
import { HeroWorkflowVisual } from "./hero-workflow-visual";

export function HomeHero() {
  return (
    <Section className="bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fb_100%)]">
      <Container className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <Badge variant="primary">B2B auction and procurement platform</Badge>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-[var(--color-text)] sm:text-5xl">
            Smarter B2B Auctions & Procurement
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--color-text-muted)]">
            Create, manage and participate in competitive business auctions
            through one simple digital platform.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CtaLink href="/client/auctions/create">Create an Auction</CtaLink>
            <CtaLink href="/auctions" variant="outline">
              Find Auctions
            </CtaLink>
          </div>
        </div>
        <HeroWorkflowVisual />
      </Container>
    </Section>
  );
}
