import { createPublicClient, http, parseAbiItem, formatUnits, Log } from 'viem';
import { sepolia } from 'viem/chains';

// --- Configuration ---
const RPC_URL = process.env.RPC_URL || 'https://rpc.sepolia.org';
const MY_DEPOSIT_WALLET = process.env.MY_DEPOSIT_WALLET;
const USDC_SEPOLIA_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

// Validate Environment
if (!MY_DEPOSIT_WALLET || !MY_DEPOSIT_WALLET.startsWith('0x')) {
  console.error("Error: process.env.MY_DEPOSIT_WALLET is not defined or invalid.");
  (process as any).exit(1);
}

// --- Logic ---

/**
 * Stub function to process the bridge transaction.
 * In production, this would call a Server Action or Webhook.
 */
async function processBridgeTransaction(txHash: string, from: string, amount: bigint) {
  console.log(`[Stub] Processing Bridge Transaction...`);
  console.log(`       Tx: ${txHash}`);
  console.log(`       Sender: ${from}`);
  console.log(`       Amount (Atomic): ${amount.toString()}`);
  console.log(`       Amount (Formatted): ${formatUnits(amount, 6)} USDC`);
  
  // TODO: Implement actual bridge logic (DB insert, Indodax trade, Xendit payout)
  return Promise.resolve(true);
}

async function main() {
  const client = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL),
  });

  console.log(`Starting Sepolia Bridge Watcher...`);
  console.log(`Target Wallet: ${MY_DEPOSIT_WALLET}`);
  console.log(`Contract: ${USDC_SEPOLIA_ADDRESS}`);

  // Event ABI: Transfer(address indexed from, address indexed to, uint256 value)
  const transferEvent = parseAbiItem(
    'event Transfer(address indexed from, address indexed to, uint256 value)'
  );

  // Watch for events
  const unwatch = client.watchContractEvent({
    address: USDC_SEPOLIA_ADDRESS,
    abi: [transferEvent],
    eventName: 'Transfer',
    args: {
      to: MY_DEPOSIT_WALLET as `0x${string}`,
    },
    onLogs: async (logs) => {
      for (const log of logs) {
        const { transactionHash, args } = log;
        const { from, value } = args;

        // Strict null checks
        if (!transactionHash || !from || value === undefined) {
          console.warn('Skipping log with missing arguments', log);
          continue;
        }

        console.log(`\n[Event Detected] Tx: ${transactionHash}`);
        
        try {
          await processBridgeTransaction(transactionHash, from, value);
        } catch (err) {
          console.error(`[Error] Failed to process transaction ${transactionHash}:`, err);
        }
      }
    },
    onError: (error) => {
      console.error('[Watcher Error]', error);
    }
  });

  // Graceful Shutdown
  const shutdown = () => {
    console.log('\nStopping watcher...');
    unwatch();
    (process as any).exit(0);
  };

  (process as any).on('SIGINT', shutdown);
  (process as any).on('SIGTERM', shutdown);
}

// Execute
main().catch((err) => {
  console.error('Fatal Error:', err);
  (process as any).exit(1);
});