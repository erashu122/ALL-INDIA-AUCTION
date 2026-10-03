import { PublicFooter, PublicHeader } from "@/components/layout";
import { AiAssistantPreviewSection } from "./ai-assistant-preview-section";
import { AuctionDiscoverySection } from "./auction-discovery-section";
import { CapabilitiesSection } from "./capabilities-section";
import { FinalCtaSection } from "./final-cta-section";
import { HomeHero } from "./home-hero";
import { HowItWorksSection } from "./how-it-works-section";
import { RoleEntrySection } from "./role-entry-section";
import { TrustBenefitsSection } from "./trust-benefits-section";

export function PublicHomePage() {
  return (
    <>
      <PublicHeader />
      <main>
        <HomeHero />
        <RoleEntrySection />
        <CapabilitiesSection />
        <HowItWorksSection />
        <AuctionDiscoverySection />
        <TrustBenefitsSection />
        <AiAssistantPreviewSection />
        <FinalCtaSection />
      </main>
      <PublicFooter />
    </>
  );
}
