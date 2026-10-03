import { LoginForm } from "@/components/auth";
import { getAuthenticatedUser, getPortalHome } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await getAuthenticatedUser();

  if (user) {
    redirect(getPortalHome(user.role));
  }

  return (
    <main className="grid min-h-screen bg-[var(--background)] lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.8fr)]">
      <section className="hidden border-r border-[var(--color-border)] bg-[var(--color-secondary)] px-12 py-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="text-xl font-semibold tracking-[0.02em]">AuctionSphere</div>
        <div className="max-w-md">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-teal-200">Secure procurement workspace</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight">Run every auction with clarity and control.</h1>
          <p className="mt-5 text-base leading-7 text-slate-200">A focused workspace for buyers, suppliers, and platform operations.</p>
        </div>
        <p className="text-sm text-slate-300">B2B E-Auction &amp; E-Procurement Platform</p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-md)] sm:p-8">
          <div className="mb-8">
            <p className="text-lg font-semibold text-[var(--color-secondary)] lg:hidden">AuctionSphere</p>
            <p className="mt-5 text-sm font-medium text-[var(--color-primary)]">Secure access</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--color-text)]">Sign in</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">Use your organization credentials to access your workspace.</p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
