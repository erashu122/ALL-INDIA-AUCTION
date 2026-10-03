import { SectionHeading } from "@/components/layout";
import { Card, Container, Section } from "@/components/ui";

const exampleQuestions = [
  "How do I create a reverse auction?",
  "What documents do I need?",
  "How do I participate in an auction?",
] as const;

export function AiAssistantPreviewSection() {
  return (
    <Section>
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <SectionHeading
            description="A non-connected preview of future help experiences. No AI service is implemented in this step."
            eyebrow="Assistant preview"
            title="Need help? Ask our AI Auction Assistant"
          />
          <Card>
            <div className="grid gap-3">
              {exampleQuestions.map((question) => (
                <button
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-4 py-3 text-left text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled
                  key={question}
                  type="button"
                >
                  {question}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
