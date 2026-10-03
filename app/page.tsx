import type { Metadata } from "next";
import { PublicHomePage } from "@/components/home";

export const metadata: Metadata = {
  title: "Smarter B2B Auctions & Procurement",
  description:
    "Create, manage and participate in competitive business auctions through one simple digital platform.",
};

export default function Home() {
  return <PublicHomePage />;
}
