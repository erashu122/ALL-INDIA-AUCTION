import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth";
import { AuctionFileError, readAuctionFile } from "@/services/auction-files";

export async function GET(_request: Request, { params }: { params: Promise<{ auctionId: string; kind: string; fileId: string }> }) {
  const { auctionId, kind, fileId } = await params;
  if (kind !== "document" && kind !== "media") return new NextResponse(null, { status: 404 });
  try { const file = await readAuctionFile(await getAuthenticatedUser(), auctionId, kind, fileId); const body = file.bytes.buffer.slice(file.bytes.byteOffset, file.bytes.byteOffset + file.bytes.byteLength) as ArrayBuffer; return new NextResponse(body, { headers: { "Content-Type": file.mimeType, "Content-Disposition": `attachment; filename="${file.name.replaceAll('"', "")}"`, "Cache-Control": "private, no-store" } }); } catch (error) { return new NextResponse(null, { status: error instanceof AuctionFileError ? 404 : 500 }); }
}
