"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { Alert, Button, Input } from "@/components/ui";
import {
  resetPasswordAction,
  type ResetPasswordState,
} from "./actions";

const initialState: ResetPasswordState = {
  success: false,
  message: "",
};

export function ResetPasswordForm() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  useEffect(() => {
    if (!state.success) {
      return;
    }

    const timer = window.setTimeout(() => {
      router.push("/login");
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [router, state.success]);

  return (
    <main className="grid min-h-screen bg-[var(--background)] lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.8fr)]">
      <section className="hidden border-r border-[var(--color-border)] bg-[var(--color-secondary)] px-12 py-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="text-xl font-semibold tracking-[0.02em]">
          AuctionSphere
        </div>

        <div className="max-w-md">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-teal-200">
            Secure account recovery
          </p>

          <h1 className="mt-5 text-4xl font-semibold leading-tight">
            Create a new password.
          </h1>

          <p className="mt-5 text-base leading-7 text-slate-200">
            Choose a strong password that you can use to securely access
            your AuctionSphere account.
          </p>
        </div>

        <p className="text-sm text-slate-300">
          B2B E-Auction &amp; E-Procurement Platform
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-md)] sm:p-8">
          <div className="mb-8">
            <p className="text-lg font-semibold text-[var(--color-secondary)] lg:hidden">
              AuctionSphere
            </p>

            <p className="mt-5 text-sm font-medium text-[var(--color-primary)]">
              Password reset
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[var(--color-text)]">
              Create new password
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
              Enter and confirm your new password below.
            </p>
          </div>

          {state.message ? (
            <div className="mb-5">
              <Alert variant={state.success ? "success" : "danger"}>
                {state.message}
              </Alert>
            </div>
          ) : null}

          {state.success ? (
            <div className="space-y-5">
              <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                Your password has been updated. You will be redirected to
                the sign-in page shortly.
              </p>

              <Link
                className="block text-center text-sm font-medium text-[var(--color-primary)] hover:underline"
                href="/login"
              >
                Go to sign in
              </Link>
            </div>
          ) : (
            <form action={formAction} className="space-y-5" noValidate>
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                  htmlFor="password"
                >
                  New password
                </label>

                <div className="relative">
                  <Input
                    autoComplete="new-password"
                    className="pr-16"
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                  />

                  <button
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)]"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    type="button"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
                  Minimum 8 characters with uppercase, lowercase, number
                  and special character.
                </p>
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                  htmlFor="confirmPassword"
                >
                  Confirm new password
                </label>

                <div className="relative">
                  <Input
                    autoComplete="new-password"
                    className="pr-16"
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    required
                  />

                  <button
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)]"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current,
                      )
                    }
                    type="button"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <Button
                className="w-full"
                disabled={isPending}
                size="lg"
                type="submit"
              >
                {isPending
                  ? "Resetting password..."
                  : "Reset password"}
              </Button>

              <p className="text-center text-sm text-[var(--color-text-muted)]">
                Remember your password?{" "}
                <Link
                  className="font-medium text-[var(--color-primary)] hover:underline"
                  href="/login"
                >
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}