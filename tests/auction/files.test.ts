import assert from "node:assert/strict";
import test from "node:test";

import { prisma } from "../../lib/prisma.ts";
import type { AuthenticatedUser } from "../../types/auth.ts";
import { createDraftAuction, type DraftAuctionInput } from "../../services/auction-drafts.ts";
import { AuctionFileError, deleteAuctionFile, readAuctionFile, updateAuctionFileAccess, uploadAuctionDocument, validateAuctionFile } from "../../services/auction-files.ts";

function input(): DraftAuctionInput { const start = new Date(Date.now() + 3_600_000); return { title: "File fixture", category: "Test category", type: "FORWARD", currency: "INR", visibility: "PRIVATE", participationType: "RESTRICTED", scheduledStartAt: start, endAt: new Date(start.getTime() + 3_600_000), timezone: "Asia/Kolkata", bidStepAmount: 10, emdRequired: false, autoExtensionEnabled: false, items: [{ lotNumber: "1", name: "Fixture lot", quantity: 1, unit: "unit" }] }; }

test("auction files validate, enforce access, audit changes, and delete safely", async () => {
  const users = await prisma.user.findMany({ where: { email: { in: ["client@example.test", "vendor@example.test"] } }, select: { id: true, name: true, email: true, role: true } }); const client = users.find((user) => user.email === "client@example.test"); const vendor = users.find((user) => user.email === "vendor@example.test"); assert.ok(client && vendor);
  const actor = (user: NonNullable<typeof client>): AuthenticatedUser => ({ id: user.id, name: user.name, email: user.email, role: user.role }); let auctionId: string | undefined; let fileId: string | undefined;
  try {
    const auction = await createDraftAuction(actor(client), input()); auctionId = auction.id; const file = new File(["controlled file"], "fixture.txt", { type: "text/plain" });
    const record = await uploadAuctionDocument(actor(client), auction.id, file, "OTHER"); fileId = record.id;
    await assert.rejects(() => readAuctionFile(null, auction.id, "document", record.id), AuctionFileError);
    await assert.rejects(() => uploadAuctionDocument(actor(vendor), auction.id, file, "OTHER"), AuctionFileError);
    await assert.rejects(() => uploadAuctionDocument(actor(client), auction.id, new File(["x"], "../unsafe.txt", { type: "text/plain" }), "OTHER"), AuctionFileError);
    await assert.rejects(() => validateAuctionFile(new File(["x"], "bad.js", { type: "application/javascript" }), "document"), AuctionFileError);
    await updateAuctionFileAccess(actor(client), auction.id, "document", record.id, "PUBLIC");
    await assert.rejects(() => readAuctionFile(null, auction.id, "document", record.id), AuctionFileError);
    await prisma.auction.update({ where: { id: auction.id }, data: { status: "PUBLISHED", visibility: "PUBLIC" } });
    assert.equal(new TextDecoder().decode((await readAuctionFile(null, auction.id, "document", record.id)).bytes), "controlled file");
    await assert.rejects(() => readAuctionFile(actor(client), auction.id, "document", "not-the-file"), AuctionFileError);
    await prisma.auction.update({ where: { id: auction.id }, data: { status: "DRAFT", visibility: "PRIVATE" } });
    await deleteAuctionFile(actor(client), auction.id, "document", record.id); fileId = undefined;
    assert.equal(await prisma.auctionDocument.count({ where: { id: record.id } }), 0);
    assert.ok(await prisma.auditLog.count({ where: { entityId: record.id, action: { in: ["AUCTION_DOCUMENT_UPLOADED", "AUCTION_DOCUMENT_ACCESS_UPDATED", "AUCTION_DOCUMENT_DELETED"] } } }));
  } finally { if (fileId && auctionId) { const file = await prisma.auctionDocument.findUnique({ where: { id: fileId }, select: { fileKey: true } }); if (file) await prisma.auctionDocument.delete({ where: { id: fileId } }); } if (auctionId) { await prisma.auditLog.deleteMany({ where: { newValue: { path: ["auctionId"], equals: auctionId } } }); await prisma.auction.delete({ where: { id: auctionId } }); } await prisma.$disconnect(); }
});
