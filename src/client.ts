/**
 * Dimes Multiply SDK — Client
 *
 * The MultiplyClient provides programmatic access to the Dimes Multiply
 * leverage protocol for prediction markets. It supports querying markets,
 * opening and managing leveraged positions, and retrieving account data.
 *
 * @example
 * ```ts
 * import { MultiplyClient } from "@dimes-fi/multiply-sdk";
 *
 * const client = new MultiplyClient({ apiKey: "your-api-key" });
 * const markets = await client.getMarkets({ minLeverage: 3 });
 * ```
 */

import type {
  MultiplyConfig,
  Market,
  MarketFilter,
  Position,
  CreatePositionParams,
  ClosePositionParams,
  LeverageInfo,
  Account,
  PaginatedResponse,
  PositionResult,
} from "./types";

const DEFAULT_BASE_URL = "https://api.dimes.fi/v1";
const DEFAULT_TIMEOUT = 30_000;

export class MultiplyClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly chainId: number;
  private readonly timeout: number;

  constructor(config: MultiplyConfig) {
    if (!config.apiKey) {
      throw new Error(
        "API key is required. Get one at https://app.dimes.fi/developers"
      );
    }
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    this.chainId = config.chainId ?? 137;
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
  }

  // ── Markets ────────────────────────────────────────────────

  /**
   * List available prediction markets with optional filters.
   *
   * @param filter - Optional filters for platform, status, liquidity, leverage
   * @returns Paginated list of markets
   *
   * @example
   * ```ts
   * // Get all active Polymarket markets with >= 5x leverage available
   * const markets = await client.getMarkets({
   *   platform: "polymarket",
   *   status: "active",
   *   minLeverage: 5,
   * });
   * ```
   */
  async getMarkets(
    filter?: MarketFilter
  ): Promise<PaginatedResponse<Market>> {
    return this.request("GET", "/markets", filter);
  }

  /**
   * Get a single market by ID.
   *
   * @param marketId - The market identifier
   * @returns Market details including outcomes and leverage info
   */
  async getMarket(marketId: string): Promise<Market> {
    return this.request("GET", `/markets/${marketId}`);
  }

  /**
   * Get leverage information for a specific market, including
   * available tiers, margin requirements, and funding rates.
   *
   * @param marketId - The market identifier
   * @returns Leverage tiers and parameters
   *
   * @example
   * ```ts
   * const info = await client.getLeverage("market_abc123");
   * console.log(`Max leverage: ${info.maxLeverage}x`);
   * console.log(`Funding rate: ${info.fundingRateAnnualized}%`);
   * ```
   */
  async getLeverage(marketId: string): Promise<LeverageInfo> {
    return this.request("GET", `/markets/${marketId}/leverage`);
  }

  // ── Positions ──────────────────────────────────────────────

  /**
   * Open a new leveraged position on a prediction market outcome.
   *
   * @param params - Position parameters (market, outcome, side, collateral, leverage)
   * @returns The created position and transaction details
   *
   * @example
   * ```ts
   * const result = await client.createPosition({
   *   marketId: "market_abc123",
   *   outcomeId: "outcome_yes",
   *   side: "long",
   *   collateralUsdc: 100,
   *   leverage: 3,
   *   maxSlippage: 0.01,
   * });
   * console.log(`Position opened: ${result.position.id}`);
   * console.log(`Notional: $${result.position.notionalUsdc}`);
   * ```
   */
  async createPosition(
    params: CreatePositionParams
  ): Promise<PositionResult> {
    return this.request("POST", "/positions", params);
  }

  /**
   * Get details of an open or closed position.
   *
   * @param positionId - The position identifier
   * @returns Full position details including current PnL
   */
  async getPosition(positionId: string): Promise<Position> {
    return this.request("GET", `/positions/${positionId}`);
  }

  /**
   * List all positions for the authenticated account.
   *
   * @param status - Optional filter by position status
   * @returns Paginated list of positions
   */
  async getPositions(
    status?: "open" | "closed" | "liquidated"
  ): Promise<PaginatedResponse<Position>> {
    const params = status ? { status } : undefined;
    return this.request("GET", "/positions", params);
  }

  /**
   * Close an existing position fully or partially.
   *
   * @param params - Close parameters (positionId, optional fraction)
   * @returns Updated position and transaction details
   *
   * @example
   * ```ts
   * // Close 50% of a position
   * const result = await client.closePosition({
   *   positionId: "pos_xyz789",
   *   fraction: 0.5,
   * });
   * ```
   */
  async closePosition(
    params: ClosePositionParams
  ): Promise<PositionResult> {
    return this.request(
      "POST",
      `/positions/${params.positionId}/close`,
      { fraction: params.fraction ?? 1, maxSlippage: params.maxSlippage }
    );
  }

  // ── Account ────────────────────────────────────────────────

  /**
   * Get account summary including balance, locked collateral,
   * and health factor.
   *
   * @returns Account details
   */
  async getAccount(): Promise<Account> {
    return this.request("GET", "/account");
  }

  // ── Internal ───────────────────────────────────────────────

  private async request<T>(
    method: string,
    path: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    const init: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "X-Chain-Id": String(this.chainId),
        "User-Agent": `dimes-multiply-sdk/0.4.2`,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    if (method === "GET" && params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    } else if (params) {
      init.body = JSON.stringify(params);
    }

    const response = await fetch(url.toString(), init);

    if (!response.ok) {
      const body = await response.text();
      throw new MultiplyApiError(response.status, body, path);
    }

    return response.json() as Promise<T>;
  }
}

/**
 * Error thrown when the Multiply API returns a non-2xx response.
 */
export class MultiplyApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly body: string,
    public readonly path: string
  ) {
    super(`Multiply API error ${statusCode} on ${path}: ${body}`);
    this.name = "MultiplyApiError";
  }
}
