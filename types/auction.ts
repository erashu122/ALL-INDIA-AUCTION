import type { AuctionDocument } from "./auction-document";
import type { AuctionItem } from "./auction-item";
import type { AuctionResult } from "./auction-result";
import type {
  AuctionTimingRules,
  AuctionVisibility,
  EmdRequirement,
  PriceRule,
  VendorEligibility,
} from "./auction-rules";

export const AUCTION_TYPES = ["FORWARD", "REVERSE", "RANK"] as const;

export const AUCTION_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "UPCOMING",
  "LIVE",
  "EXTENDED",
  "CLOSED",
  "RESULT_DECLARED",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
  "WITHDRAWN",
] as const;

export type AuctionType = (typeof AUCTION_TYPES)[number];
export type AuctionStatus = (typeof AUCTION_STATUSES)[number];

export type AuditMetadata = {
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
};

export type AuctionCoreInformation = {
  id: string;
  auctionNumber: string;
  tenderNumber?: string;
  title: string;
  description?: string;
  category: string;
  termsAndConditions?: string;
  vendorRequirements?: string;
  clientId: string;
  clientReference?: string;
  location?: string;
  startAt: string;
  endAt: string;
  timezone: string;
  status: AuctionStatus;
  type: AuctionType;
  visibility: AuctionVisibility;
};

export type ForwardAuction = AuctionCoreInformation & {
  type: "FORWARD";
  pricing: PriceRule & {
    bidDirection: "UPWARD";
  };
};

export type ReverseAuction = AuctionCoreInformation & {
  type: "REVERSE";
  pricing: PriceRule & {
    bidDirection: "DOWNWARD";
  };
};

export type RankAuction = AuctionCoreInformation & {
  type: "RANK";
  pricing: Omit<PriceRule, "bidDirection" | "minimumBidValue" | "maximumBidValue"> & {
    bidDirection: "RANK_BASED";
  };
};

export type AuctionPricingModel =
  | ForwardAuction
  | ReverseAuction
  | RankAuction;

export type Auction = AuctionPricingModel & {
  timingRules: AuctionTimingRules;
  items: readonly AuctionItem[];
  emdRequirement?: EmdRequirement;
  vendorEligibility: VendorEligibility;
  documents?: readonly AuctionDocument[];
  result?: AuctionResult;
  audit: AuditMetadata;
};

export type AuctionSummary = Pick<
  Auction,
  | "id"
  | "auctionNumber"
  | "title"
  | "category"
  | "clientId"
  | "startAt"
  | "endAt"
  | "timezone"
  | "status"
  | "type"
  | "visibility"
>;
