import type { ReactNode } from "react";

import {
  Button,
  Card,
  Checkbox,
  Input,
  Radio,
  Select,
  Textarea,
} from "@/components/ui";
import { AUCTION_TYPES } from "@/types/auction";

const sections = [
  "Basic information",
  "Auction type",
  "Item / lot details",
  "Pricing rules",
  "Timing",
  "EMD",
  "Vendor eligibility",
  "Documents",
  "Photos / videos",
  "Review and submit",
] as const;

const managementTabs = [
  "Overview",
  "Auction information",
  "Items",
  "Documents",
  "Media",
  "Vendor participation",
  "EMD",
  "Bids",
  "Results",
  "Activity / audit",
] as const;

function sectionId(section: string) {
  return section
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function AuctionCreateWorkspace() {
  return (
    <section className="mx-auto w-full max-w-7xl">
      <header className="border-b border-[var(--color-border)] pb-6">
        <p className="text-sm font-medium text-[var(--color-primary)]">
          Platform operations
        </p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
          Create auction
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
          Prepare the auction workspace. Submission and persistence are intentionally
          not enabled yet.
        </p>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav
          aria-label="Auction setup sections"
          className="h-fit rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-2 lg:sticky lg:top-6"
        >
          {sections.map((section, index) => (
            <a
              className={
                index === 0
                  ? "block rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-white"
                  : "block rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
              }
              href={`#${sectionId(section)}`}
              key={section}
            >
              {index + 1}. {section}
            </a>
          ))}
        </nav>

        <div className="space-y-6">
          <Card id="basic-information">
            <h2 className="text-lg font-semibold">Basic information</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Auction number">
                <Input placeholder="Assigned when the auction is created" disabled />
              </Field>
              <Field label="Tender number">
                <Input placeholder="Optional client reference" />
              </Field>
              <Field className="md:col-span-2" label="Auction title">
                <Input placeholder="Enter a clear auction title" />
              </Field>
              <Field label="Category"><Input placeholder="Select or enter a category" /></Field>
              <Field label="Location"><Input placeholder="Auction or delivery location" /></Field>
              <Field className="md:col-span-2" label="Description">
                <Textarea placeholder="Describe the scope, requirements, and context" rows={4} />
              </Field>
            </div>
          </Card>

          <Card id="auction-type">
            <h2 className="text-lg font-semibold">Auction type</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              The selected type controls the pricing model in the final workflow.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {AUCTION_TYPES.map((type) => (
                <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4" key={type}>
                  <Radio defaultChecked={type === "FORWARD"} name="auction-type" value={type} />
                  <span>
                    <span className="block text-sm font-medium">{type[0] + type.slice(1).toLowerCase()}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--color-text-muted)]">
                      {type === "FORWARD" ? "Price moves upward." : type === "REVERSE" ? "Price moves downward." : "Rank-based evaluation."}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </Card>

          <Card id="item-lot-details">
            <h2 className="text-lg font-semibold">Item / lot details</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Item name"><Input placeholder="Name of the item or lot" /></Field>
              <Field label="Unit"><Input placeholder="For example, units or tonnes" /></Field>
              <Field label="Quantity"><Input inputMode="decimal" placeholder="0" /></Field>
              <Field label="Specifications"><Textarea placeholder="Technical or commercial specifications" rows={3} /></Field>
            </div>
          </Card>

          <Card id="pricing-rules">
            <h2 className="text-lg font-semibold">Pricing rules</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Currency"><Select defaultValue="INR"><option value="INR">INR</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option></Select></Field>
              <Field label="Starting price"><Input inputMode="decimal" placeholder="0.00" /></Field>
              <Field label="Bid increment / decrement"><Input inputMode="decimal" placeholder="0.00" /></Field>
              <Field label="Minimum bid value"><Input inputMode="decimal" placeholder="Optional" /></Field>
            </div>
          </Card>

          <Card id="timing">
            <h2 className="text-lg font-semibold">Timing</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Scheduled start"><Input type="datetime-local" /></Field>
              <Field label="Scheduled end"><Input type="datetime-local" /></Field>
              <Field label="Participation deadline"><Input type="datetime-local" /></Field>
              <Field label="Timezone"><Select defaultValue="Asia/Kolkata"><option value="Asia/Kolkata">Asia/Kolkata</option></Select></Field>
            </div>
            <label className="mt-5 flex items-center gap-2 text-sm"><Checkbox /> Enable automatic extension</label>
          </Card>

          <Card id="emd">
            <h2 className="text-lg font-semibold">EMD and security</h2>
            <label className="mt-5 flex items-center gap-2 text-sm"><Checkbox /> Require EMD</label>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="EMD amount"><Input inputMode="decimal" placeholder="0.00" /></Field>
              <Field label="Security / deposit requirement"><Input placeholder="Optional requirement" /></Field>
            </div>
          </Card>

          <Card id="vendor-eligibility">
            <h2 className="text-lg font-semibold">Vendor eligibility</h2>
            <div className="mt-4 flex flex-wrap gap-5 text-sm">
              <label className="flex items-center gap-2"><Radio defaultChecked name="participation" value="OPEN" /> Open participation</label>
              <label className="flex items-center gap-2"><Radio name="participation" value="RESTRICTED" /> Restricted participation</label>
            </div>
            <div className="mt-4"><Field label="Eligibility requirements"><Textarea placeholder="Record eligibility requirements for the final workflow" rows={3} /></Field></div>
          </Card>

          <Card id="documents"><h2 className="text-lg font-semibold">Documents</h2><p className="mt-2 text-sm text-[var(--color-text-muted)]">Document upload and storage will be connected in a later step.</p></Card>
          <Card id="photos-videos"><h2 className="text-lg font-semibold">Photos / videos</h2><p className="mt-2 text-sm text-[var(--color-text-muted)]">Media upload and storage will be connected in a later step.</p></Card>
          <Card id="review-and-submit">
            <h2 className="text-lg font-semibold">Review and submit</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">The review and submission workflow will be enabled when auction creation logic is implemented.</p>
            <div className="mt-5 flex flex-wrap gap-3"><Button disabled variant="outline">Save draft</Button><Button disabled>Submit for review</Button></div>
          </Card>
        </div>
      </div>
    </section>
  );
}

export function AuctionManagementWorkspace({ auctionId }: { auctionId: string }) {
  return (
    <section className="mx-auto w-full max-w-7xl">
      <header className="border-b border-[var(--color-border)] pb-6">
        <p className="text-sm font-medium text-[var(--color-primary)]">Auction management</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Auction workspace</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">Reference: {auctionId}</p>
      </header>
      <div className="mt-6 overflow-x-auto border-b border-[var(--color-border)]">
        <div aria-label="Auction management" className="flex min-w-max gap-1" role="tablist">
          {managementTabs.map((tab, index) => (
            <button aria-selected={index === 0} className={index === 0 ? "border-b-2 border-[var(--color-primary)] px-3 py-3 text-sm font-medium text-[var(--color-primary)]" : "px-3 py-3 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"} key={tab} role="tab" type="button">{tab}</button>
          ))}
        </div>
      </div>
      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Overview</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">Auction data is not available yet. This workspace is prepared for the managed auction record, related documents, participation, EMD, bids, results, and audit activity.</p>
      </Card>
    </section>
  );
}

function Field({ children, className, label }: { children: ReactNode; className?: string; label: string }) {
  return <label className={className}><span className="mb-2 block text-sm font-medium">{label}</span>{children}</label>;
}
