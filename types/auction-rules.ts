export const CURRENCIES = ["INR", "USD", "EUR", "GBP"] as const;

export const BID_DIRECTIONS = ["UPWARD", "DOWNWARD", "RANK_BASED"] as const;

export const AUCTION_VISIBILITIES = ["PUBLIC", "PRIVATE"] as const;

export const PARTICIPATION_TYPES = ["OPEN", "RESTRICTED"] as const;

export const EMD_STATUSES = [
  "NOT_REQUIRED",
  "PENDING",
  "SUBMITTED",
  "VERIFIED",
  "REJECTED",
  "REFUNDED",
] as const;

export type Currency = (typeof CURRENCIES)[number];
export type BidDirection = (typeof BID_DIRECTIONS)[number];
export type AuctionVisibility = (typeof AUCTION_VISIBILITIES)[number];
export type ParticipationType = (typeof PARTICIPATION_TYPES)[number];
export type EmdStatus = (typeof EMD_STATUSES)[number];

export type Money = {
  amount: number;
  currency: Currency;
};

export type Quantity = {
  value: number;
  unit: string;
};

export type PriceRule = {
  startingPrice?: Money;
  bidDirection: BidDirection;
  bidStep?: Money;
  minimumBidValue?: Money;
  maximumBidValue?: Money;
  quantity?: Quantity;
};

export type ExtensionRule = {
  autoExtensionEnabled: boolean;
  extensionDurationMinutes?: number;
  triggerWindowMinutes?: number;
  maximumExtensions?: number;
};

export type AuctionTimingRules = {
  scheduledStartAt: string;
  scheduledEndAt: string;
  timezone: string;
  extensionRule?: ExtensionRule;
  participationDeadlineAt?: string;
};

export type EmdRequirement = {
  required: boolean;
  amount?: Money;
  securityDepositRequirement?: string;
  status?: EmdStatus;
};

export type VendorEligibility = {
  participationType: ParticipationType;
  eligibleVendorIds?: readonly string[];
  requirements?: readonly string[];
};
