import { NextResponse } from 'next/server';
import { logicGates, selectLogicGate } from '@/lib/logicGates';

export async function POST(req: Request) {
  try {
    const { userAddress } = await req.json();
    
    if (!userAddress) {
      return NextResponse.json({ error: 'User address required' }, { status: 400 });
    }

    const logicType = selectLogicGate(userAddress);
    const gate = logicGates[logicType];
    const { payload } = gate.generate();
    
    const challengeId = crypto.randomUUID();
    const nonce = crypto.randomUUID();

    // Note: In prod, these would be stored in Redis (Upstash)
    // For now, we return them to the client to simulate the flow
    return NextResponse.json({
      challengeId,
      logicType,
      payload,
      nonce,
      expiresAt: Date.now() + 300000, // 5 minutes
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
