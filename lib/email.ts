import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

function getEmailFrom() {
  const emailFrom = process.env.EMAIL_FROM;

  if (!emailFrom) {
    throw new Error("EMAIL_FROM is not configured.");
  }

  return emailFrom;
}

export async function sendRegistrationOtpEmail({
  email,
  name,
  otp,
}: {
  email: string;
  name: string;
  otp: string;
}) {
  const resend = getResendClient();

  const safeName = escapeHtml(name);
  const safeOtp = escapeHtml(otp);

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: [email],
    subject: "Verify your email — Auction Platform",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
          <div style="max-width:600px;margin:40px auto;padding:0 20px;">
            <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:32px;">
              
              <div style="margin-bottom:24px;">
                <div style="display:inline-block;background:#0f172a;color:#ffffff;padding:10px 14px;border-radius:10px;font-weight:700;">
                  EA
                </div>
              </div>

              <h1 style="margin:0 0 12px;font-size:24px;">
                Verify your email
              </h1>

              <p style="margin:0 0 20px;color:#475569;line-height:1.6;">
                Hello ${safeName},
              </p>

              <p style="margin:0 0 24px;color:#475569;line-height:1.6;">
                Thank you for registering with our Auction Platform.
                Use the verification code below to verify your email address.
              </p>

              <div style="margin:28px 0;text-align:center;">
                <div style="display:inline-block;background:#f1f5f9;border-radius:14px;padding:18px 28px;font-size:32px;letter-spacing:8px;font-weight:700;color:#0f172a;">
                  ${safeOtp}
                </div>
              </div>

              <p style="margin:0 0 12px;color:#64748b;font-size:14px;line-height:1.6;">
                This verification code is valid for 10 minutes.
              </p>

              <p style="margin:0;color:#64748b;font-size:14px;line-height:1.6;">
                If you did not request this registration, you can safely ignore this email.
              </p>

              <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e2e8f0;">
                <p style="margin:0;color:#94a3b8;font-size:12px;">
                  This is an automated email. Please do not reply.
                </p>
              </div>

            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}