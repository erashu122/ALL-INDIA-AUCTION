export const AUCTION_RESULT_STATUSES = [
  "PENDING",
  "UNDER_REVIEW",
  "DECLARED",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const;

export type AuctionResultStatus = (typeof AUCTION_RESULT_STATUSES)[number];

export type AuctionWinningBid = {
  id: string;
  amount?: number;
  rank?: number;
  submittedAt: string;
};

export type AuctionResult = {
  winningVendorId?: string;
  winningBid?: AuctionWinningBid;
  status: AuctionResultStatus;
  resultTimestamp?: string;
};
