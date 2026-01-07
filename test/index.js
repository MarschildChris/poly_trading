import { PolymarketSDK } from '@catalyst-team/poly-sdk';

// 只读操作无需认证
const sdk = new PolymarketSDK();

async function main() {
  // ❗ DO NOT hardcode slugs
  const markets = await sdk.getMarket({
    active: true,
    limit: 5
  });

  if (!markets.length) {
    console.log('No active markets found');
    return;
  }

  const market = markets[0]; // use an actual active market

  console.log(market.question);
  console.log(
    'YES:',
    market.tokens.find(t => t.outcome === 'Yes')?.price
  );
  console.log(
    'NO:',
    market.tokens.find(t => t.outcome === 'No')?.price
  );

  const orderbook = await sdk.getOrderbook(market.conditionId);
  console.log('多头套利利润:', orderbook.summary.longArbProfit);
  console.log('空头套利利润:', orderbook.summary.shortArbProfit);

  const arb = await sdk.detectArbitrage(market.conditionId);
  if (arb) {
    console.log(
      `${arb.type.toUpperCase()} 套利: ${(arb.profit * 100).toFixed(2)}%`
    );
    console.log(arb.action);
  }
}

main().catch(console.error);

