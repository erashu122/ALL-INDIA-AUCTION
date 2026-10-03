import assert from "node:assert/strict";
import test from "node:test";

import { prisma } from "../../lib/prisma.ts";
import type { AuthenticatedUser } from "../../types/auth.ts";
import { createDraftAuction, type DraftAuctionInput } from "../../services/auction-drafts.ts";
import { approveAuction, AuctionReviewError, rejectAuction, startAuctionReview, submitAuctionForReview } from "../../services/auction-review.ts";

function input(): DraftAuctionInput {
  const start = new Date(Date.now() + 3_600_000);
  return { title: "Review workflow fixture", category: "Test category", description: "Controlled review fixture", type: "FORWARD", currency: "INR", visibility: "PRIVATE", participationType: "RESTRICTED", scheduledStartAt: start, endAt: new Date(start.getTime() + 3_600_000), timezone: "Asia/Kolkata", bidStepAmount: 10, emdRequired: false, autoExtensionEnabled: false, items: [{ lotNumber: "1", name: "Fixture item", quantity: 1, unit: "unit", startingPrice: 100 }] };
}

test("submission and review transitions are authorized, atomic, and audited", async () => {
  const users = await prisma.user.findMany({ where: { email: { in: ["client@example.test", "admin@example.test", "vendor@example.test"] } }, select: { id: true, name: true, email: true, role: true } });
  const byEmail = new Map(users.map((user) => [user.email, user]));
  const client = byEmail.get("client@example.test"); const admin = byEmail.get("admin@example.test"); const vendor = byEmail.get("vendor@example.test");
  assert.ok(client && admin && vendor, "development seed users are required");
  const toActor = (user: typeof client): AuthenticatedUser => ({ id: user.id, name: user.name, email: user.email, role: user.role });
  const ids: string[] = [];
  try {
    const approved = await createDraftAuction(toActor(client), input()); ids.push(approved.id);
    await assert.rejects(() => startAuctionReview(toActor(client), approved.id), AuctionReviewError);
    await assert.rejects(() => submitAuctionForReview(toActor(vendor), approved.id), AuctionReviewError);
    await submitAuctionForReview(toActor(client), approved.id);
    assert.equal((await prisma.auction.findUniqueOrThrow({ where: { id: approved.id } })).status, "SUBMITTED");
    await assert.rejects(() => approveAuction(toActor(admin), approved.id), AuctionReviewError);
    await startAuctionReview(toActor(admin), approved.id);
    await assert.rejects(() => startAuctionReview(toActor(admin), approved.id), AuctionReviewError);
    await approveAuction(toActor(admin), approved.id);
    const approvedRecord = await prisma.auction.findUniqueOrThrow({ where: { id: approved.id } });
    assert.equal(approvedRecord.status, "APPROVED"); assert.notEqual(approvedRecord.status, "PUBLISHED");

    const rejected = await createDraftAuction(toActor(client), input()); ids.push(rejected.id);
    await submitAuctionForReview(toActor(client), rejected.id); await startAuctionReview(toActor(admin), rejected.id);
    await assert.rejects(() => rejectAuction(toActor(admin), rejected.id, ""), AuctionReviewError);
    await rejectAuction(toActor(admin), rejected.id, "Missing required clarification.");
    assert.equal((await prisma.auction.findUniqueOrThrow({ where: { id: rejected.id } })).status, "REJECTED");
    for (const action of ["AUCTION_SUBMITTED_FOR_REVIEW", "AUCTION_REVIEW_STARTED", "AUCTION_APPROVED", "AUCTION_REJECTED"]) assert.ok(await prisma.auditLog.count({ where: { entityId: { in: ids }, action } }));
  } finally {
    if (ids.length) { await prisma.auditLog.deleteMany({ where: { entityId: { in: ids } } }); await prisma.auction.deleteMany({ where: { id: { in: ids } } }); }
    await prisma.$disconnect();
  }
});
