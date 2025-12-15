import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { processIncomingDeposit } from '@/app/actions/bridge';

const webhookSchema = z.object({
  txHash: z.string().startsWith('0x'),
  from: z.string().startsWith('0x'),
  amount: z.string().regex(/^\d+$/),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate payload
    const result = webhookSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: result.error.format() },
        { status: 400 }
      );
    }

    const { txHash, from, amount } = result.data;

    console.log(`Webhook received: Deposit ${amount} USDC from ${from} in tx ${txHash}`);

    // Trigger the bridge logic
    await processIncomingDeposit(txHash, from, amount);

    return NextResponse.json({ success: true, message: 'Deposit processing initiated' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}