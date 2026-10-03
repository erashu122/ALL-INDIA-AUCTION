import { randomUUID } from "node:crypto";

import { Prisma } from "@prisma/client";

import { roleHasPermission } from "../lib/permissions.ts";
import { prisma } from "../lib/prisma.ts";
import type { AuthenticatedUser } from "../types/auth.ts";

export type DraftAuctionItemInput = {
  description?: string;
  lotNumber: string;
  name: string;
  quantity: number;
  startingPrice?: number;
  unit: string;
};

export type DraftAuctionInput = {
  autoExtensionEnabled: boolean;
  bidStepAmount?: number;
  category: string;
  clientOrganizationId?: string;
  currency: "INR" | "USD" | "EUR" | "GBP";
  description?: string;
  emdAmount?: number;
  emdRequired: boolean;
  endAt: Date;
  extensionDurationMinutes?: number;
  items: readonly DraftAuctionItemInput[];
  location?: string;
  maximumBidValue?: number;
  minimumBidValue?: number;
  participationType: "OPEN" | "RESTRICTED";
  scheduledStartAt: Date;
  securityDepositRequirement?: string;
  tenderNumber?: string;
  termsAndConditions?: string;
  timezone: string;
  title: string;
  type: "FORWARD" | "REVERSE" | "RANK";
  updatedAt?: Date;
  visibility: "PUBLIC" | "PRIVATE";
  vendorRequirements?: string;
};

export type DraftValidationResult =
  | { data: DraftAuctionInput; success: true }
  | { errors: Record<string, string>; success: false };

export class AuctionDraftError extends Error {}

const directionForType = {
  FORWARD: "UPWARD",
  REVERSE: "DOWNWARD",
  RANK: "RANK_BASED",
} as const;

function clean(value: string | undefined) {
  const result = value?.trim();
  return result || undefined;
}

function parseOptionalMoney(value: string | undefined, field: string, errors: Record<string, string>) {
  const raw = clean(value);
  if (!raw) return undefined;
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount < 0) {
    errors[field] = "Enter a valid non-negative amount.";
    return undefined;
  }
  return amount;
}

export function validateDraftAuctionInput(values: Record<string, string | undefined>): DraftValidationResult {
  const errors: Record<string, string> = {};
  const title = clean(values.title);
  const category = clean(values.category);
  const type = values.type as DraftAuctionInput["type"];
  const currency = values.currency as DraftAuctionInput["currency"];
  const visibility = values.visibility as DraftAuctionInput["visibility"];
  const participationType = values.participationType as DraftAuctionInput["participationType"];
  const scheduledStartAt = new Date(values.scheduledStartAt ?? "");
  const endAt = new Date(values.endAt ?? "");
  const itemName = clean(values.itemName);
  const itemUnit = clean(values.itemUnit);
  const lotNumber = clean(values.lotNumber) ?? "1";
  const quantity = Number(values.itemQuantity);

  if (!title) errors.title = "Enter an auction title.";
  if (!category) errors.category = "Enter an auction category.";
  if (!( ["FORWARD", "REVERSE", "RANK"] as const).includes(type)) errors.type = "Select a valid auction type.";
  if (!( ["INR", "USD", "EUR", "GBP"] as const).includes(currency)) errors.currency = "Select a valid currency.";
  if (!( ["PUBLIC", "PRIVATE"] as const).includes(visibility)) errors.visibility = "Select a valid visibility.";
  if (!( ["OPEN", "RESTRICTED"] as const).includes(participationType)) errors.participationType = "Select a valid participation type.";
  if (Number.isNaN(scheduledStartAt.getTime())) errors.scheduledStartAt = "Enter a valid start time.";
  if (Number.isNaN(endAt.getTime())) errors.endAt = "Enter a valid end time.";
  if (!Number.isNaN(scheduledStartAt.getTime()) && !Number.isNaN(endAt.getTime()) && endAt <= scheduledStartAt) errors.endAt = "End time must be after start time.";
  if (!itemName) errors.itemName = "Add at least one item name.";
  if (!itemUnit) errors.itemUnit = "Enter an item unit.";
  if (!Number.isFinite(quantity) || quantity <= 0) errors.itemQuantity = "Enter a quantity greater than zero.";

  const bidStepAmount = parseOptionalMoney(values.bidStepAmount, "bidStepAmount", errors);
  const minimumBidValue = parseOptionalMoney(values.minimumBidValue, "minimumBidValue", errors);
  const maximumBidValue = parseOptionalMoney(values.maximumBidValue, "maximumBidValue", errors);
  const itemStartingPrice = parseOptionalMoney(values.itemStartingPrice, "itemStartingPrice", errors);
  const emdAmount = parseOptionalMoney(values.emdAmount, "emdAmount", errors);
  const emdRequired = values.emdRequired === "on";
  const autoExtensionEnabled = values.autoExtensionEnabled === "on";
  const extensionDuration = clean(values.extensionDurationMinutes);
  const extensionDurationMinutes = extensionDuration ? Number(extensionDuration) : undefined;
  const updatedAt = clean(values.updatedAt) ? new Date(values.updatedAt!) : undefined;

  if (type !== "RANK" && (bidStepAmount === undefined || bidStepAmount <= 0)) errors.bidStepAmount = "Enter a positive bid increment or decrement.";
  if (minimumBidValue !== undefined && maximumBidValue !== undefined && minimumBidValue > maximumBidValue) errors.maximumBidValue = "Maximum value must be greater than or equal to minimum value.";
  if (emdRequired && (emdAmount === undefined || emdAmount <= 0)) errors.emdAmount = "Enter a positive EMD amount.";
  if (autoExtensionEnabled && (!Number.isInteger(extensionDurationMinutes) || (extensionDurationMinutes ?? 0) <= 0)) errors.extensionDurationMinutes = "Enter a positive extension duration.";
  if (updatedAt && Number.isNaN(updatedAt.getTime())) errors.updatedAt = "This draft is no longer current. Refresh the page and try again.";

  if (Object.keys(errors).length) return { errors, success: false };

  return {
    success: true,
    data: {
      autoExtensionEnabled,
      bidStepAmount,
      category: category!,
      clientOrganizationId: clean(values.clientOrganizationId),
      currency,
      description: clean(values.description),
      emdAmount,
      emdRequired,
      endAt,
      extensionDurationMinutes,
      items: [{ description: clean(values.itemDescription), lotNumber, name: itemName!, quantity, startingPrice: itemStartingPrice, unit: itemUnit! }],
      location: clean(values.location),
      maximumBidValue,
      minimumBidValue,
      participationType,
      scheduledStartAt,
      securityDepositRequirement: clean(values.securityDepositRequirement),
      tenderNumber: clean(values.tenderNumber),
      termsAndConditions: clean(values.termsAndConditions),
      timezone: clean(values.timezone) ?? "Asia/Kolkata",
      title: title!,
      type,
      updatedAt,
      visibility,
      vendorRequirements: clean(values.vendorRequirements),
    },
  };
}

export function validateDraftAuctionForm(values: Record<string, string | undefined>): DraftValidationResult {
  const base = validateDraftAuctionInput({ ...values, itemName: "validation-placeholder", itemUnit: "unit", itemQuantity: "1" });
  if (!base.success) return base;
  const errors: Record<string, string> = {};
  let rawItems: unknown;
  try { rawItems = JSON.parse(values.itemsPayload ?? "[]"); } catch { errors.items = "Lot information is invalid."; }
  if (!Array.isArray(rawItems) || rawItems.length === 0) errors.items = "Add at least one lot.";
  const items = Array.isArray(rawItems) ? rawItems.map((item, index) => {
    const record = item && typeof item === "object" ? item as Record<string, unknown> : {};
    const lotNumber = typeof record.lotNumber === "string" ? record.lotNumber.trim() : "";
    const name = typeof record.name === "string" ? record.name.trim() : "";
    const unit = typeof record.unit === "string" ? record.unit.trim() : "";
    const quantity = Number(record.quantity);
    const price = record.startingPrice === "" || record.startingPrice === undefined ? undefined : Number(record.startingPrice);
    if (!lotNumber || !name || !unit || !Number.isFinite(quantity) || quantity <= 0 || (price !== undefined && (!Number.isFinite(price) || price < 0))) errors[`item-${index}`] = "Each lot needs a unique number, name, positive quantity, unit, and valid price.";
    return { lotNumber, name, unit, quantity, startingPrice: price, description: typeof record.description === "string" && record.description.trim() ? record.description.trim() : undefined };
  }) : [];
  if (new Set(items.map((item) => item.lotNumber)).size !== items.length) errors.items = "Lot numbers must be unique.";
  if (Object.keys(errors).length) return { errors, success: false };
  return { success: true, data: { ...base.data, items } };
}

async function resolveClientOrganization(actor: AuthenticatedUser, requestedId?: string) {
  if (actor.role === "CLIENT") {
    const membership = await prisma.userOrganization.findFirst({
      where: { userId: actor.id, isPrimary: true, organization: { type: "CLIENT", isActive: true } },
      select: { organizationId: true },
    });
    if (!membership) throw new AuctionDraftError("Your client organization is unavailable.");
    return membership.organizationId;
  }
  if (!requestedId) throw new AuctionDraftError("Select a client organization.");
  const client = await prisma.organization.findFirst({ where: { id: requestedId, type: "CLIENT", isActive: true }, select: { id: true } });
  if (!client) throw new AuctionDraftError("Select a valid client organization.");
  return client.id;
}

async function actorCanAccessClientOrganization(actor: AuthenticatedUser, clientOrganizationId: string) {
  if (["ADMIN", "SUPER_ADMIN"].includes(actor.role)) return roleHasPermission(actor.role, "AUCTIONS:VIEW");
  if (actor.role !== "CLIENT" || !roleHasPermission(actor.role, "AUCTIONS:VIEW")) return false;
  const membership = await prisma.userOrganization.findFirst({ where: { userId: actor.id, organizationId: clientOrganizationId, organization: { type: "CLIENT", isActive: true } }, select: { id: true } });
  return Boolean(membership);
}

export async function getAuthorizedAuctionDraft(actor: AuthenticatedUser, auctionId: string) {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    select: {
      id: true, auctionNumber: true, title: true, description: true, type: true, status: true, visibility: true,
      participationType: true, bidDirection: true, currency: true, scheduledStartAt: true, scheduledEndAt: true,
      timezone: true, clientOrganizationId: true, createdById: true, createdAt: true, updatedAt: true,
      tenderNumber: true, location: true, bidStepAmount: true, minimumBidValue: true, maximumBidValue: true,
      autoExtensionEnabled: true, extensionDurationMinutes: true, emdRequired: true, emdAmount: true,
      securityDepositRequirement: true,
      clientOrganization: { select: { displayName: true, legalName: true } },
      items: { select: { id: true, lotNumber: true, name: true, description: true, quantity: true, unit: true, startingPrice: true, currency: true }, orderBy: { lotNumber: "asc" } },
    },
  });
  if (!auction || !(await actorCanAccessClientOrganization(actor, auction.clientOrganizationId))) return null;
  return auction;
}

function auctionNumber() {
  return `AUC-${new Date().getUTCFullYear()}-${randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
}

export async function createDraftAuction(actor: AuthenticatedUser, input: DraftAuctionInput) {
  if (!roleHasPermission(actor.role, "AUCTIONS:CREATE") || !["CLIENT", "ADMIN", "SUPER_ADMIN"].includes(actor.role)) throw new AuctionDraftError("You are not allowed to create auctions.");
  const clientOrganizationId = await resolveClientOrganization(actor, input.clientOrganizationId);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const created = await tx.auction.create({
          data: {
            auctionNumber: auctionNumber(), title: input.title, category: input.category, description: input.description, termsAndConditions: input.termsAndConditions, vendorRequirements: input.vendorRequirements, tenderNumber: input.tenderNumber,
            type: input.type, status: "DRAFT", visibility: input.visibility, participationType: input.participationType,
            bidDirection: directionForType[input.type], clientOrganizationId, location: input.location, timezone: input.timezone,
            scheduledStartAt: input.scheduledStartAt, scheduledEndAt: input.endAt, currency: input.currency,
            bidStepAmount: input.bidStepAmount, minimumBidValue: input.minimumBidValue, maximumBidValue: input.maximumBidValue,
            autoExtensionEnabled: input.autoExtensionEnabled, extensionDurationMinutes: input.extensionDurationMinutes,
            emdRequired: input.emdRequired, emdAmount: input.emdAmount, emdCurrency: input.emdRequired ? input.currency : undefined,
            securityDepositRequirement: input.securityDepositRequirement, createdById: actor.id,
            items: { create: input.items.map((item) => ({ lotNumber: item.lotNumber, name: item.name, description: item.description, quantity: item.quantity, unit: item.unit, startingPrice: item.startingPrice, currency: input.currency })) },
          },
          select: { id: true, auctionNumber: true },
        });
        await tx.auditLog.create({ data: { actorUserId: actor.id, action: "AUCTION_DRAFT_CREATED", entityType: "AUCTION", entityId: created.id, newValue: { auctionNumber: created.auctionNumber, status: "DRAFT", itemCount: input.items.length } } });
        return created;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" && attempt < 2) continue;
      throw error;
    }
  }
  throw new AuctionDraftError("Unable to allocate an auction number.");
}

export async function updateDraftAuction(actor: AuthenticatedUser, auctionId: string, input: DraftAuctionInput) {
  if (!roleHasPermission(actor.role, "AUCTIONS:UPDATE") || !["CLIENT", "ADMIN", "SUPER_ADMIN"].includes(actor.role)) throw new AuctionDraftError("You are not allowed to update auctions.");
  const existing = await prisma.auction.findUnique({ where: { id: auctionId }, select: { id: true, auctionNumber: true, clientOrganizationId: true, status: true, updatedAt: true } });
  if (!existing || existing.status !== "DRAFT") throw new AuctionDraftError("Only existing draft auctions can be updated.");
  const clientOrganizationId = await resolveClientOrganization(actor, input.clientOrganizationId);
  if (actor.role === "CLIENT" && existing.clientOrganizationId !== clientOrganizationId) throw new AuctionDraftError("You cannot modify another organization’s auction.");

  return prisma.$transaction(async (tx) => {
    const update = await tx.auction.updateMany({
      where: { id: auctionId, status: "DRAFT", ...(input.updatedAt ? { updatedAt: input.updatedAt } : {}) },
      data: {
        title: input.title, category: input.category, description: input.description, termsAndConditions: input.termsAndConditions, vendorRequirements: input.vendorRequirements, tenderNumber: input.tenderNumber, type: input.type,
        visibility: input.visibility, participationType: input.participationType, bidDirection: directionForType[input.type],
        clientOrganizationId, location: input.location, timezone: input.timezone, scheduledStartAt: input.scheduledStartAt,
        scheduledEndAt: input.endAt, currency: input.currency, bidStepAmount: input.bidStepAmount, minimumBidValue: input.minimumBidValue,
        maximumBidValue: input.maximumBidValue, autoExtensionEnabled: input.autoExtensionEnabled, extensionDurationMinutes: input.extensionDurationMinutes,
        emdRequired: input.emdRequired, emdAmount: input.emdAmount, emdCurrency: input.emdRequired ? input.currency : null,
        securityDepositRequirement: input.securityDepositRequirement, updatedById: actor.id,
      },
    });
    if (update.count !== 1) throw new AuctionDraftError("This draft was changed elsewhere. Refresh the page before saving your changes.");
    await tx.auctionItem.deleteMany({ where: { auctionId } });
    await tx.auctionItem.createMany({ data: input.items.map((item) => ({ auctionId, lotNumber: item.lotNumber, name: item.name, description: item.description, quantity: item.quantity, unit: item.unit, startingPrice: item.startingPrice, currency: input.currency })) });
    await tx.auditLog.create({ data: { actorUserId: actor.id, action: "AUCTION_DRAFT_UPDATED", entityType: "AUCTION", entityId: auctionId, newValue: { auctionNumber: existing.auctionNumber, itemCount: input.items.length } } });
    return { id: auctionId, auctionNumber: existing.auctionNumber };
  });
}
