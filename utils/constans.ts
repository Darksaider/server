export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 12;
export const RATING_DECIMAL_PLACES = 10;
export const PRICE_DECIMAL_PLACES = 100;
export const MIN_RATING_RANGE = 0;
export const MAX_RATING_RANGE = 5;

export const ORDER_STATUS = {
  Pending: "pending",
  Confirmed: "confirmed",
  Shipped: "shipped",
  Delivered: "delivered",
  Cancelled: "cancelled",
  Returned: "returned",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_STATUS = {
  Awaiting: "awaiting",
  Completed: "completed",
  Failed: "failed",
  Expired: "expired",
  Refunded: "refunded",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
