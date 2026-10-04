"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { signInAction } from "@/app/login/actions";
import { Alert, Button, Checkbox, Input } from "@/components/ui";
import type { SignInFormState } from "@/types/auth";

const initialState: SignInFormState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error ? <Alert variant="danger">{state.error}</Alert> : null}

      <div>
        <label
          className="mb-2 block text-sm font-medium text-[var(--color-text)]"
          htmlFor="email"
        >
          Work email
        </label>

        <Input
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          autoComplete="email"
          id="email"
          name="email"
          placeholder="name@company.com"
          type="email"
        />

        {state.fieldErrors?.email ? (
          <p
            className="mt-2 text-sm text-[var(--color-danger)]"
            id="email-error"
          >
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <label
            className="text-sm font-medium text-[var(--color-text)]"
            htmlFor="password"
          >
            Password
          </label>

          <Link
            className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>

        <div className="relative">
          <Input
            aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors?.password)}
            autoComplete="current-password"
            className="pr-16"
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
          />

          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)]"
            onClick={() => setShowPassword((current) => !current)}
            type="button"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {state.fieldErrors?.password ? (
          <p
            className="mt-2 text-sm text-[var(--color-danger)]"
            id="password-error"
          >
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <Checkbox name="remember" />
        Keep me signed in on this device
      </label>

      <Button
        className="w-full"
        disabled={isPending}
        size="lg"
        type="submit"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-sm text-[var(--color-text-muted)]">
        New to the platform?{" "}
        <Link
          className="font-medium text-[var(--color-primary)] hover:underline"
          href="/register"
        >
          Register your organization
        </Link>
      </p>
    </form>
  );
}