export const AUCTION_DOCUMENT_TYPES = [
  "TENDER",
  "TECHNICAL_SPECIFICATION",
  "COMMERCIAL_TERMS",
  "ELIGIBILITY",
  "EMD",
  "CLARIFICATION",
  "RESULT",
  "OTHER",
] as const;

export const DOCUMENT_REQUIREMENT_STATES = ["REQUIRED", "OPTIONAL"] as const;
export const FILE_ACCESS_LEVELS = ["PUBLIC", "PRIVATE", "INTERNAL"] as const;

export type AuctionDocumentType = (typeof AUCTION_DOCUMENT_TYPES)[number];
export type DocumentRequirementState =
  (typeof DOCUMENT_REQUIREMENT_STATES)[number];
export type FileAccess = (typeof FILE_ACCESS_LEVELS)[number];

export type FileReference = {
  id: string;
  name: string;
  url?: string;
  mimeType?: string;
  sizeInBytes?: number;
};

export type AuctionDocument = {
  id: string;
  name: string;
  type: AuctionDocumentType;
  file: FileReference;
  version: number;
  uploadedAt: string;
  requirementState: DocumentRequirementState;
  access: FileAccess;
  uploadedById: string;
};

export type AuctionMedia = {
  id: string;
  type: "IMAGE" | "VIDEO";
  file: FileReference;
  access: FileAccess;
  uploadedById: string;
  uploadedAt: string;
};
