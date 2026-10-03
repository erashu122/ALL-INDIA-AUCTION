import assert from "node:assert/strict";
import test from "node:test";

import { prisma } from "../../lib/prisma.ts";
import type { AuthenticatedUser } from "../../types/auth.ts";
import { createDraftAuction, type DraftAuctionInput } from "../../services/auction-drafts.ts";
import { getPublicAuction, getPublicAuctions, publishAuction } from "../../services/auction-publishing.ts";
import { approveAuction, startAuctionReview, submitAuctionForReview } from "../../services/auction-review.ts";

function input(visibility: "PUBLIC" | "PRIVATE"): DraftAuctionInput { const start = new Date(Date.now() + 3_600_000); return { title: `Publishing fixture ${visibility}`, category: "Test category", description: "Controlled publishing fixture", type: "FORWARD", currency: "INR", visibility, participationType: "OPEN", scheduledStartAt: start, endAt: new Date(start.getTime() + 3_600_000), timezone: "Asia/Kolkata", bidStepAmount: 10, emdRequired: false, autoExtensionEnabled: false, items: [{ lotNumber: "1", name: "Public fixture item", quantity: 1, unit: "unit", startingPrice: 100 }] }; }

test("only approved public auctions can be published and discovered publicly", async () => {
  const users = await prisma.user.findMany({ where: { email: { in: ["client@example.test", "admin@example.test", "vendor@example.test"] } }, select: { id: true, name: true, email: true, role: true } });
  const map = new Map(users.map((user) => [user.email, user])); const client = map.get("client@example.test"); const admin = map.get("admin@example.test"); const vendor = map.get("vendor@example.test");
  assert.ok(client && admin && vendor, "development seed users are required");
  const actor = (user: NonNullable<typeof client>): AuthenticatedUser => ({ id: user.id, name: user.name, email: user.email, role: user.role });
  const ids: string[] = [];
  try {
    const publicAuction = await createDraftAuction(actor(client), input("PUBLIC")); ids.push(publicAuction.id);
    await assert.rejects(() => publishAuction(actor(admin), publicAuction.id));
    await assert.rejects(() => publishAuction(actor(client), publicAuction.id));
    await assert.rejects(() => publishAuction(actor(vendor), publicAuction.id));
    await submitAuctionForReview(actor(client), publicAuction.id); await startAuctionReview(actor(admin), publicAuction.id); await approveAuction(actor(admin), publicAuction.id); await publishAuction(actor(admin), publicAuction.id);
    assert.equal((await prisma.auction.findUniqueOrThrow({ where: { id: publicAuction.id } })).status, "PUBLISHED");
    assert.ok((await getPublicAuctions({ query: publicAuction.auctionNumber })).some((auction) => auction.id === publicAuction.id));
    assert.equal((await getPublicAuction(publicAuction.id))?.id, publicAuction.id);
    assert.ok(await prisma.auditLog.count({ where: { entityId: publicAuction.id, action: "AUCTION_PUBLISHED" } }));
    await assert.rejects(() => publishAuction(actor(admin), publicAuction.id));

    const privateAuction = await createDraftAuction(actor(client), input("PRIVATE")); ids.push(privateAuction.id);
    await prisma.auction.update({ where: { id: privateAuction.id }, data: { status: "PUBLISHED" } });
    assert.equal(await getPublicAuction(privateAuction.id), null);
    const draft = await createDraftAuction(actor(client), input("PUBLIC")); ids.push(draft.id);
    assert.equal(await getPublicAuction(draft.id), null);
  } finally { if (ids.length) { await prisma.auditLog.deleteMany({ where: { entityId: { in: ids } } }); await prisma.auction.deleteMany({ where: { id: { in: ids } } }); } await prisma.$disconnect(); }
});
