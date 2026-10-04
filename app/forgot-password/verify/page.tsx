import { VerifyForgotPasswordForm } from "./verify-form";

type VerifyForgotPasswordPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function VerifyForgotPasswordPage({
  searchParams,
}: VerifyForgotPasswordPageProps) {
  const params = await searchParams;
  const email = params.email ?? "";

  return <VerifyForgotPasswordForm email={email} />;
}