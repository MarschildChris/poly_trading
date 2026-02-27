#!/usr/bin/env npx tsx
/**
 * Test: DipArbService - Scan for ETH 15m markets
 */

import { PolymarketSDK } from '@catalyst-team/poly-sdk';

async function main() {
  //console.log('=== Testing DipArbService Market Scan ===\n');

  // Initialize SDK (no private key needed for scanning)
  //console.log('Initializing SDK...');
  const sdk = new PolymarketSDK();
  //console.log('SDK initialized\n');

  // Test 1: Scan for BTC 5m markets
  //console.log('--- Test 1: Scan for BTC 5m markets ---');
  const btcMarkets = await sdk.dipArb.scanUpcomingMarkets({
    coin: 'BTC',
    duration: '5m',
    minMinutesUntilEnd: 1,
    maxMinutesUntilEnd: 5,
    limit: 1,
  });

  //console.log(`Found ${btcMarkets.length} BTC 5m markets:\n`);

  if (btcMarkets.length === 0) {
      console.log('No btc 5m markets found.\n');
  } else {
    btcMarkets.forEach((m, i) => {
      const minutesLeft = Math.round((m.endTime.getTime() - Date.now()) / 60000);
      //console.log(`${i + 1}. ${m.name}`);
      //console.log(`   Slug: ${m.slug}`);
      console.log(`${m.conditionId}`);
      //console.log(`   UP Token: ${m.upTokenId}`);
      //console.log(`   DOWN Token: ${m.downTokenId}`);
      //console.log(`   Underlying: ${m.underlying}`);
      //console.log(`   Duration: ${m.durationMinutes}m`);
      //console.log(`   Ends in: ${minutesLeft} minutes`);
      //console.log(`   End Time: ${m.endTime.toLocaleString()}`);
      //console.log();
    });
  }
/*
  // Test 2: Scan for all coin types
  console.log('--- Test 2: Scan for all coin 15m markets ---');
  const allMarkets = await sdk.dipArb.scanUpcomingMarkets({
    coin: 'all',
    duration: '15m',
    minMinutesUntilEnd: 5,
    maxMinutesUntilEnd: 60,
    limit: 10,
  });

  console.log(`Found ${allMarkets.length} total 15m markets:\n`);

  const byUnderlying: Record<string, number> = {};
  allMarkets.forEach(m => {
    byUnderlying[m.underlying] = (byUnderlying[m.underlying] || 0) + 1;
  });

  console.log('By underlying:');
  Object.entries(byUnderlying).forEach(([coin, count]) => {
    console.log(`  ${coin}: ${count} markets`);
  });
  console.log();
  
 

  // Test 3: Try findAndStart (without actually starting)
  console.log('--- Test 2: Find best BTC market ---');

  // We'll use scanUpcomingMarkets to simulate what findAndStart would select
  const bestEthMarket = btcMarkets[0];
  if (bestEthMarket) {
    console.log(`Best BTC market would be: ${bestEthMarket.slug}`);
    console.log(`  Ends in: ${Math.round((bestEthMarket.endTime.getTime() - Date.now()) / 60000)} minutes`);
  } else {
    console.log('No BTC market available for selection');
  }


  console.log('\n=== Scan Test Complete ===');
  */
  
}
  

main().catch(console.error);