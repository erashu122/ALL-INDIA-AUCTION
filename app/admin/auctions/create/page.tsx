import { DraftAuctionForm } from "@/components/portal";
import { prisma } from "@/lib/prisma";

export default async function AdminCreateAuctionPage() {
  const clientOrganizations = await prisma.organization.findMany({ where: { type: "CLIENT", isActive: true }, select: { id: true, displayName: true, legalName: true }, orderBy: { legalName: "asc" } });
  return <DraftAuctionForm clientOrganizations={clientOrganizations.map((organization) => ({ id: organization.id, name: organization.displayName ?? organization.legalName }))} />;
}
