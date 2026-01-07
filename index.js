import { PolymarketSDK } from '@catalyst-team/poly-sdk';

async function main() {
  // 初始化 SDK（只读，无需私钥）
  const sdk = await PolymarketSDK.create({
    chainId: 137
  });

  // ❗不要硬编码 slug，动态获取
  const markets = await sdk.markets.getMarkets({
    active: true,
    limit: 1
  });

  if (!markets.length) {
    console.log('No active markets');
    sdk.stop();
    return;
  }

  const market = markets[0];
  const conditionId = market.conditionId;

  console.log('Market:', market.question);

  // ===== K 线 =====
  const klines = await sdk.markets.getKLines(conditionId, '1h', { limit: 100 });
  console.log('KLines:', klines.slice(0, 3));

  // ===== 双 K 线（YES + NO）=====
  const dual = await sdk.markets.getDualKLines(conditionId, '1h');
  console.log('YES candles:', dual.yes.slice(0, 2));
  console.log('NO candles:', dual.no.slice(0, 2));
  console.log('Historical spread:', dual.spreadAnalysis);
  console.log('Realtime spread:', dual.realtimeSpread);

  // ===== 处理后的订单簿 =====
  const orderbook = await sdk.markets.getProcessedOrderbook(conditionId);
  console.log('Orderbook summary:', orderbook.summary);

  // ===== 快速实时价差 =====
  const spread = await sdk.markets.getRealtimeSpread(conditionId);
  if (spread.longArbProfit > 0.005) {
    console.log(
      `多头套利: 买 YES@${spread.yesAsk} + NO@${spread.noAsk}`
    );
  }

  // ===== 市场信号 =====
  const signals = await sdk.markets.detectMarketSignals(conditionId);
  console.log('Signals:', signals);

  // 清理（必须）
  sdk.stop();
}

main().catch(console.error);
