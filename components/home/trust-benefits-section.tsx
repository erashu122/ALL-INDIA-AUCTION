import { SectionHeading } from "@/components/layout";
import { Card, Container, Section } from "@/components/ui";

const trustBenefits = [
  "Transparent bidding workflow",
  "Secure access",
  "Automated notifications",
  "Centralized documents",
] as const;

export function TrustBenefitsSection() {
  return (
    <Section className="bg-white">
      <Container>
        <SectionHeading
          description="Reserved messaging for trust-oriented platform features as the product matures."
          eyebrow="Trust and platform benefits"
          title="Designed for professional procurement teams"
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trustBenefits.map((benefit) => (
            <Card key={benefit}>
              <div className="h-9 w-9 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]" />
              <h3 className="mt-5 text-base font-semibold text-[var(--color-text)]">
                {benefit}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                Placeholder for future product detail.
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
