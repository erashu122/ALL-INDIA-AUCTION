import { PortalLayout } from "@/components/layout";
import { requirePortalAccess } from "@/lib/auth";

export default async function VendorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requirePortalAccess("vendor");
  return <PortalLayout portal="vendor" user={user}>{children}</PortalLayout>;
}
