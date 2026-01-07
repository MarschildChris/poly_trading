import { ArbitrageService } from '@catalyst-team/poly-sdk';

async function main() {
  const arb = new ArbitrageService({
    autoExecute: false,        // 🔒 read-only
    profitThreshold: 0.003,    // 0.3%
    minTradeSize: 5,
    maxTradeSize: 100,

    // explicitly disable wallet features
    enableRebalancer: false,
    privateKey: undefined,
    rpcUrl: undefined,
  });

  arb.on('opportunity', (op) => {
    console.log('------------------------------');
    console.log(`Market: ${op.market.question}`);
    console.log(`Type: ${op.type}`);
    console.log(`Profit: ${(op.profit * 100).toFixed(2)}%`);
    console.log(`YES price: ${op.yesPrice}`);
    console.log(`NO price: ${op.noPrice}`);
    console.log(`Spread: ${(1 - op.yesPrice - op.noPrice).toFixed(4)}`);
  });

  arb.on('scan', (info) => {
    console.log(
      `[SCAN] markets=${info.marketCount} checked=${info.checked}`
    );
  });

  console.log('🔍 Starting arbitrage scanner (READ-ONLY)');
  await arb.start();

  // keep alive
  process.stdin.resume();
}

main().catch(console.error);

