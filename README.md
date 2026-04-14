# @dimes-fi/multiply-sdk

[![npm version](https://img.shields.io/npm/v/@dimes-fi/multiply-sdk)](https://www.npmjs.com/package/@dimes-fi/multiply-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

TypeScript SDK for the **Dimes Multiply** leverage protocol. Multiply is an embedded leverage layer for prediction markets — it lets traders take leveraged positions on market outcomes across platforms like Polymarket and Kalshi.

## Installation

```bash
npm install @dimes-fi/multiply-sdk
# or
pnpm add @dimes-fi/multiply-sdk
# or
yarn add @dimes-fi/multiply-sdk
```

## Quick Start

```ts
import { MultiplyClient } from "@dimes-fi/multiply-sdk";

const client = new MultiplyClient({
  apiKey: process.env.DIMES_API_KEY,
});

// Browse prediction markets with leverage
const { data: markets } = await client.getMarkets({
  platform: "polymarket",
  status: "active",
  minLeverage: 3,
});

// Open a 5x leveraged long position
const { position } = await client.createPosition({
  marketId: markets[0].id,
  outcomeId: markets[0].outcomes[0].id,
  side: "long",
  collateralUsdc: 100,
  leverage: 5,
});

console.log(`Opened ${position.leverage}x position — notional: $${position.notionalUsdc}`);
```

## API Reference

### `new MultiplyClient(config)`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `apiKey` | `string` | *required* | API key from [app.dimes.fi/developers](https://app.dimes.fi/developers) |
| `baseUrl` | `string` | `https://api.dimes.fi/v1` | API base URL |
| `chainId` | `number` | `137` | Chain ID (Polygon) |
| `timeout` | `number` | `30000` | Request timeout in ms |

### Markets

#### `client.getMarkets(filter?)`

List available prediction markets. Returns `PaginatedResponse<Market>`.

```ts
const { data, total, hasMore } = await client.getMarkets({
  platform: "polymarket",  // Filter by platform
  status: "active",        // "active" | "paused" | "resolved" | "expired"
  minLiquidity: 10_000,    // Minimum USDC liquidity
  minLeverage: 2,          // Minimum leverage available
  query: "election",       // Search query
  limit: 50,               // Results per page (max 200)
  offset: 0,               // Pagination offset
});
```

#### `client.getMarket(marketId)`

Get a single market by ID. Returns `Market`.

#### `client.getLeverage(marketId)`

Get leverage tiers, margin requirements, and funding rates for a market. Returns `LeverageInfo`.

```ts
const info = await client.getLeverage("market_abc123");
console.log(`Max leverage: ${info.maxLeverage}x`);
console.log(`Funding rate: ${info.fundingRateAnnualized}%`);

for (const tier of info.tiers) {
  console.log(`${tier.leverage}x — margin: ${tier.initialMargin * 100}%`);
}
```

### Positions

#### `client.createPosition(params)`

Open a leveraged position. Returns `PositionResult` with the position and transaction hash.

```ts
const { position, transaction } = await client.createPosition({
  marketId: "market_abc123",
  outcomeId: "outcome_yes",
  side: "long",           // "long" | "short"
  collateralUsdc: 100,    // Collateral in USDC
  leverage: 5,            // Leverage multiplier
  maxSlippage: 0.01,      // 1% slippage tolerance
});
```

#### `client.getPosition(positionId)`

Get position details including current PnL. Returns `Position`.

#### `client.getPositions(status?)`

List all positions. Optionally filter by `"open"`, `"closed"`, or `"liquidated"`.

#### `client.closePosition(params)`

Close a position fully or partially. Returns `PositionResult`.

```ts
// Close 50% of a position
await client.closePosition({
  positionId: "pos_xyz789",
  fraction: 0.5,
  maxSlippage: 0.01,
});
```

### Account

#### `client.getAccount()`

Get account summary. Returns `Account` with balance, locked collateral, unrealized PnL, and health factor.

## Types

All types are exported for use in your application:

```ts
import type {
  Market,
  Position,
  LeverageInfo,
  LeverageTier,
  CreatePositionParams,
  Account,
} from "@dimes-fi/multiply-sdk";
```

## Examples

See the [`examples/`](./examples) directory:

- **[basic-usage.ts](./examples/basic-usage.ts)** — Browse markets and check account status
- **[leverage-position.ts](./examples/leverage-position.ts)** — Open, monitor, and close a leveraged position

## Error Handling

The SDK throws `MultiplyApiError` for non-2xx responses:

```ts
import { MultiplyApiError } from "@dimes-fi/multiply-sdk";

try {
  await client.createPosition(params);
} catch (err) {
  if (err instanceof MultiplyApiError) {
    console.error(`API error ${err.statusCode}: ${err.body}`);
  }
}
```

## Links

- [Dimes website](https://dimes.fi)
- [API documentation](https://docs.dimes.fi)
- [Python SDK](https://github.com/dimes-fi/multiply-python)
- [MCP Server](https://github.com/dimes-fi/multiply-mcp)

## License

MIT
