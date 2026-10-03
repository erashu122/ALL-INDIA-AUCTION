"use server";

import { revalidatePath } from "next/cache";

import { getAuthenticatedUser } from "@/lib/auth";
import { approveParticipation, ParticipationReviewError, rejectParticipation, verifyParticipationEmd } from "@/services/participation-review";

export type ParticipationReviewActionState = { error?: string; success?: string };
async function execute(fn: (actor: Awaited<ReturnType<typeof getAuthenticatedUser>>) => Promise<unknown>): Promise<ParticipationReviewActionState> { const actor = await getAuthenticatedUser(); if (!actor) return { error: "Sign in is required." }; try { await fn(actor); revalidatePath("/admin/participations"); return { success: "Participation updated." }; } catch (error) { return { error: error instanceof ParticipationReviewError ? error.message : "Unable to update participation." }; } }
export async function approveParticipationAction(id: string, _state: ParticipationReviewActionState, _form: FormData) { void _state; void _form; return execute((actor) => approveParticipation(actor!, id)); }
export async function rejectParticipationAction(id: string, _state: ParticipationReviewActionState, form: FormData) { void _state; return execute((actor) => rejectParticipation(actor!, id, String(form.get("reason") ?? ""))); }
export async function verifyEmdAction(id: string, _state: ParticipationReviewActionState, _form: FormData) { void _state; void _form; return execute((actor) => verifyParticipationEmd(actor!, id)); }
