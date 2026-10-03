import { SectionHeading } from "@/components/layout";
import { Container, Section } from "@/components/ui";

const steps = [
  {
    number: "01",
    title: "Create",
    description: "Client creates an auction.",
  },
  {
    number: "02",
    title: "Review",
    description: "Auction is reviewed/approved when required.",
  },
  {
    number: "03",
    title: "Participate",
    description: "Eligible vendors participate and submit bids.",
  },
  {
    number: "04",
    title: "Complete",
    description: "Auction closes and results are generated.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <Section className="bg-white" id="how-it-works">
      <Container>
        <SectionHeading
          description="A simple high-level flow for the public website. Full workflow logic will be added later."
          eyebrow="How it works"
          title="From setup to completion"
        />
        <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li
              className="relative rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5"
              key={step.number}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[#dff5f2] text-sm font-semibold text-[var(--color-primary-strong)]">
                {step.number}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-[var(--color-text)]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
