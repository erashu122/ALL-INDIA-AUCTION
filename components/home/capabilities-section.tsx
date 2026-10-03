import { SectionHeading } from "@/components/layout";
import { Card, Container, Section } from "@/components/ui";

const capabilities = [
  {
    title: "Forward Auctions",
    description: "Support for seller-led auction event structures.",
  },
  {
    title: "Reverse Auctions",
    description: "Support for buyer-led competitive procurement events.",
  },
  {
    title: "Rank Auctions",
    description: "A future surface for rank-based bid comparison workflows.",
  },
  {
    title: "Automated Auction Management",
    description: "Reusable UI space for event setup, review and completion.",
  },
] as const;

export function CapabilitiesSection() {
  return (
    <Section>
      <Container>
        <SectionHeading
          description="Concise platform capabilities for future auction and procurement workflows."
          eyebrow="Platform capabilities"
          title="Built around business auction workflows"
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((capability) => (
            <Card key={capability.title}>
              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                {capability.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                {capability.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
