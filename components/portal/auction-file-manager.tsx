"use client";

import { useActionState } from "react";

import { deleteAuctionFileAction, updateAuctionFileAccessAction, uploadAuctionFileAction, type FileActionState } from "@/app/auctions/file-actions";
import { Alert, Button, Card, Select } from "@/components/ui";

type FileEntry = { id: string; kind: "document" | "media"; label: string; type: string; mimeType: string | null; sizeInBytes: number | null; access: "PUBLIC" | "PRIVATE" | "INTERNAL"; auctionItemId: string | null; createdAt: Date; uploadedBy: { name: string } };
type Props = { auctionId: string; canManage: boolean; files: readonly FileEntry[]; lots: readonly { id: string; lotNumber: string; name: string }[]; portal: "admin" | "client" };
const initial: FileActionState = {};

export function AuctionFileManager({ auctionId, canManage, files, lots, portal }: Props) {
  const [state, action, pending] = useActionState(uploadAuctionFileAction.bind(null, auctionId, portal), initial);
  return <Card><h2 className="text-lg font-semibold">Files</h2><p className="mt-1 text-sm text-[var(--color-text-muted)]">Files are private by default. Public availability requires a separate authorized change.</p>{canManage ? <form action={action} className="mt-4 grid gap-3 md:grid-cols-2"><input name="file" required type="file" /><Select defaultValue="document" name="kind"><option value="document">Document</option><option value="media">Image or video</option></Select><Select defaultValue="OTHER" name="type"><option value="OTHER">Other document / image</option><option value="TENDER">Tender document</option><option value="TECHNICAL_SPECIFICATION">Technical specification</option><option value="IMAGE">Image</option><option value="VIDEO">Video</option></Select><Select name="auctionItemId"><option value="">Auction-level file</option>{lots.map((lot) => <option key={lot.id} value={lot.id}>Lot {lot.lotNumber}: {lot.name}</option>)}</Select>{state.error ? <Alert variant="danger">{state.error}</Alert> : null}{state.success ? <Alert variant="success">{state.success}</Alert> : null}<Button disabled={pending} type="submit">{pending ? "Uploading..." : "Upload file"}</Button></form> : null}<div className="mt-5 space-y-3">{files.length ? files.map((file) => <FileRow auctionId={auctionId} canManage={canManage} file={file} key={`${file.kind}-${file.id}`} portal={portal} />) : <p className="text-sm text-[var(--color-text-muted)]">No files attached.</p>}</div></Card>;
}
function FileRow({ auctionId, canManage, file, portal }: { auctionId: string; canManage: boolean; file: FileEntry; portal: "admin" | "client" }) {
  const [deleteState, deleteAction, deleting] = useActionState(deleteAuctionFileAction.bind(null, auctionId, portal, file.kind, file.id), initial);
  const [accessState, accessAction, savingAccess] = useActionState(updateAuctionFileAccessAction.bind(null, auctionId, portal, file.kind, file.id), initial);
  return <div className="border-t border-[var(--color-border)] pt-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><a className="font-medium text-[var(--color-primary)] hover:underline" href={`/api/auctions/${auctionId}/files/${file.kind}/${file.id}`}>{file.label}</a><p className="mt-1 text-xs text-[var(--color-text-muted)]">{file.type} · {file.sizeInBytes ?? 0} bytes · {file.uploadedBy.name} · {file.createdAt.toLocaleString()}</p></div>{canManage ? <div className="flex gap-2"><form action={accessAction}><Select defaultValue={file.access} name="access"><option value="PRIVATE">Private</option><option value="INTERNAL">Internal</option><option value="PUBLIC">Public</option></Select><Button disabled={savingAccess} size="sm" type="submit" variant="outline">Save</Button></form><form action={deleteAction}><Button disabled={deleting} size="sm" type="submit" variant="danger">Delete</Button></form></div> : null}</div>{deleteState.error || accessState.error ? <Alert className="mt-2" variant="danger">{deleteState.error ?? accessState.error}</Alert> : null}</div>;
}
