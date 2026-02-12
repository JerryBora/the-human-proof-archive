import { NextResponse } from 'next/server';
import { logicGates, selectLogicGate } from '@/lib/logicGates';
import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_URL ? new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
}) : null;

export async function POST(req: Request) {
  try {
    const { userAddress } = await req.json();
    
    if (!userAddress) {
      return NextResponse.json({ error: 'User address required' }, { status: 400 });
    }

    const logicType = selectLogicGate(userAddress);
    const gate = logicGates[logicType];
    const { payload, solution } = gate.generate();
    
    const challengeId = crypto.randomUUID();
    const nonce = crypto.randomUUID();

    // Production: Store challenge in Redis
    if (redis) {
      await redis.set(`challenge:${challengeId}`, {
        id: challengeId,
        userAddress,
        logicType,
        payload,
        expiresAt: Date.now() + 300000
      }, { ex: 600 });
      
      await redis.set(`solution:${challengeId}`, solution, { ex: 600 });
    }

    return NextResponse.json({
      challengeId,
      logicType,
      payload,
      nonce,
      expiresAt: Date.now() + 300000,
    });
  } catch (error) {
    console.error('Challenge Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

