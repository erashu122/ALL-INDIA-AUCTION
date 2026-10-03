"use client";

import { useActionState } from "react";

import { participateAction, type ParticipationActionState } from "@/app/vendor/auctions/actions";
import { Alert, Button } from "@/components/ui";

const initial: ParticipationActionState = {};
export function VendorParticipationAction({ auctionId, allowed, reason }: { auctionId: string; allowed: boolean; reason?: string }) {
  const [state, action, pending] = useActionState(participateAction.bind(null, auctionId), initial);
  return <div className="mt-4">{state.error ? <Alert variant="danger">{state.error}</Alert> : null}{state.success ? <Alert variant="success">{state.success}</Alert> : null}{allowed ? <form action={action}><Button disabled={pending} type="submit">{pending ? "Submitting..." : "Participate"}</Button></form> : <p className="text-sm text-[var(--color-text-muted)]">{reason ?? "Participation is unavailable."}</p>}</div>;
}
