"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteVendorAction,
  resetVendorPasswordAction,
  toggleVendorStatusAction,
} from "./actions";

type VendorActionsProps = {
  organizationId: string;
  organizationName: string;
  isActive: boolean;
};

export default function VendorActions({
  organizationId,
  organizationName,
  isActive,
}: VendorActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  function handleToggle() {
    setMessage("");

    startTransition(async () => {
      const result = await toggleVendorStatusAction(organizationId);
      setMessage(result.message);

      if (result.success) {
        router.refresh();
      }
    });
  }

  function openPasswordModal() {
    setPasswordMessage("");
    setTemporaryPassword("");
    setShowPasswordModal(true);
  }

  function handlePasswordReset() {
    setPasswordMessage("");
    setTemporaryPassword("");

    startTransition(async () => {
      const result = await resetVendorPasswordAction(organizationId);

      setPasswordMessage(result.message);

      if (result.success && result.temporaryPassword) {
        setTemporaryPassword(result.temporaryPassword);
        router.refresh();
      }
    });
  }

  function handleDelete() {
    setMessage("");
    setShowDeleteConfirm(false);

    startTransition(async () => {
      const result = await deleteVendorAction(organizationId);
      setMessage(result.message);

      if (result.success) {
        router.refresh();
      }
    });
  }

  async function copyTemporaryPassword() {
    if (!temporaryPassword) return;

    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setPasswordMessage("Temporary password copied.");
    } catch {
      setPasswordMessage("Could not copy automatically. Please copy it manually.");
    }
  }

  return (
    <>
      <div className="flex flex-col items-start gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openPasswordModal}
            disabled={isPending}
            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Password
          </button>

          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isActive
                ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {isPending ? "Please wait..." : isActive ? "Deactivate" : "Activate"}
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isPending}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete
          </button>
        </div>

        {message ? (
          <p className="max-w-xs text-xs leading-5 text-slate-500">
            {message}
          </p>
        ) : null}
      </div>

      {showPasswordModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-lg text-blue-700">
              🔑
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-950">
              Vendor Password
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              For security, the vendor&apos;s old password cannot be viewed.
              This option generates a new temporary password instead.
            </p>

            {temporaryPassword ? (
              <>
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Temporary Password
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <code className="min-w-0 flex-1 break-all rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                      {temporaryPassword}
                    </code>

                    <button
                      type="button"
                      onClick={copyTemporaryPassword}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-5 text-amber-700">
                  Give this temporary password to the vendor through a secure
                  channel. The previous password is no longer valid.
                </p>
              </>
            ) : (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Click <span className="font-semibold">Generate Temporary Password</span>{" "}
                to replace the current password.
              </div>
            )}

            {passwordMessage ? (
              <p className="mt-3 text-xs font-medium text-slate-600">
                {passwordMessage}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setTemporaryPassword("");
                  setPasswordMessage("");
                }}
                disabled={isPending}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

              {!temporaryPassword ? (
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={isPending}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPending ? "Generating..." : "Generate Temporary Password"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-lg text-red-600">
              !
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-950">
              Delete vendor?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              You are about to permanently delete{" "}
              <span className="font-semibold text-slate-900">
                {organizationName}
              </span>
              . This is allowed only when the vendor has no auction or payment
              history.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isPending}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
