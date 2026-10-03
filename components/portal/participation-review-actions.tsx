"use client";

import { useActionState } from "react";

import { approveParticipationAction, rejectParticipationAction, verifyEmdAction, type ParticipationReviewActionState } from "@/app/admin/participations/actions";
import { Alert, Button, Textarea } from "@/components/ui";

const initial: ParticipationReviewActionState = {};
export function ParticipationReviewActions({ emdStatus, participationId, status }: { emdStatus?: string; participationId: string; status: string }) {
  const [approveState, approve, approving] = useActionState(approveParticipationAction.bind(null, participationId), initial); const [rejectState, reject, rejecting] = useActionState(rejectParticipationAction.bind(null, participationId), initial); const [emdState, verify, verifying] = useActionState(verifyEmdAction.bind(null, participationId), initial);
  return <div className="mt-3 flex flex-wrap gap-2">{status === "SUBMITTED" ? <><form action={approve}><Button disabled={approving} size="sm" type="submit">Approve</Button></form><form action={reject} className="flex gap-2"><Textarea className="min-h-9 w-52" maxLength={2000} name="reason" placeholder="Rejection reason" required rows={1} /><Button disabled={rejecting} size="sm" type="submit" variant="danger">Reject</Button></form></> : null}{status === "APPROVED" && emdStatus === "PENDING" ? <form action={verify}><Button disabled={verifying} size="sm" type="submit" variant="outline">Verify EMD</Button></form> : null}{approveState.error || rejectState.error || emdState.error ? <Alert variant="danger">{approveState.error ?? rejectState.error ?? emdState.error}</Alert> : null}</div>;
}
