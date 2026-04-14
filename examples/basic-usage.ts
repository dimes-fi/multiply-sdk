/**
 * Basic usage of the Dimes Multiply SDK.
 *
 * This example shows how to connect to the Multiply API,
 * browse prediction markets, and check your account status.
 *
 * Run: npx ts-node examples/basic-usage.ts
 */

import { MultiplyClient } from "@dimes-fi/multiply-sdk";

async function main() {
  // Initialize the client with your API key
  const client = new MultiplyClient({
    apiKey: process.env.DIMES_API_KEY!,
  });

  // Fetch active prediction markets with leverage available
  const { data: markets, total } = await client.getMarkets({
    status: "active",
    minLeverage: 2,
    limit: 10,
  });

  console.log(`Found ${total} markets with 2x+ leverage available\n`);

  for (const market of markets) {
    console.log(`${market.title}`);
    console.log(`  Platform: ${market.platform}`);
    console.log(`  Max leverage: ${market.maxLeverage}x`);
    console.log(`  Liquidity: $${market.liquidityUsdc.toLocaleString()}`);
    console.log(`  Outcomes:`);
    for (const outcome of market.outcomes) {
      console.log(`    ${outcome.label}: ${(outcome.price * 100).toFixed(1)}%`);
    }
    console.log();
  }

  // Check account status
  const account = await client.getAccount();
  console.log("Account summary:");
  console.log(`  Balance: $${account.balanceUsdc}`);
  console.log(`  Locked collateral: $${account.lockedCollateralUsdc}`);
  console.log(`  Unrealized PnL: $${account.totalUnrealizedPnlUsdc}`);
  console.log(`  Health factor: ${account.healthFactor}`);
}

main().catch(console.error);
