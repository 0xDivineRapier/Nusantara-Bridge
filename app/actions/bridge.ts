'use server';

import 'server-only';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { executeSell, getBestBid } from '@/lib/indodax';
import { createPayout } from '@/lib/xendit';
import { BridgeStatus } from '@/types';

// Validation Schema
const processDepositSchema = z.object({
  txHash: z.string().min(10),
  from: z.string().min(10),
  amount: z.string().regex(/^\d+$/, "Amount must be a numeric string (BigInt)"),
});

// Constants using BigInt for precision
const FEE_BASIS_POINTS = 50n; // 0.5% = 50 basis points
const BASIS_POINTS_DIVISOR = 10000n;
const USDC_DECIMALS = 6;
const USDC_UNIT = 10n ** BigInt(USDC_DECIMALS);

/**
 * Process an incoming blockchain deposit.
 * Lifecycle: DEPOSIT_CONFIRMED -> EXCHANGED -> PAYOUT_INITIATED
 */
export async function processIncomingDeposit(txHash: string, from: string, amount: string) {
  // 1. Validation
  const input = processDepositSchema.parse({ txHash, from, amount });

  // 2. Idempotency Check
  const existingTx = await prisma.transaction.findUnique({
    where: { depositTxHash: input.txHash },
  });

  if (existingTx) {
    console.log(`Transaction ${input.txHash} already processed.`);
    return;
  }

  // 3. Create Transaction Record (DEPOSIT_CONFIRMED)
  // Since we received the webhook from the watcher, the deposit is confirmed on chain.
  const usdcBigInt = BigInt(input.amount);
  
  // Fetch Best Bid to calculate rate
  const bestBidPrice = await getBestBid('usdc_idr');
  const rateBigInt = BigInt(Math.floor(bestBidPrice)); // Price per 1 full USDC
  
  // Calculate estimated IDR for the record
  // Formula: (USDC_Atomic / 1e6) * Rate_Per_USDC
  const grossIdr = (usdcBigInt * rateBigInt) / USDC_UNIT;
  const netIdr = (grossIdr * (BASIS_POINTS_DIVISOR - FEE_BASIS_POINTS)) / BASIS_POINTS_DIVISOR;

  let transaction = await prisma.transaction.create({
    data: {
      depositTxHash: input.txHash,
      clientWalletAddress: input.from,
      usdcAmount: usdcBigInt,
      exchangeRate: bestBidPrice,
      idrAmount: netIdr,
      status: BridgeStatus.DEPOSIT_CONFIRMED,
    },
  });

  try {
    // 4. Execute Trade (Indodax)
    // We sell into the bid we just saw (or current best).
    const indodaxOrderId = await executeSell('usdc_idr', usdcBigInt, bestBidPrice);

    // Update DB to EXCHANGED
    transaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        indodaxOrderId,
        status: BridgeStatus.EXCHANGED,
      },
    });

    // 5. Send Payout (Xendit)
    const mockDestination = {
      bank: 'BCA',
      number: '1234567890',
      name: 'Simulated Beneficiary',
    };

    const payout = await createPayout(
      transaction.id, 
      netIdr, 
      mockDestination.bank, 
      mockDestination.number, 
      mockDestination.name
    );

    // 6. Update DB to PAYOUT_INITIATED
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        xenditPayoutId: payout.external_id,
        status: BridgeStatus.PAYOUT_INITIATED,
      },
    });

    console.log(`Bridge success for ${txHash}: Payout ${payout.id} initiated.`);

  } catch (error) {
    console.error(`Bridge failed for ${txHash}:`, error);
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: BridgeStatus.FAILED },
    });
    throw error;
  }
}