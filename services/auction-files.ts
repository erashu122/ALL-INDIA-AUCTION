import path from "node:path";

import { fileStorageConfig, fileTypes } from "../config/file-storage.ts";
import { roleHasPermission } from "../lib/permissions.ts";
import { prisma } from "../lib/prisma.ts";
import { localFileStorage, type FileStorage } from "../lib/storage/local-file-storage.ts";
import type { AuthenticatedUser } from "../types/auth.ts";

export class AuctionFileError extends Error {}
type Kind = "document" | "media";

function extension(name: string) { return path.extname(name).slice(1).toLowerCase(); }
function permitted(kind: Kind, ext: string, mime: string) { const group = kind === "document" ? fileTypes.document : { ...fileTypes.image, ...fileTypes.video }; const mimes = group[ext as keyof typeof group] as readonly string[] | undefined; return Boolean(mimes?.includes(mime)); }
export async function validateAuctionFile(file: File, kind: Kind) {
  const ext = extension(file.name); if (!file.name || /[\\/\0]/.test(file.name) || file.name.includes("..")) throw new AuctionFileError("Use a safe filename.");
  if (!file.size) throw new AuctionFileError("The file is empty."); if (file.size > (kind === "document" ? fileStorageConfig.documentMaxBytes : fileStorageConfig.mediaMaxBytes)) throw new AuctionFileError("The file exceeds the allowed size.");
  if (!permitted(kind, ext, file.type)) throw new AuctionFileError("The file type or extension is not allowed.");
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if ((ext === "pdf" && String.fromCharCode(...bytes.slice(0, 4)) !== "%PDF") || ((ext === "png") && !(bytes[0] === 137 && bytes[1] === 80)) || ((ext === "jpg" || ext === "jpeg") && !(bytes[0] === 255 && bytes[1] === 216))) throw new AuctionFileError("The file content does not match its declared type.");
  return { extension: ext, bytes: new Uint8Array(await file.arrayBuffer()) };
}

async function canManage(actor: AuthenticatedUser, auctionId: string) {
  const auction = await prisma.auction.findUnique({ where: { id: auctionId }, select: { clientOrganizationId: true, status: true } });
  if (!auction) throw new AuctionFileError("Auction not found.");
  const admin = (actor.role === "ADMIN" || actor.role === "SUPER_ADMIN") && roleHasPermission(actor.role, "DOCUMENTS:MANAGE");
  if (admin && ["DRAFT", "SUBMITTED", "UNDER_REVIEW"].includes(auction.status)) return auction;
  if (actor.role !== "CLIENT" || auction.status !== "DRAFT" || !roleHasPermission(actor.role, "DOCUMENTS:CREATE")) throw new AuctionFileError("You cannot manage files for this auction.");
  const member = await prisma.userOrganization.findFirst({ where: { userId: actor.id, organizationId: auction.clientOrganizationId }, select: { id: true } }); if (!member) throw new AuctionFileError("You cannot manage another organization’s files."); return auction;
}

async function canReadPrivate(actor: AuthenticatedUser, auctionId: string) {
  const auction = await prisma.auction.findUnique({ where: { id: auctionId }, select: { clientOrganizationId: true } });
  if (!auction) return false;
  if ((actor.role === "ADMIN" || actor.role === "SUPER_ADMIN") && roleHasPermission(actor.role, "DOCUMENTS:VIEW")) return true;
  if (actor.role !== "CLIENT" || !roleHasPermission(actor.role, "DOCUMENTS:VIEW")) return false;
  return Boolean(await prisma.userOrganization.findFirst({ where: { userId: actor.id, organizationId: auction.clientOrganizationId }, select: { id: true } }));
}

async function upload(actor: AuthenticatedUser, auctionId: string, file: File, kind: Kind, type: string, auctionItemId?: string, storage: FileStorage = localFileStorage) {
  await canManage(actor, auctionId); const validated = await validateAuctionFile(file, kind);
  if (auctionItemId && !await prisma.auctionItem.findFirst({ where: { id: auctionItemId, auctionId }, select: { id: true } })) throw new AuctionFileError("The selected lot does not belong to this auction.");
  const key = storage.createKey(`auctions/${auctionId}/${kind}`); await storage.put(key, validated.bytes);
  try { return await prisma.$transaction(async (tx) => { const record = kind === "document" ? await tx.auctionDocument.create({ data: { auctionId, auctionItemId, name: file.name, type: type as never, fileKey: key, fileName: file.name, mimeType: file.type, sizeInBytes: file.size, uploadedById: actor.id } }) : await tx.auctionMedia.create({ data: { auctionId, auctionItemId, type: type as never, fileKey: key, fileName: file.name, mimeType: file.type, sizeInBytes: file.size, uploadedById: actor.id } }); await tx.auditLog.create({ data: { actorUserId: actor.id, action: kind === "document" ? "AUCTION_DOCUMENT_UPLOADED" : "AUCTION_MEDIA_UPLOADED", entityType: kind === "document" ? "AUCTION_DOCUMENT" : "AUCTION_MEDIA", entityId: record.id, newValue: { auctionId, access: "PRIVATE" } } }); return record; }); } catch (error) { await storage.delete(key).catch(() => undefined); throw error; }
}
export const uploadAuctionDocument = (actor: AuthenticatedUser, auctionId: string, file: File, type: string, auctionItemId?: string) => upload(actor, auctionId, file, "document", type, auctionItemId);
export const uploadAuctionMedia = (actor: AuthenticatedUser, auctionId: string, file: File, type: "IMAGE" | "VIDEO", auctionItemId?: string) => upload(actor, auctionId, file, "media", type, auctionItemId);

export async function listAuctionFiles(actor: AuthenticatedUser, auctionId: string) {
  if (!await canReadPrivate(actor, auctionId)) throw new AuctionFileError("You cannot view files for this auction.");
  return prisma.auction.findUniqueOrThrow({ where: { id: auctionId }, select: { items: { select: { id: true, lotNumber: true, name: true } }, documents: { orderBy: { createdAt: "desc" }, select: { id: true, name: true, type: true, fileName: true, mimeType: true, sizeInBytes: true, access: true, auctionItemId: true, createdAt: true, uploadedBy: { select: { name: true } } } }, media: { orderBy: { createdAt: "desc" }, select: { id: true, type: true, fileName: true, mimeType: true, sizeInBytes: true, access: true, auctionItemId: true, createdAt: true, uploadedBy: { select: { name: true } } } } } });
}

export async function readAuctionFile(actor: AuthenticatedUser | null, auctionId: string, kind: Kind, fileId: string, storage: FileStorage = localFileStorage) {
  const record = kind === "document" ? await prisma.auctionDocument.findFirst({ where: { id: fileId, auctionId }, select: { fileKey: true, fileName: true, mimeType: true, access: true, auction: { select: { status: true, visibility: true } } } }) : await prisma.auctionMedia.findFirst({ where: { id: fileId, auctionId }, select: { fileKey: true, fileName: true, mimeType: true, access: true, auction: { select: { status: true, visibility: true } } } });
  if (!record) throw new AuctionFileError("File not found.");
  const isPublic = record.access === "PUBLIC" && record.auction.status === "PUBLISHED" && record.auction.visibility === "PUBLIC";
  if (!isPublic && (!actor || !await canReadPrivate(actor, auctionId))) throw new AuctionFileError("You cannot access this file.");
  return { bytes: await storage.get(record.fileKey), name: record.fileName ?? "download", mimeType: record.mimeType ?? "application/octet-stream" };
}

export async function deleteAuctionFile(actor: AuthenticatedUser, auctionId: string, kind: Kind, fileId: string, storage: FileStorage = localFileStorage) {
  await canManage(actor, auctionId);
  const record = kind === "document" ? await prisma.auctionDocument.findFirst({ where: { id: fileId, auctionId }, select: { id: true, fileKey: true } }) : await prisma.auctionMedia.findFirst({ where: { id: fileId, auctionId }, select: { id: true, fileKey: true } });
  if (!record) throw new AuctionFileError("File not found.");
  try { await storage.delete(record.fileKey); } catch { throw new AuctionFileError("The file could not be removed from storage. Metadata was preserved."); }
  await prisma.$transaction(async (tx) => { if (kind === "document") await tx.auctionDocument.delete({ where: { id: record.id } }); else await tx.auctionMedia.delete({ where: { id: record.id } }); await tx.auditLog.create({ data: { actorUserId: actor.id, action: kind === "document" ? "AUCTION_DOCUMENT_DELETED" : "AUCTION_MEDIA_DELETED", entityType: kind === "document" ? "AUCTION_DOCUMENT" : "AUCTION_MEDIA", entityId: record.id, newValue: { auctionId } } }); });
}

export async function updateAuctionFileAccess(actor: AuthenticatedUser, auctionId: string, kind: Kind, fileId: string, access: "PUBLIC" | "PRIVATE" | "INTERNAL") {
  await canManage(actor, auctionId);
  const updated = kind === "document" ? await prisma.auctionDocument.updateMany({ where: { id: fileId, auctionId }, data: { access } }) : await prisma.auctionMedia.updateMany({ where: { id: fileId, auctionId }, data: { access } });
  if (updated.count !== 1) throw new AuctionFileError("File not found.");
  await prisma.auditLog.create({ data: { actorUserId: actor.id, action: kind === "document" ? "AUCTION_DOCUMENT_ACCESS_UPDATED" : "AUCTION_MEDIA_ACCESS_UPDATED", entityType: kind === "document" ? "AUCTION_DOCUMENT" : "AUCTION_MEDIA", entityId: fileId, newValue: { auctionId, access } } });
}
