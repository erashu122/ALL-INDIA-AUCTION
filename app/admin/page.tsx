import { PortalDashboard } from "@/components/portal";
import { requirePortalAccess } from "@/lib/auth";

export default async function AdminPage() {
  const user = await requirePortalAccess("admin");
  return <PortalDashboard portal="admin" user={user} />;
}
