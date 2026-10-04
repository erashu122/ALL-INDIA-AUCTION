import { PortalLayout } from "@/components/layout";
import { requirePortalAccess } from "@/lib/auth";

export default async function VendorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requirePortalAccess("vendor");

  if (user.mustChangePassword) {
    return (
      <main className="min-h-screen bg-[var(--color-surface-muted)] px-4 py-10">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center">
          <div className="w-full rounded-2xl border border-[var(--color-border)] bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
              Security
            </p>

            <h1 className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">
              Password change required
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--color-muted-foreground)]">
              Your account is using a temporary password. Please change your
              password before accessing the vendor dashboard.
            </p>

            <a
              href="/change-password"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Change Password
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <PortalLayout portal="vendor" user={user}>
      {children}
    </PortalLayout>
  );
}