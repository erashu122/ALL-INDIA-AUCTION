"use client";

import { useActionState } from "react";

import { approveAuctionAction, publishAuctionAction, rejectAuctionAction, reopenAuctionAction, startReviewAction, submitAuctionAction, type ReviewActionState } from "@/app/auctions/review-actions";
import { Alert, Button, Textarea } from "@/components/ui";

const initialState: ReviewActionState = {};

export function AuctionReviewActions({ auctionId, portal, status }: { auctionId: string; portal: "admin" | "client"; status: string }) {
  const action = portal === "client" ? (status === "DRAFT" ? submitAuctionAction.bind(null, auctionId) : reopenAuctionAction.bind(null, auctionId)) : status === "SUBMITTED" ? startReviewAction.bind(null, auctionId) : status === "UNDER_REVIEW" ? approveAuctionAction.bind(null, auctionId) : publishAuctionAction.bind(null, auctionId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const canReject = portal === "admin" && status === "UNDER_REVIEW";
  const canAct = (portal === "client" && (status === "DRAFT" || status === "REJECTED")) || (portal === "admin" && (status === "SUBMITTED" || status === "UNDER_REVIEW" || status === "APPROVED"));
  if (!canAct) return null;
  return <div className="mt-5 space-y-3">{state.error ? <Alert variant="danger">{state.error}</Alert> : null}<form action={formAction}>{portal === "client" ? <Button disabled={pending} type="submit">{status === "DRAFT" ? "Submit for review" : "Edit and resubmit"}</Button> : <Button disabled={pending} type="submit">{status === "SUBMITTED" ? "Start review" : status === "UNDER_REVIEW" ? "Approve auction" : "Publish auction"}</Button>}</form>{canReject ? <RejectForm auctionId={auctionId} /> : null}</div>;
}

function RejectForm({ auctionId }: { auctionId: string }) {
  const [state, action, pending] = useActionState(rejectAuctionAction.bind(null, auctionId), initialState);
  return <form action={action} className="space-y-3 border-t border-[var(--color-border)] pt-4"><label className="block text-sm font-medium">Rejection reason<Textarea maxLength={2000} name="reason" required rows={3} /></label>{state.error ? <Alert variant="danger">{state.error}</Alert> : null}<Button disabled={pending} type="submit" variant="danger">Reject auction</Button></form>;
}
