"use server";

import { revalidatePath } from "next/cache";

import { getAuthenticatedUser } from "@/lib/auth";
import { createVendorParticipation, VendorParticipationError } from "@/services/vendor-participation";

export type ParticipationActionState = { error?: string; success?: string };
export async function participateAction(auctionId: string, _state: ParticipationActionState, _formData: FormData): Promise<ParticipationActionState> {
  void _state; void _formData; const actor = await getAuthenticatedUser(); if (!actor) return { error: "Sign in is required." };
  try { await createVendorParticipation(actor, auctionId); revalidatePath(`/vendor/auctions/${auctionId}`); revalidatePath("/vendor/auctions"); return { success: "Participation request submitted." }; } catch (error) { return { error: error instanceof VendorParticipationError ? error.message : "Unable to request participation." }; }
}
