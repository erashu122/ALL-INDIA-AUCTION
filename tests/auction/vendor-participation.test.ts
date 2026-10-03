import assert from "node:assert/strict";
import test from "node:test";

import { prisma } from "../../lib/prisma.ts";
import type { AuthenticatedUser } from "../../types/auth.ts";
import { createDraftAuction, type DraftAuctionInput } from "../../services/auction-drafts.ts";
import { createVendorParticipation, getVendorAuctionEligibility, getVendorAuctionView, VendorParticipationError } from "../../services/vendor-participation.ts";

function input(): DraftAuctionInput { const start = new Date(Date.now() + 3_600_000); return { title: "Vendor participation fixture", category: "Test category", type: "FORWARD", currency: "INR", visibility: "PUBLIC", participationType: "OPEN", scheduledStartAt: start, endAt: new Date(start.getTime() + 3_600_000), timezone: "Asia/Kolkata", bidStepAmount: 10, emdRequired: true, emdAmount: 100, autoExtensionEnabled: false, items: [{ lotNumber: "1", name: "Fixture lot", quantity: 1, unit: "unit" }] }; }

test("vendor participation is eligibility-gated, organization-bound, and audited", async () => {
  const users = await prisma.user.findMany({ where: { email: { in: ["client@example.test", "vendor@example.test", "admin@example.test"] } }, select: { id: true, name: true, email: true, role: true } }); const byEmail = new Map(users.map((user) => [user.email, user])); const client = byEmail.get("client@example.test"); const vendor = byEmail.get("vendor@example.test"); const admin = byEmail.get("admin@example.test"); assert.ok(client && vendor && admin);
  const actor = (user: NonNullable<typeof client>): AuthenticatedUser => ({ id: user.id, name: user.name, email: user.email, role: user.role }); let auctionId: string | undefined; let participationId: string | undefined;
  try {
    const auction = await createDraftAuction(actor(client), input()); auctionId = auction.id; await prisma.auction.update({ where: { id: auction.id }, data: { status: "PUBLISHED" } });
    const created = await createVendorParticipation(actor(vendor), auction.id); participationId = created.id; assert.equal(created.status, "SUBMITTED"); assert.equal(created.eligibilityStatus, "PENDING");
    const vendorMembership = await prisma.userOrganization.findFirstOrThrow({ where: { userId: vendor.id, isPrimary: true }, select: { organizationId: true } }); assert.equal(created.vendorOrganizationId, vendorMembership.organizationId);
    await assert.rejects(() => createVendorParticipation(actor(vendor), auction.id), VendorParticipationError);
    await assert.rejects(() => createVendorParticipation(actor(client), auction.id), VendorParticipationError);
    await assert.rejects(() => createVendorParticipation(actor(admin), auction.id), VendorParticipationError);
    assert.ok(await prisma.auditLog.count({ where: { entityId: created.id, action: "VENDOR_PARTICIPATION_REQUESTED" } }));
    await prisma.auction.update({ where: { id: auction.id }, data: { visibility: "PRIVATE" } }); assert.equal((await getVendorAuctionView(actor(vendor), auction.id)), null);
    await prisma.auction.update({ where: { id: auction.id }, data: { visibility: "PUBLIC", participationDeadlineAt: new Date(Date.now() - 1) } }); assert.equal((await getVendorAuctionEligibility(actor(vendor), auction.id)).allowed, false);
  } finally { if (participationId) await prisma.auditLog.deleteMany({ where: { entityId: participationId } }); if (auctionId) { await prisma.vendorParticipation.deleteMany({ where: { auctionId } }); await prisma.auction.delete({ where: { id: auctionId } }); } await prisma.$disconnect(); }
});
