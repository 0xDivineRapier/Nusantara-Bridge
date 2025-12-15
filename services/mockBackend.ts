
import { parseUnits } from 'viem';
import { BridgeStatus, Transaction, Currency, KYCStatus } from '../types';

export const createBridgeTransaction = async (
  amount: string,
  currency: Currency,
  targetBank: string,
  accountNumber: string,
  conversionRate: number
): Promise<Transaction> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate BigInt Math
      // Assuming currency is ETH (18 decimals) for this mock
      const amountBN = parseUnits(amount, 18);
      const rateBN = BigInt(Math.floor(conversionRate));
      
      // Calculate Gross IDR (Wei * Rate) / 1e18
      const grossIdrBN = (amountBN * rateBN) / 1000000000000000000n;
      
      // Fee 0.5%
      const feeBN = (grossIdrBN * 50n) / 10000n;
      const netIdrBN = grossIdrBN - feeBN;

      const now = new Date();

      resolve({
        id: `tx_${Math.random().toString(36).substr(2, 9)}`,
        depositTxHash: `0x${Math.random().toString(36).substr(2, 40)}`,
        clientWalletAddress: `0x${Math.random().toString(36).substr(2, 40)}`,
        usdcAmount: amount, // Keeping as string for frontend type
        exchangeRate: conversionRate.toString(),
        idrAmount: netIdrBN.toString(),
        indodaxOrderId: `idx_${Math.random().toString(36).substr(2, 8)}`,
        xenditPayoutId: `xen_${Math.random().toString(36).substr(2, 12)}`,
        status: BridgeStatus.PENDING_DEPOSIT,
        createdAt: now,
        updatedAt: now,
      });
    }, 1500);
  });
};

/**
 * Simulates the KYC submission and regulatory review process.
 * 
 * @param warungId - Identifier for the business
 * @param documents - Mock document objects
 * @returns Promise resolving to the final KYC status after delay
 */
export const submitKYC = async (warungId: string, documents: any): Promise<{ status: KYCStatus; reason?: string }> => {
  console.log(`[MockBackend] KYC Submitted for Warung ${warungId} at ${new Date().toISOString()}`);
  console.log(`[MockBackend] Documents received:`, documents);

  // Simulate Network Delay and Manual Review Process (3 seconds)
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Random outcome: 80% Success, 20% Reject
  const isApproved = Math.random() < 0.8;

  if (isApproved) {
    console.log(`[MockBackend] KYC VERIFIED for ${warungId}`);
    return { status: KYCStatus.VERIFIED };
  } else {
    console.log(`[MockBackend] KYC REJECTED for ${warungId}`);
    const reasons = [
      "KTP image is blurry or unreadable.",
      "Shop front photo does not match registered address.",
      "Identity verification failed against Dukcapil database."
    ];
    const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
    return { status: KYCStatus.REJECTED, reason: randomReason };
  }
};
