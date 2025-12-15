import 'server-only';
import { z } from 'zod';
import { Buffer } from 'buffer';

const XENDIT_SECRET = process.env.XENDIT_SECRET;

// Mapping of internal bank codes to Xendit Channel Codes
// Reference: https://developers.xendit.co/api-reference/payouts/channel-codes
export const XENDIT_CHANNEL_CODES: Record<string, string> = {
  // --- State-Owned Banks (Himbara) ---
  'BCA': 'ID_BCA',
  'MANDIRI': 'ID_MANDIRI',
  'BRI': 'ID_BRI',
  'BNI': 'ID_BNI',
  'BTN': 'ID_BTN',
  'BSI': 'ID_BSI', // Bank Syariah Indonesia

  // --- Private & Commercial Banks ---
  'CIMB': 'ID_CIMB',
  'PERMATA': 'ID_PERMATA',
  'DANAMON': 'ID_DANAMON',
  'DBS': 'ID_DBS',
  'MAYBANK': 'ID_MAYBANK',
  'MEGA': 'ID_MEGA',
  'OCBC': 'ID_OCBC',
  'PANIN': 'ID_PANIN',
  'SINARMAS': 'ID_SINARMAS',
  'UOB': 'ID_UOB',
  'BUKOPIN': 'ID_BUKOPIN',
  
  // --- Digital Banks ---
  'BTPN': 'ID_BTPN',   // Jenius
  'JAGO': 'ID_JAGO',   // Bank Jago
  'NEO': 'ID_NEO',     // Bank Neo Commerce
  'SEABANK': 'ID_SEABANK',
  'ALADIN': 'ID_ALADIN',

  // --- Syariah Units ---
  'BCA_SYARIAH': 'ID_BCA_SYR',
  'CIMB_SYARIAH': 'ID_CIMB_SYR',

  // --- E-Wallets ---
  'GOPAY': 'ID_GOPAY',
  'OVO': 'ID_OVO',
  'DANA': 'ID_DANA',
  'SHOPEEPAY': 'ID_SHOPEEPAY',
  'LINKAJA': 'ID_LINKAJA',
  'SAKUKU': 'ID_SAKUKU'
};

// Zod Schema for Xendit Payouts V2 Response
const PayoutResponseSchema = z.object({
  id: z.string(),
  external_id: z.string(),
  amount: z.number(),
  channel_code: z.string(),
  status: z.string(),
  created: z.string().optional(),
  updated: z.string().optional(),
});

export type PayoutResponse = z.infer<typeof PayoutResponseSchema>;

/**
 * Create a payout using Xendit Payouts API V2
 * 
 * @param externalId - Unique transaction ID for idempotency
 * @param amount - Amount in IDR (BigInt). Converted to integer.
 * @param bankCode - Bank code (e.g. "BCA", "MANDIRI")
 * @param accountNum - Destination account number
 * @param accountName - Destination account holder name
 */
export async function createPayout(
  externalId: string,
  amount: bigint,
  bankCode: string,
  accountNum: string,
  accountName: string
): Promise<PayoutResponse> {
  if (!XENDIT_SECRET) {
    throw new Error("Missing Xendit API Secret (XENDIT_SECRET)");
  }

  // Safety check for JS number precision (IDR usually fits, but good to be safe)
  // Number.MAX_SAFE_INTEGER is 9,007,199,254,740,991
  if (amount > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("Amount exceeds JavaScript MAX_SAFE_INTEGER - Cannot safely convert to Number for Xendit API");
  }
  
  const integerAmount = Number(amount);

  // Map bank code to Xendit Channel Code using explicit mapping
  const normalizedBankCode = bankCode.toUpperCase();
  const channelCode = XENDIT_CHANNEL_CODES[normalizedBankCode];

  if (!channelCode) {
    const supported = Object.keys(XENDIT_CHANNEL_CODES).slice(0, 5).join(', ') + '...';
    throw new Error(`Unsupported or Invalid Bank Code: ${bankCode}. Example supported codes: ${supported}`);
  }

  const payload = {
    external_id: externalId,
    amount: integerAmount,
    currency: "IDR",
    channel_code: channelCode,
    channel_properties: {
      account_holder_name: accountName,
      account_number: accountNum,
    },
    description: `Nusantara Bridge Payout ${externalId}`,
  };

  // Basic Auth: secret + ':' base64 encoded
  const authString = Buffer.from(XENDIT_SECRET + ':').toString('base64');

  const response = await fetch('https://api.xendit.co/v2/payouts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${authString}`,
      'Idempotency-Key': externalId, // Critical for idempotency
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Xendit Payout Failed [${response.status}]: ${errorBody}`);
  }

  const data = await response.json();
  
  // Validate response structure
  return PayoutResponseSchema.parse(data);
}