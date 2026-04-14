/**
 * @dimes-fi/multiply-sdk
 *
 * TypeScript SDK for the Dimes Multiply leverage protocol.
 * Multiply is an embedded leverage layer for prediction markets —
 * it lets traders take leveraged positions on market outcomes
 * across platforms like Polymarket and Kalshi.
 *
 * @example
 * ```ts
 * import { MultiplyClient } from "@dimes-fi/multiply-sdk";
 *
 * const client = new MultiplyClient({
 *   apiKey: process.env.DIMES_API_KEY!,
 * });
 *
 * // Browse leveraged prediction markets
 * const { data: markets } = await client.getMarkets({
 *   platform: "polymarket",
 *   status: "active",
 *   minLeverage: 3,
 * });
 *
 * // Open a 5x leveraged long position
 * const { position } = await client.createPosition({
 *   marketId: markets[0].id,
 *   outcomeId: markets[0].outcomes[0].id,
 *   side: "long",
 *   collateralUsdc: 50,
 *   leverage: 5,
 * });
 *
 * console.log(`Opened ${position.leverage}x position on "${position.marketTitle}"`);
 * console.log(`Notional: $${position.notionalUsdc} | Entry: ${position.entryPrice}`);
 * ```
 *
 * @packageDocumentation
 */

export { MultiplyClient, MultiplyApiError } from "./client";

export type {
  MultiplyConfig,
  Market,
  MarketFilter,
  MarketStatus,
  OutcomeType,
  Outcome,
  Position,
  PositionStatus,
  PositionSide,
  CreatePositionParams,
  ClosePositionParams,
  LeverageInfo,
  LeverageTier,
  Account,
  PaginatedResponse,
  TransactionResult,
  PositionResult,
} from "./types";
