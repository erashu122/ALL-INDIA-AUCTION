"use server";

import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/lib/auth";
import { AuctionDraftError, createDraftAuction, updateDraftAuction, validateDraftAuctionForm } from "@/services/auction-drafts";

export type DraftActionState = { errors?: Record<string, string>; error?: string };

export async function createDraftAction(_state: DraftActionState, formData: FormData): Promise<DraftActionState> {
  const actor = await getAuthenticatedUser();
  if (!actor) return { error: "Sign in is required to create an auction." };
  const values = Object.fromEntries([...formData.entries()].map(([key, value]) => [key, typeof value === "string" ? value : undefined]));
  const validated = validateDraftAuctionForm(values);
  if (!validated.success) return { errors: validated.errors };
  try {
    const auction = await createDraftAuction(actor, validated.data);
    redirect(actor.role === "CLIENT" ? `/client/auctions/${auction.id}` : `/admin/auctions/${auction.id}`);
  } catch (error) {
    return { error: error instanceof AuctionDraftError ? error.message : "Unable to save the auction draft. Please try again." };
  }
}

export async function updateDraftAction(auctionId: string, _state: DraftActionState, formData: FormData): Promise<DraftActionState> {
  const actor = await getAuthenticatedUser();
  if (!actor) return { error: "Sign in is required to update an auction." };
  const values = Object.fromEntries([...formData.entries()].map(([key, value]) => [key, typeof value === "string" ? value : undefined]));
  const validated = validateDraftAuctionForm(values);
  if (!validated.success) return { errors: validated.errors };
  try {
    const auction = await updateDraftAuction(actor, auctionId, validated.data);
    redirect(actor.role === "CLIENT" ? `/client/auctions/${auction.id}` : `/admin/auctions/${auction.id}`);
  } catch (error) {
    return { error: error instanceof AuctionDraftError ? error.message : "Unable to update the auction draft. Please try again." };
  }
}
