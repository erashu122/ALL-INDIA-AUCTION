import { Container, Section } from "@/components/ui";
import { CtaLink } from "./cta-link";

export function FinalCtaSection() {
  return (
    <Section>
      <Container>
        <div className="rounded-[var(--radius-lg)] bg-[var(--color-secondary)] p-8 text-white sm:p-10">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Ready to run your next auction?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
            Start from the client journey or explore auction opportunities from
            the public discovery route.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <CtaLink href="/client/auctions/create" variant="light">
              Create an Auction
            </CtaLink>
            <CtaLink
              className="border border-white/25 bg-transparent text-white hover:bg-white/10"
              href="/auctions"
              variant="secondary"
            >
              Explore Auctions
            </CtaLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
