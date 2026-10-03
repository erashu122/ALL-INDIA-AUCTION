import { PortalLayout } from "@/components/layout";
import { requirePortalAccess } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requirePortalAccess("admin");
  return <PortalLayout portal="admin" user={user}>{children}</PortalLayout>;
}
