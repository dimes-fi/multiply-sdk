/**
 * Opening and managing a leveraged prediction market position
 * using the Dimes Multiply SDK.
 *
 * This example demonstrates:
 * 1. Finding a market and checking leverage tiers
 * 2. Opening a leveraged long position
 * 3. Monitoring PnL
 * 4. Partially closing the position
 *
 * Run: npx ts-node examples/leverage-position.ts
 */

import { MultiplyClient } from "@dimes-fi/multiply-sdk";

async function main() {
  const client = new MultiplyClient({
    apiKey: process.env.DIMES_API_KEY!,
  });

  // ── Step 1: Find a market and check leverage availability ──

  const { data: markets } = await client.getMarkets({
    platform: "polymarket",
    status: "active",
    minLeverage: 5,
    minLiquidity: 50_000,
    limit: 1,
  });

  if (markets.length === 0) {
    console.log("No markets found matching criteria.");
    return;
  }

  const market = markets[0];
  console.log(`Selected market: ${market.title}`);
  console.log(`Max leverage: ${market.maxLeverage}x\n`);

  // Check leverage tiers for this market
  const leverageInfo = await client.getLeverage(market.id);
  console.log("Leverage tiers:");
  for (const tier of leverageInfo.tiers) {
    console.log(
      `  ${tier.leverage}x — ` +
      `initial margin: ${(tier.initialMargin * 100).toFixed(0)}%, ` +
      `maintenance: ${(tier.maintenanceMargin * 100).toFixed(0)}%, ` +
      `max size: $${tier.maxPositionUsdc.toLocaleString()}`
    );
  }
  console.log(
    `Funding rate (annualized): ${leverageInfo.fundingRateAnnualized}%\n`
  );

  // ── Step 2: Open a 5x leveraged long on "Yes" ──

  const yesOutcome = market.outcomes.find((o) => o.label === "Yes");
  if (!yesOutcome) {
    console.log("No 'Yes' outcome found.");
    return;
  }

  console.log(
    `Opening 5x long on "${yesOutcome.label}" at ${(yesOutcome.price * 100).toFixed(1)}%...`
  );

  const { position, transaction } = await client.createPosition({
    marketId: market.id,
    outcomeId: yesOutcome.id,
    side: "long",
    collateralUsdc: 100,
    leverage: 5,
    maxSlippage: 0.01,
  });

  console.log(`Position opened: ${position.id}`);
  console.log(`  Collateral: $${position.collateralUsdc}`);
  console.log(`  Notional: $${position.notionalUsdc}`);
  console.log(`  Entry price: ${position.entryPrice}`);
  console.log(`  Liquidation price: ${position.liquidationPrice}`);
  console.log(`  Tx: ${transaction.txHash}\n`);

  // ── Step 3: Check current PnL ──

  const current = await client.getPosition(position.id);
  console.log("Current status:");
  console.log(`  Mark price: ${current.markPrice}`);
  console.log(`  Unrealized PnL: $${current.unrealizedPnlUsdc.toFixed(2)}`);
  console.log(
    `  PnL %: ${current.unrealizedPnlPercent.toFixed(2)}%\n`
  );

  // ── Step 4: Close 50% of the position ──

  console.log("Closing 50% of position...");
  const closeResult = await client.closePosition({
    positionId: position.id,
    fraction: 0.5,
    maxSlippage: 0.01,
  });

  console.log(
    `Remaining notional: $${closeResult.position.notionalUsdc}`
  );
  console.log(`Close tx: ${closeResult.transaction.txHash}`);
}

main().catch(console.error);
