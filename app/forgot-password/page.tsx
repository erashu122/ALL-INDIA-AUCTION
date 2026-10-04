"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  sendForgotPasswordOtpAction,
  type ForgotPasswordState,
} from "./actions";
import { Alert, Button, Input } from "@/components/ui";

const initialState: ForgotPasswordState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    sendForgotPasswordOtpAction,
    initialState,
  );

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
            Recover your account securely.
          </h1>

          <p className="mt-5 text-base leading-7 text-slate-200">
            We will send a one-time password to your registered work email
            address so you can safely reset your account password.
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
              Account recovery
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[var(--color-text)]">
              Forgot password?
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
              Enter your registered work email and we will send you a
              one-time password.
            </p>
          </div>

          {state.message ? (
            <div className="mb-5">
              <Alert variant={state.success ? "success" : "danger"}>
                {state.message}
              </Alert>
            </div>
          ) : null}

          <form action={formAction} className="space-y-5" noValidate>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                htmlFor="email"
              >
                Registered work email
              </label>

              <Input
                autoComplete="email"
                id="email"
                name="email"
                placeholder="name@company.com"
                type="email"
                required
              />
            </div>

            <Button
              className="w-full"
              disabled={isPending}
              size="lg"
              type="submit"
            >
              {isPending ? "Sending OTP..." : "Send OTP"}
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
        </div>
      </section>
    </main>
  );
}