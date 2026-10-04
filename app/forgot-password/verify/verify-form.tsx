"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { Alert, Button, Input } from "@/components/ui";
import {
  verifyForgotPasswordOtpAction,
  type VerifyOtpResult,
} from "./actions";

const initialState: VerifyOtpResult = {
  success: false,
  message: "",
};

type VerifyForgotPasswordFormProps = {
  email: string;
};

export function VerifyForgotPasswordForm({
  email,
}: VerifyForgotPasswordFormProps) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    verifyForgotPasswordOtpAction,
    initialState,
  );

  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (state.success) {
      router.push("/forgot-password/reset");
    }
  }, [router, state.success]);

  function handleOtpChange(value: string) {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
    setOtp(digitsOnly);
  }

  return (
    <main className="grid min-h-screen bg-[var(--background)] lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.8fr)]">
      <section className="hidden border-r border-[var(--color-border)] bg-[var(--color-secondary)] px-12 py-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="text-xl font-semibold tracking-[0.02em]">
          AuctionSphere
        </div>

        <div className="max-w-md">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-teal-200">
            Verify your identity
          </p>

          <h1 className="mt-5 text-4xl font-semibold leading-tight">
            Enter the OTP from your email.
          </h1>

          <p className="mt-5 text-base leading-7 text-slate-200">
            Enter the 6-digit verification code sent to your registered work
            email address.
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
              OTP verification
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[var(--color-text)]">
              Verify OTP
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
              Enter the 6-digit OTP sent to your registered email address.
            </p>

            {email ? (
              <p className="mt-3 text-sm font-medium text-[var(--color-text)]">
                {email}
              </p>
            ) : null}
          </div>

          {state.message ? (
            <div className="mb-5">
              <Alert variant={state.success ? "success" : "danger"}>
                {state.message}
              </Alert>
            </div>
          ) : null}

          <form action={formAction} className="space-y-5" noValidate>
            <input name="email" type="hidden" value={email} />

            <div>
              <label
                className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                htmlFor="otp"
              >
                6-digit OTP
              </label>

              <Input
                autoComplete="one-time-code"
                autoFocus
                id="otp"
                inputMode="numeric"
                maxLength={6}
                name="otp"
                onChange={(event) => handleOtpChange(event.target.value)}
                placeholder="Enter 6-digit OTP"
                type="text"
                value={otp}
                required
              />

              <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                The OTP is valid for 10 minutes.
              </p>
            </div>

            <Button
              className="w-full"
              disabled={isPending || otp.length !== 6 || !email}
              size="lg"
              type="submit"
            >
              {isPending ? "Verifying..." : "Verify OTP"}
            </Button>

            <p className="text-center text-sm text-[var(--color-text-muted)]">
              Didn&apos;t request this?{" "}
              <Link
                className="font-medium text-[var(--color-primary)] hover:underline"
                href="/forgot-password"
              >
                Start again
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}