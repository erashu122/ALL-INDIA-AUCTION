import { PortalDashboard } from "@/components/portal";
import { requirePortalAccess } from "@/lib/auth";

export default async function VendorPage() {
  const user = await requirePortalAccess("vendor");
  return <PortalDashboard portal="vendor" user={user} />;
}
