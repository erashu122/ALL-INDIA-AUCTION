"use server";

import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/lib/auth";
import { approveAuction, AuctionReviewError, rejectAuction, returnRejectedAuctionToDraft, startAuctionReview, submitAuctionForReview } from "@/services/auction-review";
import { publishAuction } from "@/services/auction-publishing";

export type ReviewActionState = { error?: string };

async function actorOrError() {
  const actor = await getAuthenticatedUser();
  if (!actor) throw new AuctionReviewError("Sign in is required.");
  return actor;
}

export async function submitAuctionAction(auctionId: string, _state: ReviewActionState, _formData: FormData): Promise<ReviewActionState> {
  void _state; void _formData;
  try { await submitAuctionForReview(await actorOrError(), auctionId); redirect(`/client/auctions/${auctionId}`); } catch (error) { return { error: error instanceof AuctionReviewError ? error.message : "Unable to submit this auction." }; }
}

export async function reopenAuctionAction(auctionId: string, _state: ReviewActionState, _formData: FormData): Promise<ReviewActionState> {
  void _state; void _formData;
  try { await returnRejectedAuctionToDraft(await actorOrError(), auctionId); redirect(`/client/auctions/${auctionId}/edit`); } catch (error) { return { error: error instanceof AuctionReviewError ? error.message : "Unable to reopen this auction." }; }
}

export async function startReviewAction(auctionId: string, _state: ReviewActionState, _formData: FormData): Promise<ReviewActionState> {
  void _state; void _formData;
  try { await startAuctionReview(await actorOrError(), auctionId); redirect(`/admin/auctions/${auctionId}`); } catch (error) { return { error: error instanceof AuctionReviewError ? error.message : "Unable to start review." }; }
}

export async function approveAuctionAction(auctionId: string, _state: ReviewActionState, _formData: FormData): Promise<ReviewActionState> {
  void _state; void _formData;
  try { await approveAuction(await actorOrError(), auctionId); redirect(`/admin/auctions/${auctionId}`); } catch (error) { return { error: error instanceof AuctionReviewError ? error.message : "Unable to approve this auction." }; }
}

export async function rejectAuctionAction(auctionId: string, _state: ReviewActionState, formData: FormData): Promise<ReviewActionState> {
  try { await rejectAuction(await actorOrError(), auctionId, String(formData.get("reason") ?? "")); redirect(`/admin/auctions/${auctionId}`); } catch (error) { return { error: error instanceof AuctionReviewError ? error.message : "Unable to reject this auction." }; }
}

export async function publishAuctionAction(auctionId: string, _state: ReviewActionState, _formData: FormData): Promise<ReviewActionState> {
  void _state; void _formData;
  try { await publishAuction(await actorOrError(), auctionId); redirect(`/admin/auctions/${auctionId}`); } catch (error) { return { error: error instanceof AuctionReviewError ? error.message : "Unable to publish this auction." }; }
}
