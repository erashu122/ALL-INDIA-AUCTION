"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePasswordAction, type ChangePasswordState } from "./actions";

const initialState: ChangePasswordState = {
  success: false,
  message: "",
};

export function ChangePasswordForm() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState,
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!state.success) {
      return;
    }

    const timer = window.setTimeout(() => {
      router.push("/vendor");
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [router, state.success]);

  return (
    <main className="min-h-screen bg-[var(--color-surface-muted)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <div className="w-full rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
              Security
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Change your password
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">
              You are using a temporary password. Please create a new password
              before continuing to your vendor dashboard.
            </p>
          </div>

          {state.message ? (
            <div className="mb-6">
              <Alert
                variant={state.success ? "success" : "danger"}
              >
                {state.message}
              </Alert>
            </div>
          ) : null}

          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
              >
                New Password
              </label>

              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  disabled={isPending || state.success}
                  required
                  className="pr-20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={isPending || state.success}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--color-primary)] hover:underline disabled:opacity-50"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
              >
                Confirm New Password
              </label>

              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  disabled={isPending || state.success}
                  required
                  className="pr-20"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  disabled={isPending || state.success}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--color-primary)] hover:underline disabled:opacity-50"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
              <p className="text-xs font-semibold text-[var(--color-foreground)]">
                Password requirements
              </p>

              <ul className="mt-2 space-y-1 text-xs text-[var(--color-muted-foreground)]">
                <li>• At least 8 characters</li>
                <li>• One uppercase letter</li>
                <li>• One lowercase letter</li>
                <li>• One number</li>
                <li>• One special character</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || state.success}
            >
              {isPending ? "Changing password..." : "Change Password"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}