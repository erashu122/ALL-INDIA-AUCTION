import { Badge, Card } from "@/components/ui";

const workflowItems = [
  "Auction setup",
  "Vendor participation",
  "Bid review",
] as const;

export function HeroWorkflowVisual() {
  return (
    <Card className="relative overflow-hidden p-0">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[var(--color-text)]">
            Digital auction workflow
          </p>
          <Badge variant="primary">Preview</Badge>
        </div>
      </div>
      <div className="p-5">
        <div className="grid gap-4">
          {workflowItems.map((item, index) => (
            <div
              className="grid grid-cols-[2.5rem_1fr] items-center gap-4"
              key={item}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[#dff5f2] text-sm font-semibold text-[var(--color-primary-strong)]">
                {index + 1}
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-[var(--color-text)]">
                    {item}
                  </p>
                  <span className="h-2 w-16 rounded-full bg-[var(--color-surface-muted)]" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
          <p className="text-sm font-medium text-[var(--color-text)]">
            Structured procurement event workspace
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Original UI placeholder for future auction operations.
          </p>
        </div>
      </div>
    </Card>
  );
}
