"use server";

import { revalidatePath } from "next/cache";

import { getAuthenticatedUser } from "@/lib/auth";
import { AuctionFileError, deleteAuctionFile, updateAuctionFileAccess, uploadAuctionDocument, uploadAuctionMedia } from "@/services/auction-files";

export type FileActionState = { error?: string; success?: string };
const result = (error: unknown): FileActionState => ({ error: error instanceof AuctionFileError ? error.message : "Unable to update auction files." });

export async function uploadAuctionFileAction(auctionId: string, portal: "admin" | "client", _state: FileActionState, formData: FormData): Promise<FileActionState> {
  void _state; const actor = await getAuthenticatedUser(); if (!actor) return { error: "Sign in is required." };
  try { const file = formData.get("file"); if (!(file instanceof File)) return { error: "Choose a file." }; const kind = formData.get("kind"); const lot = String(formData.get("auctionItemId") ?? "") || undefined; if (kind === "document") { const type = String(formData.get("type") ?? "OTHER"); await uploadAuctionDocument(actor, auctionId, file, ["TENDER", "TECHNICAL_SPECIFICATION", "COMMERCIAL_TERMS", "ELIGIBILITY", "EMD", "CLARIFICATION", "RESULT", "OTHER"].includes(type) ? type : "OTHER", lot); } else if (kind === "media") await uploadAuctionMedia(actor, auctionId, file, file.type.startsWith("video/") ? "VIDEO" : "IMAGE", lot); else return { error: "Select a valid file category." }; revalidatePath(`/${portal}/auctions/${auctionId}`); return { success: "File uploaded privately." }; } catch (error) { return result(error); }
}
export async function deleteAuctionFileAction(auctionId: string, portal: "admin" | "client", kind: "document" | "media", fileId: string, _state: FileActionState, _formData: FormData): Promise<FileActionState> {
  void _state; void _formData; const actor = await getAuthenticatedUser(); if (!actor) return { error: "Sign in is required." }; try { await deleteAuctionFile(actor, auctionId, kind, fileId); revalidatePath(`/${portal}/auctions/${auctionId}`); return { success: "File deleted." }; } catch (error) { return result(error); }
}
export async function updateAuctionFileAccessAction(auctionId: string, portal: "admin" | "client", kind: "document" | "media", fileId: string, _state: FileActionState, formData: FormData): Promise<FileActionState> {
  void _state; const actor = await getAuthenticatedUser(); if (!actor) return { error: "Sign in is required." }; const access = String(formData.get("access")); if (access !== "PUBLIC" && access !== "PRIVATE" && access !== "INTERNAL") return { error: "Select a valid access level." }; try { await updateAuctionFileAccess(actor, auctionId, kind, fileId, access); revalidatePath(`/${portal}/auctions/${auctionId}`); return { success: "File access updated." }; } catch (error) { return result(error); }
}
