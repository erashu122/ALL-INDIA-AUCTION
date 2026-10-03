import type { RouteRole } from "@/types/routes";
import { PortalPage } from "@/components/portal";

type RoutePlaceholderProps = {
  pageName: string;
  route: string;
  role: RouteRole;
};

export function RoutePlaceholder({
  pageName,
  route,
  role,
}: RoutePlaceholderProps) {
  if (role !== "Public") {
    const portal = role.toLowerCase() as "client" | "vendor" | "admin";
    return <PortalPage description={`This ${pageName.toLowerCase()} workspace is ready for the next operational implementation step.`} portal={portal} title={pageName} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-2xl border border-neutral-200 p-8">
        <p className="text-sm font-medium text-neutral-500">{role} Route</p>
        <h1 className="mt-3 text-2xl font-semibold text-neutral-950">
          {pageName}
        </h1>
        <dl className="mt-6 grid gap-3 text-sm text-neutral-700">
          <div>
            <dt className="font-medium text-neutral-950">Current route</dt>
            <dd className="mt-1 font-mono">{route}</dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-950">Intended role</dt>
            <dd className="mt-1">{role}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
