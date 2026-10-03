import type { AuctionDocument, FileReference } from "./auction-document";

export type AuctionItemSpecification = {
  label: string;
  value: string;
};

export type AuctionItem = {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  specifications?: readonly AuctionItemSpecification[];
  location?: string;
  images?: readonly FileReference[];
  videos?: readonly FileReference[];
  supportingDocuments?: readonly AuctionDocument[];
};
