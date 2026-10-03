import { SectionHeading } from "@/components/layout";
import {
  Badge,
  Card,
  Container,
  EmptyState,
  Input,
  Section,
  Select,
} from "@/components/ui";

const statuses = ["Live", "Upcoming", "Completed"] as const;

export function AuctionDiscoverySection() {
  return (
    <Section>
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <SectionHeading
            description="Search and filtering UI is prepared for future real auction opportunities."
            eyebrow="Auction discovery"
            title="Explore Auctions"
          />
          <Card>
            <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
              <label className="grid gap-2 text-sm font-medium text-[var(--color-text)]">
                Search auctions
                <Input placeholder="Search by auction title or category" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[var(--color-text)]">
                Filters
                <Select defaultValue="">
                  <option value="" disabled>
                    Filter placeholder
                  </option>
                </Select>
              </label>
            </div>
            <div className="mt-5 flex flex-wrap gap-2" role="list">
              {statuses.map((status) => (
                <Badge key={status} variant="neutral">
                  {status}
                </Badge>
              ))}
            </div>
            <EmptyState
              className="mt-6"
              description="Auction opportunities will appear here when real listings are available."
              title="No auction records shown"
            />
          </Card>
        </div>
      </Container>
    </Section>
  );
}
