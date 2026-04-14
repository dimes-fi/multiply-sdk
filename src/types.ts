/**
 * Dimes Multiply SDK — Type definitions
 *
 * Core types for interacting with the Multiply leverage protocol
 * on prediction markets.
 */

// ── Configuration ──────────────────────────────────────────────

export interface MultiplyConfig {
  /** API key from https://app.dimes.fi/developers */
  apiKey: string;
  /** Base URL for the Multiply API (default: https://api.dimes.fi/v1) */
  baseUrl?: string;
  /** Chain ID (default: 137 for Polygon) */
  chainId?: number;
  /** Request timeout in ms (default: 30000) */
  timeout?: number;
}

// ── Markets ────────────────────────────────────────────────────

export type MarketStatus = "active" | "paused" | "resolved" | "expired";
export type OutcomeType = "binary" | "multi";

export interface Market {
  /** Unique market identifier */
  id: string;
  /** Human-readable market title */
  title: string;
  /** Longer description of the market question */
  description: string;
  /** Source platform (e.g. "polymarket", "kalshi") */
  platform: string;
  /** External market ID on the source platform */
  platformMarketId: string;
  /** Binary or multi-outcome */
  outcomeType: OutcomeType;
  /** Possible outcomes */
  outcomes: Outcome[];
  /** Current market status */
  status: MarketStatus;
  /** Total liquidity in USDC */
  liquidityUsdc: number;
  /** Total open interest in USDC */
  openInterestUsdc: number;
  /** Maximum leverage available for this market */
  maxLeverage: number;
  /** ISO 8601 resolution date */
  resolutionDate: string;
  /** ISO 8601 creation timestamp */
  createdAt: string;
}

export interface Outcome {
  /** Outcome identifier */
  id: string;
  /** Outcome label (e.g. "Yes", "No", "Candidate A") */
  label: string;
  /** Current price (0-1) */
  price: number;
}

export interface MarketFilter {
  /** Filter by platform */
  platform?: string;
  /** Filter by status */
  status?: MarketStatus;
  /** Minimum liquidity in USDC */
  minLiquidity?: number;
  /** Minimum available leverage */
  minLeverage?: number;
  /** Search query */
  query?: string;
  /** Number of results (default: 50, max: 200) */
  limit?: number;
  /** Pagination offset */
  offset?: number;
}

// ── Positions ──────────────────────────────────────────────────

export type PositionStatus = "open" | "closing" | "closed" | "liquidated";
export type PositionSide = "long" | "short";

export interface Position {
  /** Unique position identifier */
  id: string;
  /** Market this position is in */
  marketId: string;
  /** Market title (denormalized for convenience) */
  marketTitle: string;
  /** Outcome being traded */
  outcomeId: string;
  /** Long or short */
  side: PositionSide;
  /** Leverage multiplier (e.g. 3.0 for 3x) */
  leverage: number;
  /** Collateral deposited in USDC */
  collateralUsdc: number;
  /** Effective notional size in USDC */
  notionalUsdc: number;
  /** Entry price of the outcome token */
  entryPrice: number;
  /** Current mark price */
  markPrice: number;
  /** Liquidation price */
  liquidationPrice: number;
  /** Unrealized PnL in USDC */
  unrealizedPnlUsdc: number;
  /** Unrealized PnL as a percentage of collateral */
  unrealizedPnlPercent: number;
  /** Current position status */
  status: PositionStatus;
  /** ISO 8601 open timestamp */
  openedAt: string;
  /** ISO 8601 close timestamp, if closed */
  closedAt?: string;
}

export interface CreatePositionParams {
  /** Market to trade */
  marketId: string;
  /** Outcome to trade */
  outcomeId: string;
  /** Long or short */
  side: PositionSide;
  /** Collateral amount in USDC */
  collateralUsdc: number;
  /** Desired leverage (e.g. 2.0 for 2x). Must be <= market maxLeverage */
  leverage: number;
  /** Maximum slippage tolerance as a decimal (e.g. 0.01 for 1%) */
  maxSlippage?: number;
}

export interface ClosePositionParams {
  /** Position to close */
  positionId: string;
  /** Fraction to close (0-1, default: 1 for full close) */
  fraction?: number;
  /** Maximum slippage tolerance */
  maxSlippage?: number;
}

// ── Leverage ───────────────────────────────────────────────────

export interface LeverageInfo {
  /** Market ID */
  marketId: string;
  /** Maximum leverage currently available */
  maxLeverage: number;
  /** Available leverage tiers and their margin requirements */
  tiers: LeverageTier[];
  /** Current funding rate (annualized) */
  fundingRateAnnualized: number;
  /** Estimated liquidation buffer at max leverage */
  liquidationBufferPercent: number;
}

export interface LeverageTier {
  /** Leverage multiplier */
  leverage: number;
  /** Initial margin requirement (e.g. 0.5 = 50%) */
  initialMargin: number;
  /** Maintenance margin (e.g. 0.25 = 25%) */
  maintenanceMargin: number;
  /** Maximum position size in USDC for this tier */
  maxPositionUsdc: number;
}

// ── Account ────────────────────────────────────────────────────

export interface Account {
  /** Account address */
  address: string;
  /** Available balance in USDC */
  balanceUsdc: number;
  /** Total collateral locked in open positions */
  lockedCollateralUsdc: number;
  /** Total unrealized PnL across all positions */
  totalUnrealizedPnlUsdc: number;
  /** Account health factor (>1 is healthy) */
  healthFactor: number;
}

// ── API Responses ──────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface TransactionResult {
  /** Transaction hash */
  txHash: string;
  /** Block number, once confirmed */
  blockNumber?: number;
  /** Whether the transaction has been confirmed */
  confirmed: boolean;
}

export interface PositionResult {
  position: Position;
  transaction: TransactionResult;
}
