import { prisma } from "@/lib/prisma";
import VendorActions from "./vendor-actions";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function statusLabel(isActive: boolean, userStatus: string | undefined) {
  if (isActive && userStatus === "ACTIVE") return "Active";
  return "Pending Activation";
}

function statusClasses(status: string) {
  if (status === "Active") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
  }

  return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
}

export default async function AdminVendorsPage() {
  const organizations = await prisma.organization.findMany({
    where: {
      type: "VENDOR",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      users: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          isPrimary: "desc",
        },
      },
    },
  });

  const rows = organizations.map((organization) => {
    const primaryUser =
      organization.users.find((membership) => membership.isPrimary)?.user ??
      organization.users[0]?.user;

    const status = statusLabel(organization.isActive, primaryUser?.status);

    return {
      id: organization.id,
      name: organization.displayName || organization.legalName,
      type: organization.entityType || "—",
      contactName: primaryUser?.name || "—",
      email: primaryUser?.email || organization.email || "—",
      phone: primaryUser?.phone || organization.phone || "—",
      createdAt: formatDate(organization.createdAt),
      status,
      isActive: status === "Active",
    };
  });

  const pendingCount = rows.filter(
    (row) => row.status === "Pending Activation",
  ).length;
  const activeCount = rows.filter((row) => row.status === "Active").length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Admin Control Center
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Vendor Registrations
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Review vendor registrations, activate or deactivate access, and
                remove registrations that have no auction or payment history.
              </p>
            </div>

            <a
              href="/admin"
              className="inline-flex w-fit items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ← Admin Dashboard
            </a>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Vendors</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {rows.length}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-700">
              Pending Activation
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-900">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-700">
              Active Vendors
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-900">
              {activeCount}
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-950">
              Registered Vendors
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Activate a vendor to allow login. Deactivate to immediately
              disable login access.
            </p>
          </div>

          {rows.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-base font-semibold text-slate-900">
                No vendor registrations found.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Vendor registrations submitted from the public registration
                page will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1120px] w-full text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-4">Organization</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Primary Contact</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Registered</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.id} className="transition hover:bg-slate-50/70">
                      <td className="px-6 py-5">
                        <div className="font-semibold text-slate-950">
                          {row.name}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {row.phone}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-700">
                        {row.type}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-700">
                        {row.contactName}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-700">
                        {row.email}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {row.createdAt}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                            row.status,
                          )}`}
                        >
                          {row.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <VendorActions
                          organizationId={row.id}
                          organizationName={row.name}
                          isActive={row.isActive}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
