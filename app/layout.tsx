import type { Metadata } from "next";
import { ApplicationShell } from "@/components/layout/application-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "B2B E-Auction & E-Procurement Platform",
  description: "Project foundation for a B2B e-auction and e-procurement platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ApplicationShell>{children}</ApplicationShell>
      </body>
    </html>
  );
}
