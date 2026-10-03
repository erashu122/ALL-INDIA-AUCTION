"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import { createDraftAction, updateDraftAction, type DraftActionState } from "@/app/auctions/actions";
import { Alert, Badge, Button, Card, Input, Select, Textarea } from "@/components/ui";

const initialState: DraftActionState = {};

export type ClientOrganizationOption = { id: string; name: string };

type LotFormValue = {
  description?: string | null;
  id?: string;
  lotNumber: string;
  name: string;
  quantity: string;
  startingPrice?: string | null;
  unit: string;
};

export type DraftFormData = {
  auctionNumber: string;
  autoExtensionEnabled: boolean;
  bidStepAmount?: string | null;
  clientOrganizationId: string;
  clientOrganizationName?: string;
  currency: "INR" | "USD" | "EUR" | "GBP";
  description?: string | null;
  emdAmount?: string | null;
  emdRequired: boolean;
  extensionDurationMinutes?: number | null;
  id: string;
  items: readonly LotFormValue[];
  location?: string | null;
  maximumBidValue?: string | null;
  minimumBidValue?: string | null;
  participationType: "OPEN" | "RESTRICTED";
  scheduledEndAt: string;
  scheduledStartAt: string;
  securityDepositRequirement?: string | null;
  status: string;
  tenderNumber?: string | null;
  timezone: string;
  title: string;
  type: "FORWARD" | "REVERSE" | "RANK";
  updatedAt: string;
  visibility: "PUBLIC" | "PRIVATE";
};

type DraftAuctionFormProps = {
  clientOrganizations?: readonly ClientOrganizationOption[];
  initial?: DraftFormData;
  portal?: "admin" | "client";
};

export function DraftAuctionForm({ clientOrganizations, initial, portal = "client" }: DraftAuctionFormProps) {
  const [lots, setLots] = useState<LotFormValue[]>(() => initial?.items.map((item) => ({ ...item })) ?? [newLot("1")]);
  const updateAction = useMemo(() => (initial ? updateDraftAction.bind(null, initial.id) : undefined), [initial]);
  const [state, action, pending] = useActionState(updateAction ?? createDraftAction, initialState);
  const fieldError = (name: string) => state.errors?.[name];
  const isEditing = Boolean(initial);
  const destination = initial ? `/${portal}/auctions/${initial.id}` : `/${portal}/auctions`;

  function changeLot(index: number, field: keyof LotFormValue, value: string) {
    setLots((current) => current.map((lot, lotIndex) => lotIndex === index ? { ...lot, [field]: value } : lot));
  }

  function addLot() {
    setLots((current) => [...current, newLot(String(current.length + 1))]);
  }

  function removeLot(index: number) {
    setLots((current) => current.length > 1 ? current.filter((_, lotIndex) => lotIndex !== index) : current);
  }

  return (
    <form action={action} className="mx-auto max-w-5xl space-y-6">
      {state.error ? <Alert variant="danger">{state.error}</Alert> : null}
      <input name="itemsPayload" type="hidden" value={JSON.stringify(lots)} />
      {initial ? <input name="updatedAt" type="hidden" value={initial.updatedAt} /> : null}

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">{isEditing ? "Auction draft editor" : "New auction draft"}</p>
            <h1 className="mt-1 text-2xl font-semibold">{initial?.title ?? "Create auction draft"}</h1>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{isEditing ? "Changes remain in draft until a later review workflow is introduced." : "Save a complete draft with one or more lots."}</p>
          </div>
          {initial ? <div className="text-right"><p className="text-sm font-medium">{initial.auctionNumber}</p><Badge variant="warning">{initial.status}</Badge></div> : null}
        </div>
      </Card>

      <Card className="grid gap-4 md:grid-cols-2">
        <SectionTitle title="Basic information" />
        {clientOrganizations ? <Field error={fieldError("clientOrganizationId")} label="Client organization"><Select defaultValue={initial?.clientOrganizationId ?? ""} name="clientOrganizationId" required><option value="">Select client organization</option>{clientOrganizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}</Select></Field> : null}
        {initial && !clientOrganizations ? <ReadOnlyField label="Client organization" value={initial.clientOrganizationName ?? "Assigned client organization"} /> : null}
        <Field className={clientOrganizations || initial ? "" : "md:col-span-2"} error={fieldError("title")} label="Auction title"><Input defaultValue={initial?.title} name="title" required /></Field>
        <Field label="Tender reference"><Input defaultValue={initial?.tenderNumber ?? ""} name="tenderNumber" /></Field>
        <Field label="Location"><Input defaultValue={initial?.location ?? ""} name="location" /></Field>
        <Field className="md:col-span-2" label="Description"><Textarea defaultValue={initial?.description ?? ""} name="description" rows={3} /></Field>
      </Card>

      <Card className="grid gap-4 md:grid-cols-2">
        <SectionTitle title="Auction type and pricing" />
        <Field error={fieldError("type")} label="Auction type"><Select defaultValue={initial?.type ?? "FORWARD"} name="type"><option value="FORWARD">Forward</option><option value="REVERSE">Reverse</option><option value="RANK">Rank-based</option></Select></Field>
        <Field error={fieldError("currency")} label="Currency"><Select defaultValue={initial?.currency ?? "INR"} name="currency"><option value="INR">INR</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option></Select></Field>
        <Field label="Visibility"><Select defaultValue={initial?.visibility ?? "PRIVATE"} name="visibility"><option value="PRIVATE">Private</option><option value="PUBLIC">Public</option></Select></Field>
        <Field error={fieldError("bidStepAmount")} label="Bid increment / decrement"><Input defaultValue={initial?.bidStepAmount ?? ""} inputMode="decimal" name="bidStepAmount" placeholder="Required for forward or reverse" /></Field>
        <Field label="Minimum bid value"><Input defaultValue={initial?.minimumBidValue ?? ""} inputMode="decimal" name="minimumBidValue" /></Field>
        <Field error={fieldError("maximumBidValue")} label="Maximum bid value"><Input defaultValue={initial?.maximumBidValue ?? ""} inputMode="decimal" name="maximumBidValue" /></Field>
      </Card>

      <Card className="grid gap-4 md:grid-cols-2">
        <SectionTitle title="Schedule" />
        <Field error={fieldError("scheduledStartAt")} label="Scheduled start"><Input defaultValue={toDateTimeInput(initial?.scheduledStartAt)} name="scheduledStartAt" required type="datetime-local" /></Field>
        <Field error={fieldError("endAt")} label="Scheduled end"><Input defaultValue={toDateTimeInput(initial?.scheduledEndAt)} name="endAt" required type="datetime-local" /></Field>
        <Field label="Timezone"><Input defaultValue={initial?.timezone ?? "Asia/Kolkata"} name="timezone" required /></Field>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Lots and items</h2><p className="mt-1 text-sm text-[var(--color-text-muted)]">Every auction requires at least one uniquely numbered lot.</p></div><Button onClick={addLot} type="button" variant="outline">Add lot</Button></div>
        {fieldError("items") ? <Alert variant="danger">{fieldError("items")}</Alert> : null}
        <div className="space-y-4">
          {lots.map((lot, index) => <Card className="bg-[var(--color-surface-muted)] p-4 shadow-none" key={lot.id ?? `${lot.lotNumber}-${index}`}>
            <div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-medium">Lot {index + 1}</h3><Button disabled={lots.length === 1} onClick={() => removeLot(index)} size="sm" type="button" variant="ghost">Remove</Button></div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field error={fieldError(`item-${index}`)} label="Lot number"><Input onChange={(event) => changeLot(index, "lotNumber", event.target.value)} value={lot.lotNumber} /></Field>
              <Field error={fieldError(`item-${index}`)} label="Item name"><Input onChange={(event) => changeLot(index, "name", event.target.value)} value={lot.name} /></Field>
              <Field error={fieldError(`item-${index}`)} label="Quantity"><Input inputMode="decimal" onChange={(event) => changeLot(index, "quantity", event.target.value)} value={lot.quantity} /></Field>
              <Field error={fieldError(`item-${index}`)} label="Unit"><Input onChange={(event) => changeLot(index, "unit", event.target.value)} value={lot.unit} /></Field>
              <Field label="Starting price"><Input inputMode="decimal" onChange={(event) => changeLot(index, "startingPrice", event.target.value)} value={lot.startingPrice ?? ""} /></Field>
              <Field className="md:col-span-2" label="Item description"><Textarea onChange={(event) => changeLot(index, "description", event.target.value)} rows={2} value={lot.description ?? ""} /></Field>
            </div>
          </Card>)}
        </div>
      </Card>

      <Card className="grid gap-4 md:grid-cols-2">
        <SectionTitle title="EMD, eligibility and extension rules" />
        <Field label="Participation"><Select defaultValue={initial?.participationType ?? "RESTRICTED"} name="participationType"><option value="RESTRICTED">Restricted</option><option value="OPEN">Open</option></Select></Field>
        <Field error={fieldError("emdAmount")} label="EMD amount"><Input defaultValue={initial?.emdAmount ?? ""} inputMode="decimal" name="emdAmount" /></Field>
        <Field className="md:col-span-2" label="Security/deposit requirement"><Textarea defaultValue={initial?.securityDepositRequirement ?? ""} name="securityDepositRequirement" rows={2} /></Field>
        <Field error={fieldError("extensionDurationMinutes")} label="Extension minutes"><Input defaultValue={initial?.extensionDurationMinutes ?? ""} inputMode="numeric" name="extensionDurationMinutes" /></Field>
        <label className="flex items-center gap-2 self-end text-sm"><input defaultChecked={initial?.emdRequired} name="emdRequired" type="checkbox" /> Require EMD</label>
        <label className="flex items-center gap-2 self-end text-sm"><input defaultChecked={initial?.autoExtensionEnabled} name="autoExtensionEnabled" type="checkbox" /> Enable auto-extension</label>
      </Card>

      <div className="flex flex-wrap justify-end gap-3"><Link className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-4 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]" href={destination}>Cancel</Link><Button disabled={pending} size="lg" type="submit">{pending ? "Saving draft..." : "Save draft"}</Button></div>
    </form>
  );
}

function newLot(lotNumber: string): LotFormValue {
  return { lotNumber, name: "", quantity: "", unit: "", startingPrice: "", description: "" };
}

function toDateTimeInput(value: string | undefined) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="md:col-span-2 text-lg font-semibold">{title}</h2>;
}

function Field({ children, className, error, label }: { children: React.ReactNode; className?: string; error?: string; label: string }) {
  return <label className={className}><span className="mb-2 block text-sm font-medium">{label}</span>{children}{error ? <span className="mt-1 block text-xs text-[var(--color-danger)]">{error}</span> : null}</label>;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return <div><span className="mb-2 block text-sm font-medium">{label}</span><p className="h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm">{value}</p></div>;
}
