import assert from "node:assert/strict";
import test from "node:test";

import { prisma } from "../../lib/prisma.ts";
import type { AuthenticatedUser } from "../../types/auth.ts";
import {
  AuctionDraftError,
  createDraftAuction,
  updateDraftAuction,
  validateDraftAuctionForm,
  type DraftAuctionInput,
} from "../../services/auction-drafts.ts";

const fixtureReference = "test:auction-editor-fixture";

function input(clientOrganizationId?: string): DraftAuctionInput {
  const start = new Date(Date.now() + 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return {
    title: "Auction editor integration fixture",
    category: "Test category",
    type: "FORWARD",
    currency: "INR",
    visibility: "PRIVATE",
    participationType: "RESTRICTED",
    scheduledStartAt: start,
    endAt: end,
    timezone: "Asia/Kolkata",
    bidStepAmount: 10,
    emdRequired: false,
    autoExtensionEnabled: false,
    clientOrganizationId,
    items: [
      { lotNumber: "1", name: "Fixture item one", quantity: 2, unit: "unit", startingPrice: 100 },
      { lotNumber: "2", name: "Fixture item two", quantity: 3, unit: "unit", startingPrice: 200 },
    ],
  };
}

function actor(user: { email: string; id: string; name: string; role: AuthenticatedUser["role"] }): AuthenticatedUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

test("draft editor protects authorization, immutable identity, transactions, and audit records", async () => {
  const users = await prisma.user.findMany({
    where: { email: { in: ["admin@example.test", "client@example.test", "support@example.test", "vendor@example.test"] } },
    select: { id: true, name: true, email: true, role: true },
  });
  const byEmail = new Map(users.map((user) => [user.email, user]));
  const admin = byEmail.get("admin@example.test");
  const client = byEmail.get("client@example.test");
  const vendor = byEmail.get("vendor@example.test");
  const support = byEmail.get("support@example.test");
  assert.ok(admin && client && vendor && support, "development seed users are required for this integration test");

  const clientMembership = await prisma.userOrganization.findFirst({ where: { userId: client.id, isPrimary: true }, select: { organizationId: true } });
  assert.ok(clientMembership, "development client organization is required");

  let ownedAuctionId: string | undefined;
  let otherAuctionId: string | undefined;
  let fixtureOrganizationId: string | undefined;

  try {
    const owned = await createDraftAuction(actor(client), input());
    ownedAuctionId = owned.id;
    const originalNumber = owned.auctionNumber;

    const loaded = await prisma.auction.findUniqueOrThrow({ where: { id: owned.id }, include: { items: true } });
    assert.equal(loaded.items.length, 2);
    const updated = await updateDraftAuction(actor(admin), owned.id, { ...input(clientMembership.organizationId), title: "Updated by authorized admin", updatedAt: loaded.updatedAt });
    assert.equal(updated.id, owned.id);
    assert.equal(updated.auctionNumber, originalNumber);

    const afterUpdate = await prisma.auction.findUniqueOrThrow({ where: { id: owned.id }, include: { items: true } });
    assert.equal(afterUpdate.title, "Updated by authorized admin");
    assert.equal(afterUpdate.items.length, 2);
    assert.equal(afterUpdate.auctionNumber, originalNumber);
    assert.equal(await prisma.auditLog.count({ where: { entityId: owned.id, action: "AUCTION_DRAFT_UPDATED" } }), 1);

    await assert.rejects(() => updateDraftAuction(actor(vendor), owned.id, input()), AuctionDraftError);
    await assert.rejects(() => updateDraftAuction(actor(support), owned.id, input()), AuctionDraftError);

    const beforeRollback = await prisma.auction.findUniqueOrThrow({ where: { id: owned.id }, include: { items: true } });
    await assert.rejects(() => updateDraftAuction(actor(admin), owned.id, { ...input(clientMembership.organizationId), title: "Should roll back", items: [{ lotNumber: "1", name: "One", quantity: 1, unit: "unit" }, { lotNumber: "1", name: "Duplicate", quantity: 1, unit: "unit" }] }), /Unique constraint|P2002/);
    const afterRollback = await prisma.auction.findUniqueOrThrow({ where: { id: owned.id }, include: { items: true } });
    assert.equal(afterRollback.title, beforeRollback.title);
    assert.equal(afterRollback.items.length, beforeRollback.items.length);

    fixtureOrganizationId = (await prisma.organization.create({ data: { legalName: "Auction Editor Test Client Organization", type: "CLIENT", registrationReference: fixtureReference } })).id;
    const other = await createDraftAuction(actor(admin), input(fixtureOrganizationId));
    otherAuctionId = other.id;
    await assert.rejects(() => updateDraftAuction(actor(client), other.id, input()), AuctionDraftError);

    await prisma.auction.update({ where: { id: owned.id }, data: { status: "SUBMITTED" } });
    await assert.rejects(() => updateDraftAuction(actor(admin), owned.id, input(clientMembership.organizationId)), AuctionDraftError);
  } finally {
    const auctionIds = [ownedAuctionId, otherAuctionId].filter((id): id is string => Boolean(id));
    if (auctionIds.length) {
      await prisma.auditLog.deleteMany({ where: { entityId: { in: auctionIds } } });
      await prisma.auction.deleteMany({ where: { id: { in: auctionIds } } });
    }
    if (fixtureOrganizationId) await prisma.organization.deleteMany({ where: { id: fixtureOrganizationId, registrationReference: fixtureReference } });
    await prisma.$disconnect();
  }
});

test("draft form validation requires valid, unique lots", () => {
  const base = {
    title: "Validation fixture",
    category: "Test category",
    type: "FORWARD",
    currency: "INR",
    visibility: "PRIVATE",
    participationType: "RESTRICTED",
    scheduledStartAt: "2030-01-01T10:00",
    endAt: "2030-01-01T11:00",
    timezone: "Asia/Kolkata",
    bidStepAmount: "10",
  };

  const zeroLots = validateDraftAuctionForm({ ...base, itemsPayload: "[]" });
  assert.equal(zeroLots.success, false);

  const duplicateLots = validateDraftAuctionForm({ ...base, itemsPayload: JSON.stringify([{ lotNumber: "1", name: "One", quantity: "1", unit: "unit" }, { lotNumber: "1", name: "Two", quantity: "1", unit: "unit" }]) });
  assert.equal(duplicateLots.success, false);

  const valid = validateDraftAuctionForm({ ...base, itemsPayload: JSON.stringify([{ lotNumber: "1", name: "One", quantity: "1", unit: "unit" }, { lotNumber: "2", name: "Two", quantity: "2", unit: "unit" }]) });
  assert.equal(valid.success, true);
});
